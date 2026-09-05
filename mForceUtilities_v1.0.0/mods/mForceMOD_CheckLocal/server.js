const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const plist = require('plist');
const os = require('os');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = 3000;

// AUDIT (G1): this is a LOCAL tool (scans local files/network, key in ~/.fxspy_key).
// Lock the wide-open cors() so a website you visit can't drive localhost via your
// browser, and fail CLOSED if this is ever served from a public host. Local use
// (localhost/127.0.0.1) is unaffected. (SEC-MOD-GATE)
app.use(cors({ origin: false }));           // same-origin only — no cross-origin browser access
app.use(express.json());
app.use((req, res, next) => {
  if (!req.path.startsWith('/api/') || req.path === '/api/health') return next();
  const h = String(req.hostname || '');
  const isLocal = h === 'localhost' || h === '127.0.0.1' || h.endsWith('.local');
  if (isLocal) return next();                // local desktop tool — allow
  const key = process.env.MFORCE_API_KEY;
  if (key && req.get('X-MForce-Auth') === key) return next();  // service call on a public host
  return res.status(401).json({ error: 'unauthorized', code: 'LOCAL_TOOL_PUBLIC' });
});
app.use(express.static('public'));

// Local key storage (in-memory for session, or simple file for persistence)
// For a local tool, saving to a hidden file in user home is common practice.
const KEY_FILE = path.join(os.homedir(), '.fxspy_key');
const KNOWLEDGE_FILE = path.join(__dirname, 'known_items.json'); // persistence file
let cachedKey = null;

if (fs.existsSync(KEY_FILE)) {
    try { cachedKey = fs.readFileSync(KEY_FILE, 'utf8').trim(); } catch (e) { }
}

// Helpers for Knowledge Base
function getKnowledgeBase() {
    try {
        if (fs.existsSync(KNOWLEDGE_FILE)) {
            return JSON.parse(fs.readFileSync(KNOWLEDGE_FILE, 'utf8'));
        }
    } catch (e) {
        console.error("Failed to read FB:", e);
    }
    return {};
}

function saveToKnowledgeBase(itemName, analysisData) {
    try {
        const kb = getKnowledgeBase();
        kb[itemName] = analysisData;
        fs.writeFileSync(KNOWLEDGE_FILE, JSON.stringify(kb, null, 2));
    } catch (e) {
        console.error("Failed to save to KB:", e);
    }
}

// Routes for API Key
app.get('/api/get-key', (req, res) => {
    res.json({ hasKey: !!cachedKey });
});

app.post('/api/save-key', (req, res) => {
    const { apiKey } = req.body;
    if (!apiKey) return res.status(400).json({ error: "No key provided" });

    cachedKey = apiKey;
    try {
        fs.writeFileSync(KEY_FILE, apiKey, { mode: 0o600 }); // Secure perms
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Failed to save key locally" });
    }
});

