const WORKER = "https://api.niteapiworker.workers.dev";
let currentIndex = 0;
let GLOBAL_COMMANDS = [];

// Store global data to access across tabs
let GLOBAL_SETTINGS = {};
let GLOBAL_CHANNELS = [];
let GLOBAL_ROLES = [];
let SETTINGS_CONFIG = [];

// --- UTILS ---
function setCookie(n, v) { document.cookie = n + "=" + v + ";path=/;max-age=604800"; }
function getCookie(n) { return (document.cookie.match(new RegExp('(^| )' + n + '=([^;]+)')) || [])[2]; }

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Page Transition: Fade in from black
    setTimeout(() => {
        const overlay = document.getElementById('transition-overlay');
        if (overlay) overlay.classList.remove('active');
    }, 100); // Small delay to ensure render

    const token = getCookie("auth_token");
    if (!token) { window.location.href = "index.html"; return; }

    const user = getCookie("auth_user");
    if (user) document.getElementById('lbl-btn-username').innerText = user;

    const urlParams = new URLSearchParams(window.location.search);
    const serverId = urlParams.get('id');
    const serverName = urlParams.get('name');
    const serverIcon = urlParams.get('icon');
    const serverWidth = urlParams.get('width'); // Get the width passed from previous page
    const serverHeight = urlParams.get('height'); // Get height for position calc

    // Render Static Card Header if data exists
    if (serverName && serverIcon) {
        renderStaticFloatingCard(serverName, serverIcon, serverWidth, serverHeight);
    }

    if (serverId) {
        document.getElementById('lbl-server-id').innerText = serverId;
        initSettingsFlow(serverId, token);
    } else {
        alert("No ID provided");
        window.location.href = "index.html";
    }
});

function renderStaticFloatingCard(serverName, serverIcon, serverWidth, serverHeight) {
    // --- CONTAINER ---
    const switcherContainer = document.createElement('div');
    switcherContainer.className = 'switcher-container';
    switcherContainer.style.position = 'fixed';
    switcherContainer.style.zIndex = '2000'; // Above everything

    // --- MAIN CARD ---
    const floatCard = document.createElement('div');
    floatCard.className = 'server-card';
    // Reset styles for use inside container
    floatCard.style.margin = '0';
    floatCard.style.cursor = 'pointer'; // Now clickable
    floatCard.style.pointerEvents = 'auto'; // Enable clicks
    floatCard.style.animation = 'none';
    floatCard.style.filter = 'none';
    floatCard.style.webkitFilter = 'none';

    // Apply width/scale to the CARD, but position applies to CONTAINER
    floatCard.style.width = serverWidth ? (serverWidth + 'px') : '120px';
    floatCard.style.transform = 'scale(0.6)';
    floatCard.style.transformOrigin = 'top left'; // Important for scale to position correctly
    if (window.innerWidth <= 768) floatCard.style.transformOrigin = 'bottom left'; // Mobile

    floatCard.innerHTML = `
        <img src="${decodeURIComponent(serverIcon)}" class="server-avatar" style="filter:blur(0); animation:none;">
        <span>${decodeURIComponent(serverName)}</span>
    `;

    // --- SWITCHER GRID (Hidden by default) ---
    const grid = document.createElement('div');
    grid.className = 'switcher-grid';
    grid.innerHTML = '<p style="color:#aaa; font-size:0.8rem; text-align:center;">Loading servers...</p>';

    switcherContainer.appendChild(floatCard);
    switcherContainer.appendChild(grid);

    // --- POSITIONING ---
    switcherContainer.style.left = '20px';
    if (window.innerWidth <= 768) {
        // Mobile: Bottom Left
        const h = serverHeight ? parseFloat(serverHeight) : 80;
        const topPos = window.innerHeight - 20 - (h * 0.6);
        switcherContainer.style.top = topPos + 'px';
    } else {
        // Desktop: Top Left
        switcherContainer.style.top = '20px';
    }

    // --- INTERACTIONS ---
    let isMobile = window.innerWidth <= 768;

    floatCard.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isMobile) {
            // Mobile: Tap 1 -> Open, Tap 2 -> Home
            if (switcherContainer.classList.contains('active')) {
                window.location.href = "index.html";
            } else {
                switcherContainer.classList.add('active');
                fetchServersForGrid(grid); // Load servers on open
            }
        } else {
            // Desktop: Click -> Home
            window.location.href = "index.html";
        }
    });

    // Desktop Hover Logic
    if (!isMobile) {
        switcherContainer.addEventListener('mouseenter', () => {
            fetchServersForGrid(grid);
        });
    }

    // Close on outside click (Mobile)
    document.addEventListener('click', (e) => {
        if (!switcherContainer.contains(e.target)) {
            switcherContainer.classList.remove('active');
        }
    });

    document.body.appendChild(switcherContainer);

    // Hide Sidebar Header Text provided by template logic
    const headerDiv = document.querySelector('.sidebar-header');
    if (headerDiv) headerDiv.style.visibility = 'hidden';
}

