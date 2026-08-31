export class LinkedInService {
    constructor() {
        this.baseUrl = 'https://api.linkedin.com/v2';
        this.config = this.loadConfig();
    }

    loadConfig() {
        const saved = localStorage.getItem('mforce_linkedin_config');
        return saved ? JSON.parse(saved) : {
            clientId: '78888wnrxu2xij',
            clientSecret: '', // Secret rotated/removed
            redirectUri: window.location.origin + window.location.pathname,
            accessToken: ''
        };
    }

    saveConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        localStorage.setItem('mforce_linkedin_config', JSON.stringify(this.config));
    }

    reset() {
        localStorage.removeItem('mforce_linkedin_config');
        this.config = this.loadConfig();
    }

    getAuthUrl() {
        const { clientId, redirectUri } = this.config;
        const scope = 'openid profile w_member_social email'; // Common scopes
        const state = Math.random().toString(36).substring(7);
        localStorage.setItem('linkedin_auth_state', state);

        return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;
    }

    async exchangeCodeForToken(code) {
        console.log("Attempting token exchange...");
        
        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', this.config.redirectUri);
        params.append('client_id', this.config.clientId);
        params.append('client_secret', this.config.clientSecret);

        // Use local proxy to bypass CORS
        try {
            const response = await fetch('/linkedin-oauth/accessToken', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params
            });
            
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Token Exchange Failed: ${response.status} ${text}`);
            }
            
            return response.json();
        } catch (err) {
            console.error("Token Exchange Error:", err);
            throw err;
        }
    }

    async fetchProfile() {
        if (!this.config.accessToken) throw new Error("No access token provided");

        // Mock data logic for demo if token is "demo"
        if (this.config.accessToken === 'demo') {
            return new Promise(resolve => setTimeout(() => resolve({
                sub: "demo-user-123",
                name: "mForce User (Demo)",
                given_name: "mForce",
                family_name: "User",
                picture: "https://via.placeholder.com/150",
                locale: "en_US",
                email: "demo@fluxive.ai"
            }), 800));
        }

        const response = await fetch('/linkedin-api/userinfo', {
            headers: {
                'Authorization': `Bearer ${this.config.accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return response.json();
    }
    
    isAuthenticated() {
        return !!this.config.accessToken;
    }
}