// Analyze Item with Gemini
app.post('/api/analyze', async (req, res) => {
    const { item } = req.body;

    // 1. Check Local Knowledge Base (File)
    const kb = getKnowledgeBase();
    if (kb[item.name]) {
        console.log(`[Cache Hit] Serving ${item.name} from disk.`);
        return res.json(kb[item.name]);
    }

    // 2. If not found, ask Gemini
    if (!cachedKey) {
        return res.status(401).json({ error: "API Key not configured" });
    }

    try {
        const genAI = new GoogleGenerativeAI(cachedKey);
        // Using gemini-2.0-flash-exp as it is available and fast
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const prompt = `
        You are an expert macOS Security Analyst.
        Analyze this Launch Agent/Daemon. 
        
        Name: ${item.name}
        Path: ${item.path}
        Command: ${item.command}
        
        Task:
        1. Identify the common software validation name (e.g., "Google Chrome Updater", "Zoom Meeting").
        2. Describe what it does in 1-2 clear sentences.
        3. Assess if it is "Safe", "Suspicious", or "Unknown".
        4. If it's a known benign system or vendor process, mark isSafe=true.
        
        Return ONLY valid JSON with this structure:
        {
            "commonName": "string",
            "description": "string",
            "isSafe": boolean,
            "riskLevel": "Low" | "Medium" | "High",
            "isAbnormal": boolean
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("--- Gemini Raw Response ---");
        console.log(text);
        console.log("---------------------------");

        // Cleanup markdown code blocks if present
        let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // Find the first '{' and last '}' to isolate JSON object
        const firstOpen = cleanText.indexOf('{');
        const lastClose = cleanText.lastIndexOf('}');

        if (firstOpen !== -1 && lastClose !== -1) {
            cleanText = cleanText.substring(firstOpen, lastClose + 1);
        }

        let analysis;
        try {
            analysis = JSON.parse(cleanText);
        } catch (parseErr) {
            console.error("JSON Parse Error:", parseErr);
            console.error("Failed to parse text:", cleanText);
            throw new Error("AI returned invalid JSON format");
        }

        // 3. Save to Local Knowledge Base
        saveToKnowledgeBase(item.name, analysis);

        res.json(analysis);

    } catch (e) {
        console.error("Gemini Error Stack:", e);
        res.status(500).json({
            error: "Analysis failed",
            details: e.message,
            rawError: e.toString()
        });
    }
});

// Google Search Endpoint
const axios = require('axios');
const cheerio = require('cheerio');
const UserAgent = require('user-agents');

app.post('/api/search-web', async (req, res) => {
    const { query } = req.body;

    try {
        const userAgent = new UserAgent().toString();
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

        const response = await axios.get(searchUrl, {
            headers: { 'User-Agent': userAgent }
        });

        const $ = cheerio.load(response.data);
        const results = [];

        // Scraping Google's result structure (may change, but standard divs usually persist)
        // Select standard result container
        $('div.g').each((i, el) => {
            if (results.length >= 5) return; // Limit to 5 results

            const titleEl = $(el).find('h3');
            const linkEl = $(el).find('a');
            const snippetEl = $(el).find('div.VwiC3b'); // This class is common for snippets, but flakes.
            // Fallback for snippet
            const text = $(el).text();

            if (titleEl.length && linkEl.length) {
                results.push({
                    title: titleEl.text(),
                    link: linkEl.attr('href'),
                    snippet: snippetEl.text() || text.substring(0, 150) + "..."
                });
            }
        });

        res.json({ results });

    } catch (e) {
        console.error("Search Error:", e.message);
        res.status(500).json({ error: "Failed to fetch search results" });
    }
});

// Paths to scan
const USER_HOME = os.homedir();
const SCAN_PATHS = [
    '/Library/LaunchDaemons',
    '/Library/LaunchAgents',
    '/System/Library/LaunchDaemons',
    '/System/Library/LaunchAgents',
    '/Library/StartupItems',
    path.join(USER_HOME, 'Library/LaunchAgents')
];

// Helper: Parse a single plist file
const parsePlistFile = (filePath) => {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        // Handle binary plists by trying to read them, if fails, we might need plutil
        // For simplicity, we assume text-based or use try-catch

        // If plist.parse fails, it might be binary.
        // We can use plutil to convert to json in a real app, 
        // but for now let's try the library. 
        // Note: 'plist' lib parses XML (text) plists. 
        // Many macOS system plists are binary. 
        // Safe fallback: use plutil -convert xml1 -o - 'path'
        return plist.parse(content);
    } catch (e) {
        return null;
    }
};

// Start scanning
app.get('/api/scan-files', async (req, res) => {
    let results = [];

    for (const dir of SCAN_PATHS) {
        if (!fs.existsSync(dir)) continue;

        try {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                if (file.startsWith('.') || !file.endsWith('.plist')) continue;
                if (file.startsWith('com.apple.')) continue; // Filter apple

                const fullPath = path.join(dir, file);
                let command = "Unknown";

                // Try reading with plutil (handles binary & xml)
                try {
                    const plutilPromise = new Promise((resolve, reject) => {
                        exec(`plutil -convert json -o - "${fullPath}"`, (err, stdout) => {
                            if (err) return reject(err);
                            try {
                                resolve(JSON.parse(stdout));
                            } catch (parseErr) {
                                reject(parseErr);
                            }
                        });
                    });

                    const dict = await plutilPromise;
                    if (dict.ProgramArguments && Array.isArray(dict.ProgramArguments)) {
                        command = dict.ProgramArguments.join(' ');
                    } else if (dict.Program) {
                        command = dict.Program;
                    }
                } catch (e) {
                    // console.error(`Failed to parse ${file}: ${e.message}`);
                    continue;
                }

                let type = "User Agent";
                if (dir.includes("Daemons")) type = "System Daemon (Root)";
                else if (dir === '/Library/LaunchAgents') type = "Global Agent";

                results.push({
                    name: file,
                    path: fullPath,
                    command: command,
                    type: type
                });
            }
        } catch (e) {
            console.error(`Error reading directory ${dir}:`, e);
            // Likely permission error if direct node run
        }
    }

    res.json(results);
});

// Network Scan (lsof)
app.get('/api/scan-network', (req, res) => {
    exec('lsof -i -n -P', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            // lsof often exits with 1 if nothing found or partial permissions
            // We still want to parse what we got if possible, or return empty
        }

        const lines = stdout.split('\n');
        const connections = [];

        // Skip header
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Basic parsing of whitespace separated columns
            // COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME
            const parts = line.split(/\s+/);
            if (parts.length >= 8) {
                const command = parts[0];
                const name = parts[parts.length - 1]; // Last part is typically connection info

                if (name.includes('->')) {
                    const [local, remote] = name.split('->');
                    connections.push({
                        command: command,
                        local: local,
                        remote: remote,
                        raw: line
                    });
                }
            }
        }

        res.json(connections);
    });
});

// Clean Logs
app.post('/api/clean', (req, res) => {
    const logsPath = path.join(USER_HOME, 'Library/Logs');
    const cachesPath = path.join(USER_HOME, 'Library/Caches');

    // Safety: prevent cleaning if paths are wrong (sanity check)
    if (!logsPath.includes('Library/Logs')) return res.status(500).json({ error: "Invalid path" });

    const cleanDir = (dirPath) => {
        try {
            if (fs.existsSync(dirPath)) {
                const files = fs.readdirSync(dirPath);
                for (const file of files) {
                    try {
                        const curPath = path.join(dirPath, file);
                        // Recursive delete
                        fs.rmSync(curPath, { recursive: true, force: true });
                    } catch (e) {
                        // Ignore locked files
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    cleanDir(logsPath);
    cleanDir(cachesPath);

    res.json({ status: 'cleaned', timestamp: new Date() });
});

app.listen(PORT, () => {
    console.log(`fxSpy Server running at http://localhost:${PORT}`);
    console.log(`NOTE: Grant your terminal 'Full Disk Access' to scan all system locations.`);
});
