const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
const os = require('os');

async function main() {
    const KEY_FILE = path.join(os.homedir(), '.fxspy_key');
    let apiKey = null;

    if (fs.existsSync(KEY_FILE)) {
        apiKey = fs.readFileSync(KEY_FILE, 'utf8').trim();
    } else {
        console.error("No API key found in ~/.fxspy_key");
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    console.log("Using API Key: " + apiKey.substring(0, 6) + "...");

    try {
        console.log("Fetching available models...");
        // Not all SDK versions expose listModels directly on the main class instance easily in all environments, 
        // but let's try via the model manager if available or just try to invoke it.
        // ACTUALLY, the current Node SDK has a modelManager.

        // Alternative: The error message says "Call ListModels". 
        // Unfortunately common SDK usage hides this. 
        // Let's try to just instantiate `gemini-1.5-flash` and print its name if it works? No, that failed.

        // We will try to fetch the models list via REST if SDK fails, but let's try generic SDK first.
        // It seems the SDK doesn't always expose listModels in the high-level surface.
        // Let's use a specialized fetch to check.

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods})`));
        } else {
            console.log("No models returned or error:", JSON.stringify(data, null, 2));
        }

    } catch (e) {
        console.error("Error listing models:", e);
    }
}

main();
