import './style.css';
import { LinkedInService } from './service.js';

const service = new LinkedInService();
let app = document.getElementById('app');

if (!app) {
    app = document.createElement('div');
    app.id = 'app';
    document.body.appendChild(app);
}

// --- Render Functions ---

function renderHeader() {
    const header = document.createElement('header');
    header.innerHTML = `
        <h1>mFORCE <span class="highlight">LINKEDIN</span></h1>
        <p>Advanced Professional Network Intelligence</p>
    `;
    return header;
}

function renderSidebar() {
    const aside = document.createElement('aside');
    aside.className = 'sidebar';
    aside.innerHTML = `
        <div class="tree-title">Explorer</div>
        <div class="tree-item active">
            <span>📊</span> LinkedIn Profile
        </div>
        <div class="tree-item">
            <span>🔍</span> Connection Search
        </div>
        <div class="tree-item">
            <span>📨</span> Message Campaigns
        </div>
        <div class="tree-item">
            <span>⚙️</span> Module Settings
        </div>
        
        <div class="tree-title" style="margin-top:20px">Automation</div>
        <div class="tree-item" id="nav-agent">
            <span>🤖</span> Safe Agent
        </div>

        <div class="tree-title" style="margin-top:20px">Analytics</div>
        <div class="tree-item">
            <span>📈</span> Network Growth
        </div>
        <div class="tree-item">
            <span>👁️</span> Profile Views
        </div>
    `;
    return aside;
}

function renderAuxPanel() {
    const aside = document.createElement('aside');
    aside.className = 'aux-panel';
    aside.innerHTML = `
        <div class="tree-title">🚀 Content Intelligence</div>
        
        <div class="billing-card" style="border-left: 3px solid var(--accent-color);">
            <div style="color:#8892b0; font-size:0.8rem; margin-bottom:5px;">TRENDING TOPIC</div>
            <div style="color:#fff; font-weight:600; margin-bottom:5px;">"Autonomous Agents in Enterprise"</div>
            <div style="font-size:0.8rem; color:var(--success);">▲ 420% Network Volume</div>
            <button class="btn btn-secondary" style="width:100%; margin-top:10px; font-size:0.8rem; padding:5px;">Draft Post</button>
        </div>

        <div class="billing-card">
            <div style="color:#8892b0; font-size:0.8rem; margin-bottom:5px;">CONTENT IDEA</div>
            <div style="color:#fff; font-style:italic; font-size:0.9rem;">"Share a behind-the-scenes look at how mForce handles rate limits safely."</div>
        </div>

        <div class="tree-title" style="margin-top:20px">🎯 Engagement Targets</div>
        
        <div style="margin-bottom:15px; padding:10px; background:rgba(255,255,255,0.03); border-radius:6px;">
            <div style="display:flex; gap:10px; align-items:center; margin-bottom:5px;">
                <div style="width:24px; height:24px; border-radius:50%; background:#0077b5;"></div>
                <div style="font-size:0.9rem; font-weight:bold;">Satya Nadella</div>
                <span style="font-size:0.7rem; color:#8892b0;">2h ago</span>
            </div>
            <div style="font-size:0.85rem; color:#ccc; margin-bottom:8px;">"The future of work is not just AI, but AI agents working alongside humans..."</div>
            <div style="font-size:0.75rem; color:var(--accent-color);">🔥 High Priority Opportunity</div>
        </div>

        <div style="margin-bottom:15px; padding:10px; background:rgba(255,255,255,0.03); border-radius:6px;">
             <div style="display:flex; gap:10px; align-items:center; margin-bottom:5px;">
                <div style="width:24px; height:24px; border-radius:50%; background:#aa2222;"></div>
                <div style="font-size:0.9rem; font-weight:bold;">Jane Doe (CTO)</div>
                <span style="font-size:0.7rem; color:#8892b0;">50m ago</span>
            </div>
            <div style="font-size:0.85rem; color:#ccc; margin-bottom:8px;">"Looking for recommendations on safe LinkedIn automation tools. Anyone?"</div>
             <div style="font-size:0.75rem; color:var(--success);">🎯 Perfect Lead</div>
        </div>
    `;
    return aside;
}