// --- API FLOW ---
async function initSettingsFlow(serverId, token) {
    try {
        // 1. Fetch Config
        const configRes = await fetch('settings_config.json');
        if (!configRes.ok) throw new Error("Failed to load settings configuration.");
        SETTINGS_CONFIG = await configRes.json();

        // 2. Trigger Bot
        await fetch(`${WORKER}/trigger-settings?serverid=${serverId}`, { headers: { "Authorization": token } });

        // 3. Poll for Data
        let attempts = 0;
        while (attempts < 30) {
            attempts++;
            let res = await fetch(`${WORKER}/check-settings?t=${Date.now()}`, { headers: { "Authorization": token }, cache: "no-store" });

            if (res.status === 200) {
                const data = await res.json();
                GLOBAL_CHANNELS = data.channels || [];
                GLOBAL_ROLES = data.roles || [];
                GLOBAL_SETTINGS = data.settings || {};
                GLOBAL_COMMANDS = data.commands || [];

                document.getElementById('loading-text').classList.add('hide');

                // 4. Render Interface
                renderInterface();
                return;
            }
            await new Promise(r => setTimeout(r, 1000));
        }
        document.getElementById('loading-text').innerText = "Bot timed out.";
    } catch (e) {
        document.getElementById('loading-text').innerText = "Error: " + e.message;
    }
}

// --- RENDER LOGIC ---

function renderInterface() {
    renderTabs();
    const firstTab = SETTINGS_CONFIG[0];
    if (firstTab) {
        // Set first tab as active
        const btn = document.querySelector(`.nav-item[data-target="${firstTab.id}"]`);
        if (btn) {
            btn.classList.add('active');
            moveGlider(btn);
        }
        document.getElementById(firstTab.id).classList.add('active');
    }
}

function renderTabs() {
    const navContainer = document.querySelector('.nav-menu');
    const contentViewport = document.querySelector('.content-viewport');

    // Clear existing placeholders (except glider)
    // Keep sidebar header, etc? standard structure in HTML is:
    // .nav-menu > glider, btn, btn

    // We will rebuild the nav items.
    const glider = document.getElementById('nav-glider');
    navContainer.innerHTML = '';
    navContainer.appendChild(glider);

    // Clear content viewport (except loading text if we want to keep it generic, but easier to wipe)
    // Actually, save the loading text if needed, but it should be hidden by now.
    contentViewport.innerHTML = '<p id="loading-text" style="text-align:center; margin-top:50px; color:#aaa; display:none;">Loading Configuration...</p>';

    SETTINGS_CONFIG.forEach((tab, index) => {
        // 1. Create Nav Button
        const btn = document.createElement('button');
        btn.className = 'nav-item';
        btn.innerText = tab.name;
        btn.dataset.target = tab.id;
        btn.onclick = function () { switchTab(this, tab.id); };
        navContainer.appendChild(btn);

        // 2. Create Tab Pane
        const pane = document.createElement('div');
        pane.id = tab.id;
        pane.className = 'tab-pane';
        // Render settings inside pane
        pane.innerHTML = renderSettingsList(tab.settings);
        contentViewport.appendChild(pane);
    });
}

function renderSettingsList(settingsList) {
    let html = '';
    settingsList.forEach(item => {
        switch (item.type) {
            case 'header':
                html += `<h2>${item.text}</h2>`;
                break;
            case 'text':
                html += `<p style="${item.style || ''}">${item.text}</p>`;
                break;
            case 'title':
                html += `<div class="section-title">${item.text}</div>`;
                break;
            case 'switch':
                html += createToggle(item.key, item.label, item.sublabel, GLOBAL_SETTINGS[item.key] !== false);
                break;
            case 'select':
                html += createSelect(item.key, item.label, item.options, GLOBAL_SETTINGS[item.key] || item.default);
                break;
            case 'textarea':
                let val = GLOBAL_SETTINGS[item.key];
                if (Array.isArray(val) && item.join) {
                    val = val.join(item.join);
                } else if (typeof val !== 'string') {
                    val = item.default || "";
                }
                html += createTextarea(item.key, item.label, item.placeholder, val);
                break;
            case 'channelPick':
                html += createChannelSelect(item.key, item.label, GLOBAL_SETTINGS[item.key]);
                break;
            case 'commandList':
                html += renderCommandList();
                break;
            case 'supportChannelList':
                html += renderSupportChannelList(item.key);
                break;
            default:
                console.warn("Unknown setting type:", item.type);
        }
    });
    return html;
}

