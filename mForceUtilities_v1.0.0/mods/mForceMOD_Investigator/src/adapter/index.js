import ToolApp from '../core/App.js';

export default {
    mount: (container, context) => {
        // 'context' contains tokens, theme, and user info from Foundry
        console.log("Mounting mForce Investigator module...", context);
        // Initialize app and append to 'container'
        return ToolApp.init(container, context);
    },
    unmount: (container, instance) => {
        // Clean up DOM and listeners
        if (instance && instance.destroy) {
            instance.destroy();
        }
        container.innerHTML = '';
    }
};