function renderConfigView() {
    const card = document.createElement('div');
    card.className = 'card';
    
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
        card.innerHTML = `
            <h2><span class="highlight">Authorizing...</span></h2>
            <p>Processing LinkedIn authorization code...</p>
            <div id="auth-status" style="margin: 20px 0; color: #8892b0;">Using Client Secret to exchange token...</div>
        `;

        // Attempt Exchange
        setTimeout(async () => {
            try {
                const data = await service.exchangeCodeForToken(code);
                console.log("Token exchanged!", data);
                service.saveConfig({ accessToken: data.access_token });
                window.location.href = window.location.pathname; // Clear URL
            } catch (err) {
                console.error(err);
                const statusDiv = document.getElementById('auth-status');
                if (statusDiv) {
                    statusDiv.innerHTML = `
                         <p style="color:var(--error)">Exchange Failed (Likely CORS).</p>
                         <p style="font-size:0.8em">LinkedIn blocks direct browser requests. Using a server-side proxy is recommended.</p>
                         <p><strong>Code Received:</strong> <code style="word-break:break-all; color:var(--accent-color)">${code}</code></p>
                    `;
                    
                    const manualInput = document.createElement('div');
                    manualInput.className = 'form-group';
                    manualInput.innerHTML = `
                        <label>Manual Fallback: Enter Generated Token</label>
                        <input type="password" id="manual-token" placeholder="Paste Access Token here">
                        <button class="btn" id="save-token" style="margin-top:10px">Save & Continue</button>
                    `;
                    card.appendChild(manualInput);
                    
                    document.getElementById('save-token').addEventListener('click', () => {
                        const token = document.getElementById('manual-token').value;
                        if(token) {
                            service.saveConfig({ accessToken: token });
                            window.location.href = window.location.pathname;
                        }
                    });
                }
            }
        }, 1000);
        
        return card;
    }

    card.innerHTML = `
        <h2>Configuration</h2>
        <div class="form-group">
            <label>Client ID</label>
            <input type="text" id="client-id" value="${service.config.clientId}" placeholder="Enter LinkedIn Client ID">
            <small class="helper-text">The unique identifier for your app from the LinkedIn Developer Portal. Required to initiate the login flow.</small>
        </div>
        <div class="form-group">
            <label>Redirect URI</label>
            <input type="text" id="redirect-uri" value="${service.config.redirectUri}" readonly>
            <small class="helper-text">The URL where LinkedIn will send the user back after login. Must be added to "Authorized Redirect URLs" in your LinkedIn app settings.</small>
        </div>
        <div class="form-group">
            <label>Access Token (Optional)</label>
            <input type="password" id="access-token" value="${service.config.accessToken}" placeholder="Direct Access Token (or 'demo')">
             <small class="helper-text">If you have a valid token (e.g. from the Token Generator), you can paste it here to skip the OAuth 2.0 flow.</small>
        </div>
        <div style="display:flex; gap:10px; margin-top:20px;">
            <button class="btn" id="save-config">Save & Connect</button>
            <button class="btn btn-secondary" id="clear-config">Reset</button>
        </div>
    `;
    return card;
}

function renderAgentView() {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h2>Safe Mode Agent</h2>
            <div style="display:flex; gap:10px;">
                <span style="padding: 5px 10px; background:rgba(0,180,0,0.2); color:#00ff9d; border-radius:4px; font-size:0.8rem;">OFFICIAL API</span>
                <span class="status-indicator" style="padding: 5px 10px; background:#333; border-radius:4px; font-size:0.8rem;">STOPPED</span>
            </div>
        </div>

        <div class="form-group">
            <label>Organization URN</label>
            <input type="text" placeholder="urn:li:organization:..." value="urn:li:organization:123456">
        </div>

        <div style="background:#000; padding:15px; border-radius:6px; font-family:monospace; height:200px; overflow-y:auto; margin-bottom:20px; font-size:0.9rem; border:1px solid #333;">
            <div style="color:#8892b0;">[System] Agent initialized. Waiting for start command...</div>
        </div>

        <div style="display:flex; gap:10px;">
            <button class="btn" style="background:var(--success); color:#000;">Start Agent</button>
            <button class="btn btn-secondary" style="border-color:var(--error); color:var(--error);">Stop</button>
        </div>
    `;
    return card;
}

function renderProfileView(profileData) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <div class="profile-header">
            <img src="${profileData.picture || 'https://via.placeholder.com/150'}" class="avatar" alt="Profile">
            <div class="profile-info">
                <h3>${profileData.name}</h3>
                <p>${profileData.email}</p>
            </div>
        </div>
        
        <div class="data-grid">
            <div class="data-item">
                <div class="data-label">Locale</div>
                <div class="data-value">${profileData.locale}</div>
            </div>
            <div class="data-item">
                <div class="data-label">Sub ID</div>
                <div class="data-value">${profileData.sub}</div>
            </div>
            <div class="data-item">
                <div class="data-label">Email Verified</div>
                <div class="data-value">${profileData.email_verified ? 'Yes' : 'No'}</div>
            </div>
        </div>

        <div style="margin-top:20px; text-align:right;">
             <button class="btn btn-secondary" id="logout">Disconnect</button>
        </div>
    `;
    return card;
}

