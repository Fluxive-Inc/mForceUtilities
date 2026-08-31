export default {
    init: (container, context) => {
        console.log("Initializing mForce Investigator Module...");

        // Create iframe to point to local Streamlit instance
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';

        // In a real production scenario, this URL might be dynamic or proxied.
        // For local dev/integration, we point to the running Streamlit server.
        iframe.src = 'http://localhost:8502';

        container.appendChild(iframe);

        return {
            destroy: () => {
                console.log("Destroying mForce Investigator Module...");
                // Cleanup logic if needed
            }
        };
    }
};