// --- SPECIAL RENDERERS ---

function renderCommandList() {
    if (GLOBAL_COMMANDS.length === 0) {
        return `<p style="color:#72767d;">No commands found or bot failed to send list.</p>`;
    }
    let html = `<div class="commands-grid">`;
    GLOBAL_COMMANDS.forEach(cmd => {
        const key = `${cmd.name}_enabled`;
        const isEnabled = GLOBAL_SETTINGS[key] !== false;
        html += `
        <div class="command-card" style="display:flex; flex-direction:column; align-items:flex-start; gap:8px;">
            <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                <span style="font-weight:bold; color:#fff; font-family:monospace; font-size:1.1rem;">/${cmd.name}</span>
                <label class="switch">
                    <input type="checkbox" id="${key}" ${isEnabled ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            </div>
            <span style="font-size:0.8rem; color:#b9bbbe; line-height:1.3;">${cmd.description}</span>
        </div>`;
    });
    html += `</div>`;
    return html;
}

function renderSupportChannelList(key) {
    const forums = GLOBAL_CHANNELS.filter(c => c.type === '15' || c.type === '13' || c.type === 'forum');
    if (forums.length === 0) {
        return `<p style="color:#72767d; font-style:italic;">No Forum channels found.</p>`;
    }
    let html = `<div class="commands-grid">`;
    const selected = GLOBAL_SETTINGS[key] || [];
    forums.forEach(c => {
        const isChecked = selected.includes(c.id);
        html += `
        <div class="command-card">
            <span># ${c.name}</span>
            <label class="switch">
                <input type="checkbox" class="support-channel-chk" data-setting-key="${key}" value="${c.id}" ${isChecked ? 'checked' : ''}>
                <span class="slider"></span>
            </label>
        </div>`;
    });
    html += `</div>`;
    return html;
}

// --- HELPER COMPONENT GENERATORS ---

function createToggle(id, label, sublabel, checked) {
    return `
    <div class="toggle-wrapper">
        <div class="toggle-label-group">
            <span class="form-label" style="margin:0;">${label}</span>
            ${sublabel ? `<span class="form-sublabel" style="margin:0;">${sublabel}</span>` : ''}
        </div>
        <label class="switch">
            <input type="checkbox" id="${id}" ${checked ? 'checked' : ''}>
            <span class="slider"></span>
        </label>
    </div>`;
}

function createSelect(id, label, options, selectedVal) {
    let opts = options.map(o => `<option value="${o.val}" ${String(o.val) === String(selectedVal) ? 'selected' : ''}>${o.txt}</option>`).join('');
    return `
    <div class="form-group">
        <label class="form-label">${label}</label>
        <select id="${id}" class="styled-select">${opts}</select>
    </div>`;
}

function createTextarea(id, label, placeholder, value) {
    return `
    <div class="form-group">
        <label class="form-label">${label}</label>
        <textarea id="${id}" class="styled-textarea" placeholder="${placeholder}">${value}</textarea>
    </div>`;
}

function createChannelSelect(id, label, selectedId) {
    const targetId = selectedId ? String(selectedId) : "";
    const channels = GLOBAL_CHANNELS.filter(c =>
        String(c.type) === '0' ||
        String(c.type) === 'text' ||
        String(c.type) === '5' ||
        String(c.type) === 'news'
    );
    const found = channels.find(c => String(c.id) === targetId);

    let opts = `<option value="">-- None --</option>`;
    if (targetId && !found) {
        opts += `<option value="${targetId}" selected>Unknown Channel (${targetId})</option>`;
    }
    opts += channels.map(c => {
        const cId = String(c.id);
        const isSelected = cId === targetId;
        return `<option value="${cId}" ${isSelected ? 'selected' : ''}># ${c.name}</option>`;
    }).join('');

    return `
    <div class="form-group">
        <label class="form-label">${label}</label>
        <select id="${id}" class="styled-select">
            ${opts}
        </select>
    </div>`;
}