// --- Main App Logic ---

async function init() {
    app.innerHTML = '';
    
    // Grid Layout Construction
    app.appendChild(renderHeader());
    
    app.appendChild(renderSidebar());
    
    const mainContent = document.createElement('main');
    mainContent.className = 'main-content';
    app.appendChild(mainContent);
    
    app.appendChild(renderAuxPanel());

    // Navigation Logic
    document.getElementById('nav-agent')?.addEventListener('click', () => {
        const main = document.querySelector('.main-content');
        main.innerHTML = '';
        main.appendChild(renderAgentView());
    });

    // Render Routes into Main Content
    renderMainContent(mainContent);
    
    renderStatusBar();
}

async function renderMainContent(container) {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('code')) {
        const configCard = renderConfigView();
        container.appendChild(configCard);
        return;
    }

    if (service.isAuthenticated()) {
        try {
            renderLoading("Fetching Profile Data...", container);
            const profile = await service.fetchProfile();
            clearLoading();
            const profileView = renderProfileView(profile);
            container.appendChild(profileView);
            document.getElementById('logout').addEventListener('click', () => {
                service.saveConfig({ accessToken: '' });
                init();
            });
        } catch (e) {
            clearLoading();
            renderError(e.message, container);
            const configCard = attachConfigListeners(renderConfigView());
            container.appendChild(configCard);
        }
    } else {
        const configCard = attachConfigListeners(renderConfigView());
        container.appendChild(configCard);
    }
}

function attachConfigListeners(element) {
    setTimeout(() => {
        const saveBtn = document.getElementById('save-config');
        const clearBtn = document.getElementById('clear-config');
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const clientId = document.getElementById('client-id').value;
                const token = document.getElementById('access-token').value;
                
                service.saveConfig({ 
                    clientId, 
                    accessToken: token 
                });

                if (token) {
                    init(); 
                } else if (clientId) {
                    window.location.href = service.getAuthUrl();
                } else {
                    alert("Please enter a Client ID or Access Token");
                }
            });
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                service.reset();
                init();
            });
        }
    }, 0);
    return element;
}

function renderLoading(msg, parent) {
    const div = document.createElement('div');
    div.id = 'loading';
    div.innerHTML = `<p style="color:var(--accent-color)">${msg}</p>`;
    // Fallback if parent is null
    (parent || app).appendChild(div);
}

function clearLoading() {
    const el = document.getElementById('loading');
    if(el) el.remove();
}

function renderError(msg, parent) {
    const div = document.createElement('div');
    div.className = 'card';
    div.style.borderColor = 'var(--error)';
    div.innerHTML = `<h3 style="color:var(--error)">Error</h3><p>${msg}</p>`;
    (parent || app).appendChild(div);
}

function renderStatusBar() {
    let bar = document.getElementById('status-bar');
    if (!bar) {
        bar = document.createElement('div');
        bar.id = 'status-bar';
        bar.className = 'status-bar';
        document.body.appendChild(bar);
    }
    bar.innerHTML = `
        <span>Module: mForceLinkedIn</span>
        <span>Stats: ${service.isAuthenticated() ? 'Connected' : 'Disconnected'}</span>
    `;
}

// Start
init();
