const API_URL = 'http://localhost:3000/api';

const state = {
    currentTab: 'files'
};

// Elements
const tabs = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view-section');
const pageTitle = document.getElementById('page-title');
const actionBtn = document.getElementById('action-btn');

const filesList = document.getElementById('files-list');
const networkList = document.getElementById('network-list');
const cleanBtn = document.getElementById('clean-btn');
const cleanStatus = document.getElementById('clean-status');
// Elements added
const detailModal = document.getElementById('detail-modal');
const modalContent = document.getElementById('modal-content');
const saveKeyBtn = document.getElementById('save-key-btn');
const apiKeyInput = document.getElementById('api-key-input');
const keyStatus = document.getElementById('key-status');
const researchBtn = document.getElementById('research-btn');

// Cache for analysis results (session storage to save API calls)
const ANALYSIS_CACHE = JSON.parse(localStorage.getItem('fxspy_analysis_cache') || '{}');

// Init
function init() {
    setupNavigation();
    setupActions();
    checkApiKey(); // Check if we have a key saved

    // Auto load files on start
    fetchFiles();
}

async function checkApiKey() {
    try {
        const res = await fetch(`${API_URL}/get-key`);
        const data = await res.json();
        if (data.hasKey) {
            apiKeyInput.value = "****************"; // Masked
            saveKeyBtn.textContent = "Key Configured";
            saveKeyBtn.disabled = true;
        }
    } catch (e) { }
}

function setupNavigation() {
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            switchTab(target);
        });
    });
}

function switchTab(tabName) {
    // Update UI State
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
    views.forEach(v => v.classList.toggle('active', v.id === `${tabName}-view`));

    state.currentTab = tabName;

    // Update Header
    if (tabName === 'files') {
        pageTitle.textContent = 'System Audit';
        actionBtn.textContent = 'Scan System';
        actionBtn.style.display = 'block';
        researchBtn.style.display = 'block';
    } else if (tabName === 'network') {
        pageTitle.textContent = 'Network Activity';
        actionBtn.textContent = 'Refresh Network';
        actionBtn.style.display = 'block';
        researchBtn.style.display = 'none';
        fetchNetwork();
    } else if (tabName === 'clean') {
        pageTitle.textContent = 'Sanitize';
        actionBtn.style.display = 'none';
        researchBtn.style.display = 'none';
    } else if (tabName === 'settings') {
        pageTitle.textContent = 'Settings';
        actionBtn.style.display = 'none';
        researchBtn.style.display = 'none';
    }
}

function setupActions() {
    actionBtn.addEventListener('click', () => {
        if (state.currentTab === 'files') fetchFiles();
        if (state.currentTab === 'network') fetchNetwork();
    });

    cleanBtn.addEventListener('click', performClean);

    saveKeyBtn.addEventListener('click', async () => {
        const key = apiKeyInput.value;
        if (!key) return;

        try {
            await fetch(`${API_URL}/save-key`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey: key })
            });
            keyStatus.textContent = "API Key saved successfully.";
            keyStatus.style.color = "var(--accent-green)";
        } catch (e) {
            keyStatus.textContent = "Failed to save key.";
            keyStatus.style.color = "red";
        }
    });

    researchBtn.addEventListener('click', researchAllItems);
}

// Modal Functions
window.closeModal = function () {
    detailModal.classList.add('hidden');
}

// Click outside to close
detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) closeModal();
});

let currentItems = []; // Store for lookup

// Core Analysis Logic
async function fetchItemAnalysis(item) {
    // Check Cache
    if (ANALYSIS_CACHE[item.name]) return ANALYSIS_CACHE[item.name];

    const res = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item })
    });

    if (res.status === 401) throw new Error("API Key missing");

    if (!res.ok) {
        try {
            const err = await res.json();
            throw new Error(err.details || err.error || "Server Error");
        } catch (e) {
            throw new Error(res.statusText || "Request failed");
        }
    }

    const analysis = await res.json();

    // Cache
    ANALYSIS_CACHE[item.name] = analysis;
    localStorage.setItem('fxspy_analysis_cache', JSON.stringify(ANALYSIS_CACHE));

    return analysis;
}