// --- NAVIGATION ---
function switchTab(btn, targetId) {
    const allBtns = Array.from(document.querySelectorAll('.nav-item'));
    const newIndex = allBtns.indexOf(btn);
    if (newIndex === currentIndex) return;

    allBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    moveGlider(btn);

    const currentTab = document.querySelector('.tab-pane.active');
    const nextTab = document.getElementById(targetId);

    if (currentTab && nextTab) animateContent(currentTab, nextTab, currentIndex, newIndex);
    currentIndex = newIndex;
}

function moveGlider(targetBtn) {
    const glider = document.getElementById('nav-glider');
    if (glider) {
        glider.style.opacity = '1';
        glider.style.top = targetBtn.offsetTop + 'px';
        glider.style.height = targetBtn.offsetHeight + 'px';
    }
}

function animateContent(oldTab, newTab, oldIdx, newIdx) {
    oldTab.classList.remove('active'); oldTab.classList.add('animating');
    newTab.classList.add('active'); newTab.classList.add('animating');

    if (newIdx > oldIdx) { oldTab.classList.add('slide-out-up'); newTab.classList.add('slide-in-up'); }
    else { oldTab.classList.add('slide-out-down'); newTab.classList.add('slide-in-down'); }

    setTimeout(() => {
        oldTab.classList.remove('animating', 'slide-out-up', 'slide-out-down', 'active');
        newTab.classList.remove('animating', 'slide-in-up', 'slide-in-down');
        newTab.classList.add('active');
    }, 400);
}