// Single Item Click
let activeModalItem = null;

async function analyzeItem(item) {
    activeModalItem = item;
    detailModal.classList.remove('hidden');
    renderModalStructure(item);

    // Load Gemini Data (Default)
    loadGeminiData(item);
}

function renderModalStructure(item) {
    modalContent.innerHTML = `
        <div class="modal-header">
            <h3>${item.name}</h3>
            <div class="modal-path">${item.path}</div>
        </div>

        <div class="toggle-container">
            <button class="toggle-btn active" onclick="switchModalTab('gemini')">✨ Gemini Analysis</button>
            <button class="toggle-btn" onclick="switchModalTab('google')">🔎 Google Search</button>
        </div>

        <div id="tab-gemini" class="modal-tab-content">
            <div class="loader">Loading...</div>
        </div>
        <div id="tab-google" class="modal-tab-content hidden">
            <div class="loader">Loading search results...</div>
        </div>
    `;
}

window.switchModalTab = function (tab) {
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.toggle-btn[onclick="switchModalTab('${tab}')"]`).classList.add('active');

    document.getElementById('tab-gemini').classList.toggle('hidden', tab !== 'gemini');
    document.getElementById('tab-google').classList.toggle('hidden', tab !== 'google');

    if (tab === 'google') loadGoogleData(activeModalItem);
}

async function loadGeminiData(item) {
    const container = document.getElementById('tab-gemini');

    if (ANALYSIS_CACHE[item.name]) {
        renderGeminiContent(container, item, ANALYSIS_CACHE[item.name]);
        return;
    }

    container.innerHTML = `<div class="loader">Consulting Gemini Knowledge Base...</div>`;

    try {
        const analysis = await fetchItemAnalysis(item);
        renderGeminiContent(container, item, analysis);
    } catch (e) {
        if (e.message === "API Key missing") {
            container.innerHTML = `<p style="color:red">API Key missing. Please go to Settings.</p>`;
        } else {
            container.innerHTML = `<p style="color:red">Analysis Failed: ${e.message}</p>`;
        }
    }
}

function renderGeminiContent(container, item, data) {
    const badgeClass = data.isSafe ? 'badge-safe' : 'badge-warning';
    const safetyText = data.isSafe ? 'VERIFIED SAFE' : 'POTENTIAL RISK';

    container.innerHTML = `
        <div class="analysis-badge ${badgeClass}">${safetyText}</div>
        
        <h4 style="margin-bottom:10px; color:#fff">${data.commonName || item.name}</h4>
        <p style="line-height:1.6; color:#ddd; margin-bottom:20px">
            ${data.description}
        </p>

        <div style="background:rgba(0,0,0,0.2); padding:15px; border-radius:8px">
            <div style="font-size:11px; text-transform:uppercase; color:#888; margin-bottom:5px">Raw Command</div>
            <code style="font-family:'JetBrains Mono'; font-size:11px; word-break:break-all">${item.command}</code>
        </div>
    `;
}

async function loadGoogleData(item) {
    const container = document.getElementById('tab-google');
    // Simple in-memory cache for search to avoid spamming
    if (item._googleData) {
        container.innerHTML = item._googleData;
        return;
    }

    try {
        const query = `macOS launch agent ${item.name}`;
        const res = await fetch(`${API_URL}/search-web`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });

        const data = await res.json();

        if (data.results && data.results.length > 0) {
            let html = '';
            data.results.forEach(r => {
                html += `
                    <div class="search-result">
                        <a href="${r.link}" target="_blank" class="search-title">${r.title}</a>
                        <span class="search-url">${new URL(r.link).hostname}</span>
                        <div class="search-snippet">${r.snippet}</div>
                    </div>
                `;
            });
            item._googleData = html; // Cache HTML
            container.innerHTML = html;
        } else {
            container.innerHTML = '<p>No results found.</p>';
        }

    } catch (e) {
        container.innerHTML = `<p style="color:red">Search Failed: ${e.message}</p>`;
    }
}

// Bulk Research
async function researchAllItems() {
    if (currentItems.length === 0) return;

    researchBtn.disabled = true;
    const originalText = researchBtn.textContent;

    // Filter out items already cached
    const itemsToResearch = currentItems.filter(item => !ANALYSIS_CACHE[item.name]);

    if (itemsToResearch.length === 0) {
        alert("All items have already been researched!");
        researchBtn.disabled = false;
        return;
    }

    let count = 0;
    const total = itemsToResearch.length;

    for (const item of itemsToResearch) {
        count++;
        researchBtn.textContent = `Analyzing ${count}/${total}...`;

        try {
            await fetchItemAnalysis(item);
            // Re-render list to show progress (names appearing)
            renderFiles(currentItems);
        } catch (e) {
            console.error("Failed to analyze item:", item.name);
            if (e.message === "API Key missing") {
                alert("Please configure your API Key in Settings first.");
                break;
            }
        }

        // Small delay to be nice to API
        await new Promise(r => setTimeout(r, 500));
    }

    researchBtn.textContent = originalText;
    researchBtn.disabled = false;
    renderFiles(currentItems); // Final render
}

// API Calls
async function fetchFiles() {
    const loader = document.getElementById('files-loader');
    filesList.innerHTML = '';
    loader.classList.remove('hidden');

    try {
        const res = await fetch(`${API_URL}/scan-files`);
        const data = await res.json();

        renderFiles(data);
    } catch (e) {
        console.error(e);
        filesList.innerHTML = `<tr><td colspan="4" style="color:red">Error connecting to local agent. is node running?</td></tr>`;
    } finally {
        loader.classList.add('hidden');
    }
}

async function fetchNetwork() {
    const loader = document.getElementById('network-loader');
    networkList.innerHTML = '';
    loader.classList.remove('hidden');

    try {
        const res = await fetch(`${API_URL}/scan-network`);
        const data = await res.json();

        renderNetwork(data);
    } catch (e) {
        console.error(e);
        networkList.innerHTML = `<tr><td colspan="3" style="color:red">Error connecting to local agent.</td></tr>`;
    } finally {
        loader.classList.add('hidden');
    }
}

async function performClean() {
    cleanBtn.disabled = true;
    cleanBtn.textContent = "Cleaning...";

    try {
        const res = await fetch(`${API_URL}/clean`, { method: 'POST' });
        await res.json();
        cleanStatus.textContent = "Logs and caches cleared successfully.";
        setTimeout(() => cleanStatus.textContent = "", 3000);
    } catch (e) {
        cleanStatus.textContent = "Error clearing logs.";
    } finally {
        cleanBtn.disabled = false;
        cleanBtn.textContent = "Clean Logs & Caches";
    }
}

// Heuristics for abnormal items
function isAbnormal(item) {
    const knownVendors = [
        'com.apple', 'com.google', 'com.adobe', 'com.microsoft',
        'us.zoom', 'com.logi', 'com.cisco', 'com.symantec',
        'com.bstat', 'org.mozilla', 'com.grammarly'
    ];

    // Check if name starts with a known vendor
    const isKnown = knownVendors.some(vendor => item.name.toLowerCase().startsWith(vendor));

    // If it's NOT known, it's potentially abnormal (worthy of review)
    // Also check for "Unknown" command
    if (!isKnown) return true;
    if (item.command === "Unknown") return true;

    return false;
}

// Renderers
function renderMetrics(items) {
    const totalFiles = items.length;
    // Count unique directories (based on the path, stripping filename)
    const locations = new Set(items.map(i => {
        // Simple directory extraction: substring to last slash
        return i.path.substring(0, i.path.lastIndexOf('/'));
    }));
    const abnormalCount = items.filter(i => isAbnormal(i)).length;

    // Animating numbers simple implementation
    document.getElementById('stats-files').textContent = totalFiles;
    document.getElementById('stats-locations').textContent = locations.size;

    // Update the third card to show Abnormal items instead of system ones, as that's more useful
    const systemLabel = document.querySelector('#stats-system').nextElementSibling;
    const systemValue = document.getElementById('stats-system');

    if (abnormalCount > 0) {
        systemValue.textContent = abnormalCount;
        systemValue.style.color = 'var(--accent-red)';
        systemLabel.textContent = "Items to Review";
    } else {
        systemValue.textContent = items.filter(i => i.type.includes('Root') || i.type.includes('System')).length;
        systemValue.style.color = 'var(--text-primary)';
        systemLabel.textContent = "System Daemons";
    }
}

function renderFiles(items) {
    currentItems = items; // Store for lookup
    renderMetrics(items);

    if (items.length === 0) {
        filesList.innerHTML = `<tr><td colspan="4" style="text-align:center; opacity:0.5">No suspicious items found in scan paths.</td></tr>`;
        return;
    }

    // Group by directory
    const groups = {};
    items.forEach(item => {
        const dir = item.path.substring(0, item.path.lastIndexOf('/'));
        if (!groups[dir]) groups[dir] = [];
        groups[dir].push(item);
    });

    let html = '';

    // Sort directories to keep system ones first usually, or alphabetical
    Object.keys(groups).sort().forEach(dir => {
        // Add Header
        // Determine label based on dir
        let dirLabel = dir;
        let icon = "📂";
        if (dir.includes("LaunchDaemons")) { dirLabel = "System Daemons (Root)"; icon = "🔒"; }
        else if (dir.includes("/Users/") && dir.includes("LaunchAgents")) { dirLabel = "User Agents (~/Library/LaunchAgents)"; icon = "👤"; }
        else if (dir === "/Library/LaunchAgents") { dirLabel = "Global Agents"; icon = "🌐"; }
        else if (dir.includes("StartupItems")) { dirLabel = "Legacy Startup Items"; icon = "💾"; }

        html += `
            <tr class="group-header">
                <td colspan="4"><span style="margin-right:10px">${icon}</span> ${dir} <span style="opacity:0.6; font-weight:400; font-size:11px; margin-left:10px">(${dirLabel})</span></td>
            </tr>
        `;

        // Add Items
        groups[dir].forEach((item) => {
            // Encode item for passing to function - tricky with quotes.
            // Better to use a global index lookup or event delegation.
            // We'll use a data-name attribute and look it up in currentItems.

            const suspicious = isAbnormal(item);
            const rowClass = suspicious ? 'row-suspicious clickable-row' : 'clickable-row';
            const nameIcon = suspicious ? '<span class="warning-icon">⚠️</span>' : '<span class="file-icon">📄</span>';
            const extraTag = suspicious ? '<span class="tag" style="background:rgba(224,85,85,0.3); color:#ffcccc; margin-left:5px">Review</span>' : '';

            // Check if we have a common name cached
            let displayName = item.name;
            let subText = "";
            if (ANALYSIS_CACHE[item.name] && ANALYSIS_CACHE[item.name].commonName) {
                displayName = ANALYSIS_CACHE[item.name].commonName;
                subText = `<div style="font-size:10px; opacity:0.6">${item.name}</div>`;
            }

            html += `
            <tr class="${rowClass}" onclick="handleItemClick('${item.name.replace(/'/g, "\\'")}')">
                <td class="indent-cell">
                    ${nameIcon} <span style="font-weight:500">${displayName}</span>
                    ${subText}
                </td>
                <td class="col-mono" style="font-size:11px" title="${item.command}">${item.command.substring(0, 60)}${item.command.length > 60 ? '...' : ''}</td>
                <td><span class="tag">${item.type}</span>${extraTag}</td>
            </tr>
            `;
        });
    });

    filesList.innerHTML = html;
}

// Helper to handle click from string
window.handleItemClick = function (itemName) {
    const item = currentItems.find(i => i.name === itemName);
    if (item) analyzeItem(item);
}

function renderNetwork(items) {
    if (items.length === 0) {
        networkList.innerHTML = `<tr><td colspan="3" style="text-align:center; opacity:0.5">No active P2P connections found.</td></tr>`;
        return;
    }

    networkList.innerHTML = items.map(item => `
        <tr>
            <td style="font-weight:500">${item.command}</td>
            <td class="col-mono">${item.local} →</td>
            <td style="color: var(--accent-blue)">${item.remote}</td>
        </tr>
    `).join('');
}

// Bootstrap
init();