// --- SAVE FUNCTION ---
async function saveChanges() {
    const btn = document.getElementById('btn-save-changes');
    const status = document.getElementById('save-status');
    const serverId = document.getElementById('lbl-server-id').innerText;
    const token = getCookie("auth_token");

    if (!serverId || serverId === "Loading...") return;

    btn.disabled = true;
    btn.innerText = "Saving...";
    status.innerText = "Collecting data...";
    status.style.color = "#aaa";

    try {
        let payload = {};

        // 1. Iterate through Config to Collect Data
        SETTINGS_CONFIG.forEach(tab => {
            tab.settings.forEach(item => {
                if (item.type === 'header' || item.type === 'text' || item.type === 'title') return;

                const el = document.getElementById(item.key);

                if (item.type === 'switch') {
                    if (el) payload[item.key] = el.checked;
                }
                else if (item.type === 'select') {
                    if (el) {
                        // Some logic for integers vs strings? 
                        // Original code used parseInt for specific fields. 
                        // Let's try to detect if options val is int-like or string.
                        // For now, save as string, unless we want to map back to int.
                        // But for generic, string is safer unless we specify "valuetype".
                        // Original: regenerate_mode (int), ping_state (int).
                        // We can guess: if value is numeric string, maybe save as int? 
                        // Or just save as is, Python backend probably handles type coercion or expected logic.
                        // Let's emulate original behavior: specific keys = int.

                        const val = el.value;
                        if (['regenerate_mode', 'ping_state'].includes(item.key)) {
                            payload[item.key] = parseInt(val);
                        } else {
                            payload[item.key] = val;
                        }
                    }
                }
                else if (item.type === 'textarea') {
                    if (el) {
                        const val = el.value;
                        if (item.join) {
                            // Split and clean
                            payload[item.key] = val.split(item.join.trim()).map(s => s.trim()).filter(s => s.length > 0);
                        } else {
                            payload[item.key] = val;
                        }
                    }
                }
                else if (item.type === 'channelPick') {
                    if (el) {
                        const val = el.value;
                        payload[item.key] = val ? val : null;
                    }
                }
                else if (item.type === 'commandList') {
                    // Iterate commands
                    GLOBAL_COMMANDS.forEach(cmd => {
                        const k = `${cmd.name}_enabled`;
                        const cBox = document.getElementById(k);
                        if (cBox) {
                            payload[k] = cBox.checked;
                        }
                    });
                }
                else if (item.type === 'supportChannelList') {
                    const chks = document.querySelectorAll(`.support-channel-chk[data-setting-key="${item.key}"]:checked`);
                    payload[item.key] = Array.from(chks).map(cb => cb.value);
                }
            });
        });

        // --- SEND TO WORKER ---
        status.innerText = "Sending to Bot...";

        const response = await fetch(`${WORKER}/update-settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({
                serverid: serverId,
                settings: payload
            })
        });

        if (response.ok) {
            status.innerText = "Saved Successfully!";
            status.style.color = "#4fdc7b"; // Green

            // Update Global Settings
            Object.assign(GLOBAL_SETTINGS, payload);
        } else {
            throw new Error("Worker rejected update");
        }

    } catch (e) {
        console.error(e);
        status.innerText = "Save Failed: " + e.message;
        status.style.color = "#ed4245"; // Red
    } finally {
        btn.disabled = false;
        btn.innerText = "Save Changes";
    }
}

function handleAuthClick() { openLogout(); }
function logout() { document.cookie = "auth_token=;path=/;max-age=0"; window.location.href = "index.html"; }
function openLogout() { document.getElementById('loginbtn').classList.add('expanded'); document.getElementById('logOutContainer').classList.add('active'); }
function closeLogout() { document.getElementById('loginbtn').classList.remove('expanded'); document.getElementById('logOutContainer').classList.remove('active'); }
function goBack() { window.location.href = "index.html"; }

// --- SWITCHER HELPER (Identical to before) ---
let cachedServers = null;
async function fetchServersForGrid(gridEl) {
    if (cachedServers) {
        renderSwitcherGrid(gridEl, cachedServers);
        return;
    }

    const token = getCookie("auth_token");
    try {
        let res = await fetch(`${WORKER}/check?t=${Date.now()}`, { headers: { "Authorization": token }, cache: "no-store" });
        if (res.status === 200) {
            const data = await res.json();
            cachedServers = data.servers || [];
            renderSwitcherGrid(gridEl, cachedServers);
        } else {
            gridEl.innerHTML = '<p style="color:#ed4245; padding:5px;">Failed to load.</p>';
        }
    } catch (e) {
        gridEl.innerHTML = '<p style="color:#ed4245; padding:5px;">Error loading.</p>';
    }
}

function renderSwitcherGrid(el, list) {
    if (!list) list = [];
    const urlParams = new URLSearchParams(window.location.search);
    const currId = urlParams.get('id');
    const currName = urlParams.get('name');
    const currIcon = urlParams.get('icon');
    const others = list.filter(s => s.id !== currId);

    const currentServer = {
        id: currId,
        name: currName,
        picture_url: currIcon,
        isCurrent: true,
        type: 'current'
    };

    const homeCard = {
        name: "Homepage",
        picture_url: "https://cdn-icons-png.flaticon.com/512/25/25694.png",
        type: 'special',
        action: "window.location.href='index.html'"
    };

    const addCard = {
        name: "Add to server",
        picture_url: "https://cdn.discordapp.com/avatars/1371513819104415804/9e038eeb716c24ece29276422b52cc80.webp?size=320",
        type: 'special',
        action: "window.location.href='https://discord.com/oauth2/authorize?client_id=1371513819104415804&permissions=2815042428980240&integration_type=0&scope=bot+applications.commands'"
    };

    const fullList = [currentServer, ...others, homeCard, addCard];
    const defaultIcon = "https://cdn.discordapp.com/embed/avatars/0.png";

    el.innerHTML = fullList.map((s, i) => {
        const isCurrent = s.type === 'current';
        const isSpecial = s.type === 'special';

        const safeName = s.name ? decodeURIComponent(s.name).replace(/"/g, '&quot;') : "Unknown";
        let safeIcon = s.picture_url || defaultIcon;
        safeIcon = decodeURIComponent(safeIcon).replace(/"/g, '&quot;');

        let clickAction = "";
        let cardStyle = "cursor:pointer; width:100%; box-sizing:border-box;";

        if (isCurrent) {
            clickAction = "window.location.href='index.html'";
            cardStyle += "border: 1px solid #5865F2;";
            cardStyle += "filter: none !important; animation: none !important;";
        } else if (isSpecial) {
            clickAction = s.action;
        } else {
            const params = new URLSearchParams(window.location.search);
            params.set('id', s.id);
            params.set('name', s.name);
            params.set('icon', s.picture_url || defaultIcon);
            const dest = `manage.html?${params.toString()}`;
            clickAction = `window.location.href='${dest}'`;
        }

        const delay = i * 0.05;
        const popClass = i > 0 ? 'server-card-pop' : '';
        let imgStyle = "";

        if (s.name === 'Add to server') {
            imgStyle = 'background-color: #5865F2; padding: 2px;';
        } else if (s.name === 'Homepage') {
            imgStyle = 'background-color: #ffffff; padding: 4px; border-radius: 50%;';
        }

        if (isCurrent) {
            imgStyle += ' filter: none !important; -webkit-filter: none !important; animation: none !important;';
        }

        return `
        <div class="server-card ${popClass}" 
             onclick="${clickAction}"
             style="${cardStyle} ${i > 0 ? `animation-delay: ${delay}s;` : ''}">
            <img src="${safeIcon}" class="server-avatar" style="${imgStyle}">
            <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:block; max-width:100%;">${safeName}</span>
        </div>`;
    }).join('');
}