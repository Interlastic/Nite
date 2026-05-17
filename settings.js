let GLOBAL_SETTINGS = {};
let GLOBAL_CHANNELS = [];
let GLOBAL_CATEGORIES = [];
let GLOBAL_ROLES = [];
let GLOBAL_COMMANDS = [];
let GLOBAL_EMOJIS = { custom: [], unicode: {} };
let SETTINGS_CONFIG = [];
let isDirty = false;
let PENDING_CHATBOTS = {};

function escapeForHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function initSettings() {
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    const token = getCookie("auth_token");
    if (!id || !token) { location.href = "index.html"; return; }

    document.getElementById("server-name").innerText = decodeURIComponent(params.get("name") || "Server");
    document.getElementById("server-icon").src = decodeURIComponent(params.get("icon") || "https://cdn.discordapp.com/embed/avatars/0.png");

    try {
        const configRes = await fetch("settings_config.json");
        SETTINGS_CONFIG = await configRes.json();
        await fetch(`${API_BASE}/trigger-settings?serverid=${id}`, { headers: { "Authorization": token } });
        let attempts = 0;
        while (attempts < 30) {
            attempts++;
            const res = await fetch(`${API_BASE}/check-settings?t=${Date.now()}`, { headers: { "Authorization": token } });
            if (res.status === 200) {
                const data = await res.json();
                GLOBAL_SETTINGS = data.settings || {};
                GLOBAL_CHANNELS = data.channels || [];
                GLOBAL_CATEGORIES = data.categories || [];
                GLOBAL_ROLES = data.roles || [];
                GLOBAL_COMMANDS = data.commands || [];
                if (data.emojis) GLOBAL_EMOJIS.custom = data.emojis.custom || [];
                if (typeof window.UNICODE_EMOJIS !== 'undefined') GLOBAL_EMOJIS.unicode = window.UNICODE_EMOJIS;
                window.GLOBAL_EMOJIS = GLOBAL_EMOJIS;
                Object.assign(GLOBAL_SETTINGS, data.permissions || {});
                renderUI();
                return;
            }
            await new Promise(r => setTimeout(r, 1000));
        }
    } catch (err) {
        document.getElementById("loading-view").innerText = "Error loading settings.";
    }
}

function renderUI() {
    const menu = document.getElementById("nav-menu");
    const viewport = document.getElementById("content-viewport");
    if (!menu || !viewport) return;
    menu.innerHTML = "";
    viewport.innerHTML = "";

    SETTINGS_CONFIG.forEach((tab, i) => {
        const nav = document.createElement("div");
        nav.className = `nav-item ${i === 0 ? 'active' : ''}`;
        nav.innerText = tab.name;
        nav.onclick = () => switchTab(tab.id, nav);
        menu.appendChild(nav);

        const pane = document.createElement("div");
        pane.id = `tab-${tab.id}`;
        pane.className = `tab-pane ${i === 0 ? '' : 'hide'}`;
        pane.innerHTML = renderSettings(tab.settings);
        viewport.appendChild(pane);

        if (i === 0) {
            setTimeout(() => {
                pane.querySelectorAll("textarea").forEach(autoResize);
            }, 150);
        }
    });

    viewport.addEventListener("input", markDirty);
    viewport.addEventListener("change", markDirty);
}

function renderSettings(list) {
    return list.map(s => {
        if (s.type === "header") return `<h2 style="margin: 2rem 0 1rem;">${s.text}</h2>`;
        if (s.type === "title") return `<h3 style="margin: 1.5rem 0 0.5rem; color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase;">${s.text}</h3>`;
        if (s.type === "separator") return `<div style="display:flex; align-items:center; gap:0.75rem; margin:1.5rem 0; color:#fff; font-size:1rem; font-weight:600;"><span style="flex:1; height:1px; background:linear-gradient(to right, transparent, var(--border), var(--border));"></span>${s.text}<span style="flex:1; height:1px; background:linear-gradient(to left, transparent, var(--border), var(--border));"></span></div>`;
        if (s.type === "text") return `<p style="${s.style || ''}">${s.text}</p>`;
        
        let html = `<div class="setting-card">`;
        if (s.type === "switch") {
            const checked = !!GLOBAL_SETTINGS[s.key];
            html += `
                <div class="toggle-row">
                    <div>
                        <div class="setting-title">${s.label}</div>
                        <div class="setting-desc" style="margin:0;">${s.sublabel || ''}</div>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="${s.key}" ${checked ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
            `;
        } else if (s.type === "textarea") {
            const val = Array.isArray(GLOBAL_SETTINGS[s.key]) ? GLOBAL_SETTINGS[s.key].join(s.join || "\n") : (GLOBAL_SETTINGS[s.key] || "");
            html += `
                <div class="setting-title">${s.label}</div>
                <div class="setting-desc">${s.help || ''}</div>
                <textarea id="${s.key}" class="textarea" rows="4">${escapeForHtml(val)}</textarea>
            `;
        } else if (s.type === "select") {
            const val = GLOBAL_SETTINGS[s.key] || s.default;
            const opts = s.options.map(o => `<option value="${o.val}" ${String(o.val) === String(val) ? 'selected' : ''}>${o.txt}</option>`).join("");
            html += `
                <div class="setting-title">${s.label}</div>
                <select id="${s.key}" class="select">${opts}</select>
            `;
        } else if (s.type === "channelPick") {
            const val = GLOBAL_SETTINGS[s.key] || "";
            const channels = GLOBAL_CHANNELS.filter(c => ['0', 'text', '5', 'news'].includes(String(c.type)));
            const opts = `<option value="">-- None --</option>` + channels.map(c => `<option value="${c.id}" ${String(c.id) === String(val) ? 'selected' : ''}># ${c.name}</option>`).join("");
            html += `
                <div class="setting-title">${s.label}</div>
                <select id="${s.key}" class="select">${opts}</select>
            `;
        } else if (s.type === "commandList") {
            html += renderCommands();
        } else if (s.type === "dict") {
            html += renderDict(s);
        } else if (s.type === "embedMaker") {
            html += renderEmbedMakerButton(s);
        } else if (s.type === "supportChannelList") {
            html += renderSupportChannelList(s.key);
        } else if (s.type === "chatbotList") {
            html += renderChatbotList(s.key);
        } else if (s.type === "namedContentList") {
            html += renderNamedContentList(s);
        } else if (s.type === "serverStats") {
            html += renderServerStats(s.key);
        }
        html += `</div>`;
        return html;
    }).join("");
}

function renderEmbedMakerButton(s) {
    const key = s.key;
    const hasDefs = GLOBAL_SETTINGS.welcome_goodbye_definitions && Object.keys(GLOBAL_SETTINGS.welcome_goodbye_definitions).some(id => {
        const ints = GLOBAL_SETTINGS.welcome_goodbye_interactions && GLOBAL_SETTINGS.welcome_goodbye_interactions[id] || [];
        const valid = key === 'welcome_message' ? ['bot_joined', 'member_joined', 'member_returned'] : ['bot_left', 'member_left'];
        return ints.some(i => valid.includes(i));
    });
    return `
        <div class="setting-title">${s.label}</div>
        <div class="setting-desc">${s.help || ''}</div>
        <div class="flex items-center gap-4">
            <button class="btn btn-primary" onclick="openEmbedMakerModal('${key}')">${s.buttonText || 'Edit Message'}</button>
            <span id="status-${key}" style="color:${hasDefs ? 'var(--success)' : 'var(--text-muted)'}; font-size:0.85rem;">${hasDefs ? '✓ Configured' : 'Not set'}</span>
        </div>
    `;
}

function renderSupportChannelList(key) {
    const forums = GLOBAL_CHANNELS.filter(c => ['15', '13', 'forum'].includes(String(c.type)));
    if (!forums.length) return `<p style="color:var(--text-muted); font-size:0.9rem;">No Forum channels found.</p>`;
    const selected = GLOBAL_SETTINGS[key] || [];
    return `<div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:0.5rem;">` + forums.map(c => `
        <div class="flex items-center justify-between" style="background:var(--bg-tertiary); padding:8px 12px; border-radius:4px;">
            <span style="font-size:0.9rem; overflow:hidden; text-overflow:ellipsis;"># ${c.name}</span>
            <label class="switch">
                <input type="checkbox" class="support-channel-chk" data-key="${key}" value="${c.id}" ${selected.includes(c.id) ? 'checked' : ''}>
                <span class="slider"></span>
            </label>
        </div>
    `).join("") + `</div>`;
}

function renderChatbotList(key) {
    const bots = { ...(GLOBAL_SETTINGS[key] || {}), ...PENDING_CHATBOTS };
    let html = `<div id="chatbot-container">`;
    html += Object.entries(bots).map(([id, b]) => `
        <div class="setting-card flex items-center gap-4" style="background:var(--bg-tertiary); border:none;">
            <img src="${b.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png'}" style="width:40px; height:40px; border-radius:50%;">
            <div style="flex:1; min-width:0;">
                <div style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeForHtml(b.name)} ${b.nsfw ? '<span class="badge badge-nsfw">NSFW</span>' : ''}</div>
                <div style="font-size:0.8rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeForHtml(b.system_prompt || '')}</div>
            </div>
            <div class="flex gap-2">
                <button class="btn btn-ghost" style="padding:5px 10px;" onclick="openChatbotEditor('${id}')">Edit</button>
                <button class="btn btn-danger" style="padding:5px 10px;" onclick="deleteChatbot('${id}')">×</button>
            </div>
        </div>
    `).join("");
    return html + `</div><button class="btn btn-ghost" style="width:100%; margin-top:1rem;" onclick="openChatbotEditor()">+ Create Chatbot</button>`;
}

function openChatbotEditor(id = null) {
    const isNew = !id;
    const bot = isNew ? { name: "", system_prompt: "", avatar_url: "", nsfw: false } : (PENDING_CHATBOTS[id] || GLOBAL_SETTINGS.chatbots[id]);
    
    const modal = document.createElement('div');
    modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:10000; display:flex; align-items:center; justify-content:center;";
    modal.id = "chatbot-modal";
    modal.innerHTML = `
        <div style="background:var(--bg-secondary); width:95%; max-width:500px; border-radius:8px; padding:1.5rem;">
            <h3 style="margin-top:0; margin-bottom:1.5rem;">${isNew ? 'Create Chatbot' : 'Edit Chatbot'}</h3>
            <div class="form-group">
                <label>Bot Name</label>
                <input type="text" class="input" id="edit-bot-name" value="${escapeForHtml(bot.name)}" placeholder="e.g. Nite AI">
            </div>
            <div class="form-group">
                <label>System Prompt</label>
                <textarea class="textarea" id="edit-bot-prompt" rows="5" placeholder="You are a helpful assistant...">${escapeForHtml(bot.system_prompt)}</textarea>
            </div>
            <div class="form-group">
                <label>Avatar URL</label>
                <input type="text" class="input" id="edit-bot-avatar" value="${escapeForHtml(bot.avatar_url)}" placeholder="https://...">
            </div>
            <div class="toggle-row" style="margin-bottom:1.5rem;">
                <label style="margin:0;">NSFW Mode</label>
                <label class="switch">
                    <input type="checkbox" id="edit-bot-nsfw" ${bot.nsfw ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            </div>
            <div class="flex gap-2 justify-end">
                <button class="btn btn-ghost" onclick="document.getElementById('chatbot-modal').remove()">Cancel</button>
                <button class="btn btn-primary" onclick="saveChatbotData('${id}')">${isNew ? 'Create' : 'Save'}</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function saveChatbotData(id) {
    const name = document.getElementById("edit-bot-name").value.trim();
    const prompt = document.getElementById("edit-bot-prompt").value.trim();
    const avatar = document.getElementById("edit-bot-avatar").value.trim();
    const nsfw = document.getElementById("edit-bot-nsfw").checked;

    if (!name) return alert("Name is required.");
    
    const bot = { name, system_prompt: prompt, avatar_url: avatar, nsfw };
    if (!id || id === "null") id = "new_" + Date.now();
    
    PENDING_CHATBOTS[id] = bot;
    document.getElementById("chatbot-modal").remove();
    refreshChatbotList();
    markDirty();
}

function deleteChatbot(id) {
    if (!confirm("Are you sure you want to delete this chatbot?")) return;
    if (PENDING_CHATBOTS[id]) delete PENDING_CHATBOTS[id];
    else if (GLOBAL_SETTINGS.chatbots && GLOBAL_SETTINGS.chatbots[id]) {
        delete GLOBAL_SETTINGS.chatbots[id];
    }
    refreshChatbotList();
    markDirty();
}

function refreshChatbotList() {
    const container = document.getElementById("chatbot-container");
    if (!container) return;
    
    const bots = { ...(GLOBAL_SETTINGS.chatbots || {}), ...PENDING_CHATBOTS };
    container.innerHTML = Object.entries(bots).map(([id, b]) => `
        <div class="setting-card flex items-center gap-4" style="background:var(--bg-tertiary); border:none;">
            <img src="${b.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png'}" style="width:40px; height:40px; border-radius:50%;">
            <div style="flex:1; min-width:0;">
                <div style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeForHtml(b.name)} ${b.nsfw ? '<span class="badge badge-nsfw">NSFW</span>' : ''}</div>
                <div style="font-size:0.8rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeForHtml(b.system_prompt || '')}</div>
            </div>
            <div class="flex gap-2">
                <button class="btn btn-ghost" style="padding:5px 10px;" onclick="openChatbotEditor('${id}')">Edit</button>
                <button class="btn btn-danger" style="padding:5px 10px;" onclick="deleteChatbot('${id}')">×</button>
            </div>
        </div>
    `).join("");
}

function renderNamedContentList(s) {
    const items = GLOBAL_SETTINGS[s.key] || [];
    const html = items.map((item, i) => `
        <div class="setting-card" style="background:var(--bg-tertiary); border:none;">
            <div class="flex justify-between items-center" style="margin-bottom:0.5rem;">
                <input type="text" class="input ncl-name" style="width:45%;" value="${escapeForHtml(item.name)}" placeholder="Name">
                <input type="text" class="input ncl-desc" style="width:45%;" value="${escapeForHtml(item.description)}" placeholder="Description">
                <button class="btn btn-danger" onclick="this.parentElement.parentElement.remove(); markDirty();">×</button>
            </div>
            <textarea class="textarea ncl-skill" rows="3" placeholder="Content...">${escapeForHtml(item.skill)}</textarea>
        </div>
    `).join("");
    return `<div id="ncl-${s.key}">${html}</div><button class="btn btn-ghost" style="width:100%; margin-top:1rem;" onclick="addNclRow('${s.key}')">+ Add Item</button>`;
}

function addNclRow(key) {
    const container = document.getElementById(`ncl-${key}`);
    const div = document.createElement("div");
    div.className = "setting-card";
    div.style.background = "var(--bg-tertiary)";
    div.style.border = "none";
    div.innerHTML = `
        <div class="flex justify-between items-center" style="margin-bottom:0.5rem;">
            <input type="text" class="input ncl-name" style="width:45%;" placeholder="Name">
            <input type="text" class="input ncl-desc" style="width:45%;" placeholder="Description">
            <button class="btn btn-danger" onclick="this.parentElement.parentElement.remove(); markDirty();">×</button>
        </div>
        <textarea class="textarea ncl-skill" rows="3" placeholder="Content..."></textarea>
    `;
    container.appendChild(div);
    markDirty();
}

function getCategories() {
    return GLOBAL_CATEGORIES || [];
}

function validateNoSpaces(input, errorId) {
    const errorEl = document.getElementById(errorId + '-error') || document.getElementById(errorId + '-error');
    if (input.value.includes(' ')) {
        if (errorEl) errorEl.style.display = 'block';
        input.style.borderColor = 'var(--danger)';
    } else {
        if (errorEl) errorEl.style.display = 'none';
        input.style.borderColor = '';
    }
    markDirty();
}

function renderServerStats(key) {
    const data = GLOBAL_SETTINGS[key] || { enabled: false, stat_channels: {} };
    const channels = data.stat_channels || {};
    const categories = getCategories();
    const allChannels = GLOBAL_CHANNELS.filter(c => ["voice", "stage", "text"].includes(String(c.type)));

    let html = `
        <div class="setting-card" style="background:var(--bg-tertiary); border:none; margin-bottom:1rem;">
            <div class="toggle-row">
                <label style="margin:0; font-weight:600;">Enable Server Stats</label>
                <label class="switch">
                    <input type="checkbox" id="ss-enabled" ${data.enabled ? 'checked' : ''} onchange="markDirty(); document.getElementById('ss-config').style.display = this.checked ? 'block' : 'none';">
                    <span class="slider"></span>
                </label>
            </div>
            <p style="color:var(--text-muted); font-size:0.85rem; margin-top:0.5rem;">Turn Discord channels into live counters (e.g., Members: 1,250)</p>
        </div>

        <div id="ss-config" style="${data.enabled ? '' : 'display:none;'}">
            <div class="setting-card" style="background:var(--bg-tertiary); border:none; margin-bottom:1rem;">
                <div class="setting-title">Server Name Template</div>
                <div class="setting-desc">Optional: Rename the server using stats (e.g., "Nite | {members} members").</div>
                <div class="flex items-center gap-2" style="margin-top:0.5rem;">
                    <input type="text" class="input" id="ss-server-name-template" value="${escapeForHtml(data.server_name_template || '')}" placeholder="e.g. Nite | {members} members" style="flex:1;" oninput="markDirty()">
                    <button type="button" class="emoji-btn" onclick="openEmojiPicker(this, true)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                    </button>
                    ${data.server_name_template ? `<button type="button" class="btn btn-ghost" style="padding:6px 10px; flex-shrink:0;" onclick="clearServerNameTemplate()" title="Clear">✕</button>` : ''}
                </div>
                <div style="margin-top:0.5rem; font-size:0.8rem; color:var(--text-muted);">{members}, {boosts}, {channels}, {roles}, {online}</div>
            </div>

            <div class="setting-title" style="margin-top:1rem;">Stat Channels</div>
            <div class="setting-desc" style="margin-bottom:1rem;">Add channels to display live stats. Existing channels use ID as key, new channels use "new_" prefix.</div>

            <div id="ss-channels-list">
                ${Object.entries(channels).map(([id, conf]) => renderStatChannelRow(id, conf, categories, allChannels)).join('')}
            </div>

            <button class="btn btn-ghost" style="width:100%; margin-top:1rem;" onclick="openStatChannelModal()">+ Add New Counter</button>

            <div style="margin-top:1rem; padding:0.75rem; background:var(--bg-tertiary); border-radius:4px; font-size:0.85rem; color:var(--text-muted);">
                <strong>Available placeholders:</strong> {members}, {boosts}, {channels}, {roles}, {online}, {text_channels}, {voice_channels}
            </div>
        </div>
    `;

    return html;
}

function renderStatChannelRow(id, conf, categories, allChannels) {
    const isNew = String(id).startsWith("new_");
    const template = isNew ? (conf.template || '') : conf;
    const categoryId = isNew ? (conf.category_id || '') : '';
    const channelType = isNew ? (conf.type || 'voice') : 'voice';

    const existingCh = allChannels.find(c => c.id === id);
    const chName = isNew ? `New Channel ${id.slice(-4)}` : (existingCh ? `# ${existingCh.name}` : `Channel ${id}`);

    return `
        <div class="setting-card stat-channel-row" style="background:var(--bg-tertiary); border:none; margin-bottom:0.5rem; padding:0.75rem;" data-id="${id}">
            <div class="flex justify-between items-center" style="margin-bottom:0.5rem;">
                <span style="font-weight:600;">${chName}</span>
                <button class="btn btn-danger" style="padding:4px 8px;" onclick="removeStatChannel('${id}')">×</button>
            </div>
            <div class="flex items-center gap-2" style="margin-bottom:0.5rem;">
                <input type="text" class="input stat-channel-input" data-id="${id}" value="${escapeForHtml(template)}" placeholder="e.g. Members:{members}" oninput="updateStatChannel('${id}', 'template', this.value)" style="flex:1;">
                <button type="button" class="emoji-btn" onclick="openEmojiPicker(this, true)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                </button>
            </div>
            ${isNew ? `
                <select class="select" onchange="updateStatChannel('${id}', 'category_id', this.value)" style="margin-bottom:0.5rem;">
                    <option value="">Select Category</option>
                    ${categories.length ? categories.map(c => `<option value="${c.id}" ${c.id === categoryId ? 'selected' : ''}>${escapeForHtml(c.name)}</option>`).join('') : '<option value="" disabled>No categories found</option>'}
                </select>
                <select class="select" onchange="updateStatChannel('${id}', 'type', this.value)">
                    <option value="voice" ${channelType === 'voice' ? 'selected' : ''}>Voice Channel</option>
                    <option value="stage" ${channelType === 'stage' ? 'selected' : ''}>Stage Channel</option>
                    <option value="text" ${channelType === 'text' ? 'selected' : ''}>Text Channel</option>
                </select>
            ` : ''}
        </div>
    `;
}

function openStatChannelModal() {
    const modal = document.createElement('div');
    modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:10000; display:flex; align-items:center; justify-content:center;";
    modal.id = "ss-modal";

    const categories = getCategories();

    modal.innerHTML = `
        <div style="background:var(--bg-secondary); width:95%; max-width:500px; border-radius:8px; padding:1.5rem;">
            <h3 style="margin-top:0; margin-bottom:1.5rem;">Create Stat Channel</h3>
            
            <div class="form-group">
                <label>Template</label>
                <div class="flex items-center gap-2">
                    <input type="text" class="input" id="ss-modal-template" placeholder="e.g. Members:{members}" style="flex:1;">
                    <button type="button" class="emoji-btn" onclick="openEmojiPicker(this, true)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                    </button>
                </div>
                <div style="font-size:0.8rem; color:var(--text-muted); margin-top:0.25rem;">Available: {members}, {boosts}, {channels}, {roles}, {online}</div>
            </div>
            <div class="form-group">
                <label>Category</label>
                <select class="select" id="ss-modal-category">
                    <option value="">Select a category</option>
                    ${categories.length ? categories.map(c => `<option value="${c.id}">${escapeForHtml(c.name)}</option>`).join('') : '<option value="" disabled>No categories found</option>'}
                </select>
            </div>
            <div class="form-group">
                <label>Channel Type</label>
                <select class="select" id="ss-modal-type">
                    <option value="voice">Voice Channel</option>
                    <option value="stage">Stage Channel</option>
                    <option value="text">Text Channel</option>
                </select>
            </div>
            
            <div class="flex gap-2 justify-end">
                <button class="btn btn-ghost" onclick="document.getElementById('ss-modal').remove()">Cancel</button>
                <button class="btn btn-primary" onclick="addStatChannelFromModal()">Create</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function openStatChannelEmojiPicker() {
    const input = document.getElementById("ss-modal-template");
    openEmojiPickerForInput(input);
}

function addStatChannelFromModal() {
    const templateInput = document.getElementById("ss-modal-template");
    const template = templateInput.value.trim();
    const categoryId = document.getElementById("ss-modal-category").value;
    const channelType = document.getElementById("ss-modal-type").value;

    if (!template) return alert("Template is required.");
    if (channelType === "text" && template.includes(' ')) return alert("Spaces not allowed in text channel names.");
    if (!categoryId) return alert("Please select a category.");

    const data = GLOBAL_SETTINGS.server_stats || { enabled: false, stat_channels: {} };
    data.stat_channels = data.stat_channels || {};
    
    const id = "new_" + Date.now();
    data.stat_channels[id] = { template, category_id: categoryId, type: channelType };

    GLOBAL_SETTINGS.server_stats = data;
    document.getElementById("ss-modal").remove();
    refreshStatChannelsList();
    markDirty();
}

function clearServerNameTemplate() {
    const data = GLOBAL_SETTINGS.server_stats || { enabled: false, stat_channels: {} };
    delete data.server_name_template;
    GLOBAL_SETTINGS.server_stats = data;
    const input = document.getElementById("ss-server-name-template");
    if (input) input.value = "";
    refreshServerNameButtons();
    markDirty();
}

function refreshServerNameButtons() {
    const input = document.getElementById("ss-server-name-template");
    const container = input?.parentElement;
    if (container) {
        const emojiBtn = container.querySelector('.emoji-btn');
        const clearBtn = container.querySelector('button[onclick="clearServerNameTemplate()"]');
        if (input.value) {
            if (!clearBtn) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn btn-ghost';
                btn.style.cssText = 'padding:6px 10px; flex-shrink:0;';
                btn.onclick = clearServerNameTemplate;
                btn.title = 'Clear';
                btn.innerText = '✕';
                container.appendChild(btn);
            }
        } else {
            if (clearBtn) clearBtn.remove();
        }
    }
}

function refreshStatChannelsList() {
    const channels = (GLOBAL_SETTINGS.server_stats || {}).stat_channels || {};
    const categories = getCategories();
    const allChannels = GLOBAL_CHANNELS.filter(c => ["voice", "stage", "text"].includes(String(c.type)));
    const listEl = document.getElementById("ss-channels-list");
    if (listEl) {
        listEl.innerHTML = Object.entries(channels).map(([id, conf]) => renderStatChannelRow(id, conf, categories, allChannels)).join('');
    }
}

function updateStatChannel(id, field, value) {
    const data = GLOBAL_SETTINGS.server_stats || { enabled: false, stat_channels: {} };
    data.stat_channels = data.stat_channels || {};
    if (!data.stat_channels[id]) return;

    if (field === "template") {
        if (String(id).startsWith("new_")) {
            data.stat_channels[id].template = value;
        } else {
            data.stat_channels[id] = value;
        }
    } else if (String(id).startsWith("new_")) {
        data.stat_channels[id][field] = value;
    }
    markDirty();
}

function removeStatChannel(id) {
    const data = GLOBAL_SETTINGS.server_stats || { enabled: false, stat_channels: {} };
    data.stat_channels = data.stat_channels || {};
    delete data.stat_channels[id];
    refreshStatChannelsList();
    markDirty();
}

function renderServerStatsUI() {
    const pane = document.getElementById("tab-server-stats");
    if (pane) pane.innerHTML = renderSettings(SETTINGS_CONFIG.find(t => t.id === "tab-server-stats").settings);
}

document.getElementById("ss-enabled")?.addEventListener("change", function() {
    document.getElementById("ss-config").style.display = this.checked ? "block" : "none";
});

const VALID_PERMISSIONS = [
    "administrator", "manage_guild", "manage_roles", "manage_channels",
    "manage_messages", "manage_webhooks", "manage_nicknames",
    "send_messages", "create_polls", "mention_everyone",
    "view_audit_log", "kick_members", "ban_members"
];

function renderCommands() {
    return GLOBAL_COMMANDS.map(c => {
        const name = c.name.trim().replace(/\s+/g, '.');
        const key = `${name}_enabled`;
        const checked = GLOBAL_SETTINGS[key] !== false;
        return `
            <div class="command-item">
                <div class="command-header">
                    <span class="command-name">/${c.name}</span>
                    <div class="flex items-center gap-2">
                        <button class="command-settings-btn" title="Settings" onclick="openCommandSettings('${escapeForHtml(c.name)}')">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                        </button>
                        <label class="switch">
                            <input type="checkbox" id="${key}" ${checked ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
                <div class="command-desc">${escapeForHtml(c.description)}</div>
            </div>
        `;
    }).join("");
}

function openCommandSettings(cmdName) {
    const permKey = `${cmdName.trim().replace(/\s+/g, '.')}_permissions`;
    const settings = GLOBAL_SETTINGS[permKey] || { roles: [], permissions: [] };

    const modal = document.createElement('div');
    modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:10000; display:flex; align-items:center; justify-content:center;";
    modal.id = "command-settings-modal";

    let rolesHtml = GLOBAL_ROLES.map(role => `
        <label class="flex items-center gap-2" style="margin-bottom:8px; cursor:pointer;">
            <input type="checkbox" class="role-chk" value="${role.id}" ${settings.roles.includes(role.id) ? 'checked' : ''}>
            <span style="color:${role.color ? '#' + role.color.toString(16).padStart(6, '0') : 'var(--text-primary)'}">${escapeForHtml(role.name)}</span>
        </label>
    `).join("");

    let permsHtml = VALID_PERMISSIONS.map(perm => `
        <label class="flex items-center gap-2" style="margin-bottom:8px; cursor:pointer;">
            <input type="checkbox" class="perm-chk" value="${perm}" ${settings.permissions.includes(perm) ? 'checked' : ''}>
            <span>${perm.replace(/_/g, ' ')}</span>
        </label>
    `).join("");

    modal.innerHTML = `
        <div style="background:var(--bg-secondary); width:95%; max-width:700px; border-radius:8px; display:flex; flex-direction:column; max-height:90vh;">
            <div style="padding:1rem; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
                <h3 style="margin:0;">Settings for /${cmdName}</h3>
                <button class="btn btn-ghost" onclick="document.getElementById('command-settings-modal').remove()">×</button>
            </div>
            <div style="flex:1; overflow-y:auto; padding:1.5rem; display:grid; grid-template-columns: 1fr 1fr; gap:2rem;">
                <div>
                    <div style="font-weight:700; margin-bottom:1rem; color:var(--text-secondary); text-transform:uppercase; font-size:0.8rem;">Required Roles</div>
                    <div style="background:var(--bg-dark); padding:1rem; border-radius:4px; max-height:400px; overflow-y:auto;">
                        ${rolesHtml || '<p style="color:var(--text-muted); font-size:0.85rem;">No roles found.</p>'}
                    </div>
                    <p style="font-size:0.75rem; color:var(--text-muted); margin-top:0.5rem;">User needs at least one of these roles.</p>
                </div>
                <div>
                    <div style="font-weight:700; margin-bottom:1rem; color:var(--text-secondary); text-transform:uppercase; font-size:0.8rem;">Required Permissions</div>
                    <div style="background:var(--bg-dark); padding:1rem; border-radius:4px; max-height:400px; overflow-y:auto;">
                        ${permsHtml}
                    </div>
                    <p style="font-size:0.75rem; color:var(--text-muted); margin-top:0.5rem;">User needs all of these permissions.</p>
                </div>
            </div>
            <div style="padding:1rem; border-top:1px solid var(--border); display:flex; justify-content:flex-end; gap:0.5rem;">
                <button class="btn btn-ghost" onclick="document.getElementById('command-settings-modal').remove()">Cancel</button>
                <button class="btn btn-primary" onclick="saveCommandSettings('${cmdName.replace(/'/g, "\\'")}')">Save Settings</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function saveCommandSettings(cmdName) {
    const modal = document.getElementById("command-settings-modal");
    const roleChks = modal.querySelectorAll(".role-chk:checked");
    const permChks = modal.querySelectorAll(".perm-chk:checked");

    const permKey = `${cmdName.trim().replace(/\s+/g, '.')}_permissions`;
    GLOBAL_SETTINGS[permKey] = {
        roles: Array.from(roleChks).map(c => c.value),
        permissions: Array.from(permChks).map(c => c.value)
    };

    modal.remove();
    markDirty();
}

function autoResize(el) {
    if (!el || el.scrollHeight === 0) return;
    el.style.height = 'auto';
    el.style.height = (el.scrollHeight + 2) + 'px';
}

function renderDict(s) {
    const data = GLOBAL_SETTINGS[s.key] || {};
    let rows = Object.entries(data).map(([k, v]) => `
        <div class="dict-row">
            <textarea class="textarea dict-k" rows="1" placeholder="Key" oninput="autoResize(this); markDirty()">${escapeForHtml(k)}</textarea>
            <div class="dict-value-wrapper">
                <textarea class="textarea dict-v" rows="1" placeholder="Value" oninput="autoResize(this); markDirty()">${escapeForHtml(v)}</textarea>
                <button class="emoji-btn" style="margin-top: 5px;" onclick="openEmojiPicker(this)">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                </button>
            </div>
            <button class="btn btn-danger" onclick="this.parentElement.remove(); markDirty();" style="width: auto; padding: 5px 10px;">×</button>
        </div>
    `).join("");
    return `
        <div class="setting-title">${s.label}</div>
        <div id="dict-${s.key}">${rows}</div>
        <button class="btn btn-ghost" style="margin-top: 10px;" onclick="addDictRow('${s.key}')">+ Add Entry</button>
    `;
}

function addDictRow(key) {
    const container = document.getElementById(`dict-${key}`);
    const div = document.createElement("div");
    div.className = "dict-row";
    div.innerHTML = `
        <textarea class="textarea dict-k" rows="1" placeholder="Key" oninput="autoResize(this); markDirty()"></textarea>
        <div class="dict-value-wrapper">
            <textarea class="textarea dict-v" rows="1" placeholder="Value" oninput="autoResize(this); markDirty()"></textarea>
            <button class="emoji-btn" style="margin-top: 5px;" onclick="openEmojiPicker(this)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            </button>
        </div>
        <button class="btn btn-danger" onclick="this.parentElement.remove(); markDirty();" style="width: auto; padding: 5px 10px;">×</button>
    `;
    container.appendChild(div);
    markDirty();
    div.querySelectorAll("textarea").forEach(autoResize);
}

function switchTab(id, nav) {
    document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
    nav.classList.add("active");
    document.querySelectorAll(".tab-pane").forEach(el => el.classList.add("hide"));
    const pane = document.getElementById(`tab-${id}`);
    pane.classList.remove("hide");
    
    requestAnimationFrame(() => {
        pane.querySelectorAll("textarea").forEach(autoResize);
    });

    if (window.innerWidth <= 900) toggleSidebar();
}

function markDirty() {
    isDirty = true;
    document.getElementById("save-bar").classList.add("visible");
}

function cancelChanges() {
    isDirty = false;
    document.getElementById("save-bar").classList.remove("visible");
    renderUI();
}

function openEmbedMakerModal(key) {
    const isWelcome = key === 'welcome_message';
    const validInts = isWelcome ? ['bot_joined', 'member_joined', 'member_returned'] : ['bot_left', 'member_left'];
    const intLabels = { bot_joined:'Bot Joined', bot_left:'Bot Left', member_joined:'Member Joined', member_left:'Member Left', member_returned:'Member Returned' };

    const modal = document.createElement('div');
    modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:10000; display:flex; align-items:center; justify-content:center;";
    modal.id = "embed-modal";

    const defs = GLOBAL_SETTINGS.welcome_goodbye_definitions || {};
    const ints = GLOBAL_SETTINGS.welcome_goodbye_interactions || {};
    
    let currentDefs = [];
    Object.keys(defs).forEach(id => {
        const types = ints[id] || [];
        if (types.some(t => validInts.includes(t))) currentDefs.push({ id, ...defs[id], interactions: types });
    });

    modal.innerHTML = `
        <div style="background:var(--bg-secondary); width:95%; max-width:800px; max-height:90vh; border-radius:8px; display:flex; flex-direction:column;">
            <div style="padding:1rem; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
                <h3 style="margin:0;">${isWelcome ? 'Welcome Messages' : 'Goodbye Messages'}</h3>
                <div class="flex gap-2">
                    <button class="btn btn-primary" onclick="saveEmbedDefs('${key}')">Apply</button>
                    <button class="btn btn-ghost" onclick="document.getElementById('embed-modal').remove()">×</button>
                </div>
            </div>
            <div id="embed-defs-list" style="flex:1; overflow-y:auto; padding:1.5rem;"></div>
            <div style="padding:1rem; border-top:1px solid var(--border);">
                <button class="btn btn-ghost" style="width:100%;" onclick="addEmbedDef('${key}')">+ Add New Message</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    window.currentEmbedDefs = currentDefs;
    renderEmbedDefs(key);
}

function renderEmbedDefs(key) {
    const list = document.getElementById("embed-defs-list");
    const isWelcome = key === 'welcome_message';
    const validInts = isWelcome ? ['bot_joined', 'member_joined', 'member_returned'] : ['bot_left', 'member_left'];
    const intLabels = { bot_joined:'Bot Joined', bot_left:'Bot Left', member_joined:'Member Joined', member_left:'Member Left', member_returned:'Member Returned' };

    list.innerHTML = window.currentEmbedDefs.map((def, i) => `
        <div class="setting-card" style="background:var(--bg-tertiary); border:none; margin-bottom:1rem;">
            <div class="flex justify-between items-center" style="margin-bottom:1rem;">
                <span style="font-weight:700;">Message #${i+1}</span>
                <button class="btn btn-danger" style="padding:5px 10px;" onclick="removeEmbedDef(${i}, '${key}')">×</button>
            </div>
            <button class="btn btn-ghost" style="width:100%; margin-bottom:1rem;" onclick="openIframeEditor(${i})">Edit Message & Embed</button>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap:0.5rem;">
                ${validInts.map(t => `
                    <label class="interaction-switch" style="background:var(--bg-dark); padding:8px; border-radius:4px; border:1px solid var(--border);">
                        <span style="font-size:0.75rem;">${intLabels[t]}</span>
                        <label class="switch">
                            <input type="checkbox" onchange="toggleInt(${i}, '${t}')" ${def.interactions.includes(t) ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </label>
                `).join("")}
            </div>
        </div>
    `).join("");
}

function addEmbedDef(key) {
    window.currentEmbedDefs.push({ id: "new_" + Date.now(), content: "", embeds: [], interactions: [] });
    renderEmbedDefs(key);
}

function removeEmbedDef(i, key) {
    window.currentEmbedDefs.splice(i, 1);
    renderEmbedDefs(key);
}

function toggleInt(i, type) {
    const def = window.currentEmbedDefs[i];
    if (def.interactions.includes(type)) def.interactions = def.interactions.filter(t => t !== type);
    else def.interactions.push(type);
}

function openIframeEditor(i) {
    const def = window.currentEmbedDefs[i];
    const modal = document.createElement('div');
    modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:11000; display:flex; flex-direction:column;";
    modal.id = "iframe-modal";
    modal.innerHTML = `
        <div style="padding:1rem; background:var(--bg-secondary); display:flex; justify-content:space-between; align-items:center;">
            <h3 style="margin:0;">Visual Editor</h3>
            <button class="btn btn-primary" id="btn-close-iframe">Close & Save</button>
        </div>
        <iframe id="editor-iframe" src="embed_maker.html" style="flex:1; border:none;"></iframe>
    `;
    document.body.appendChild(modal);

    const iframe = document.getElementById("editor-iframe");
    iframe.onload = () => {
        if (iframe.contentWindow.loadEmbedData) {
            iframe.contentWindow.loadEmbedData({ content: def.content, embeds: def.embeds, username: def.username, avatar_url: def.avatar_url });
        }
    };

    document.getElementById("btn-close-iframe").onclick = () => {
        if (iframe.contentWindow.getEmbedData) {
            const data = iframe.contentWindow.getEmbedData();
            def.content = data.content;
            def.embeds = data.embeds;
            def.username = data.username;
            def.avatar_url = data.avatar_url;
        }
        modal.remove();
    };
}

function saveEmbedDefs(key) {
    if (!GLOBAL_SETTINGS.welcome_goodbye_definitions) GLOBAL_SETTINGS.welcome_goodbye_definitions = {};
    if (!GLOBAL_SETTINGS.welcome_goodbye_interactions) GLOBAL_SETTINGS.welcome_goodbye_interactions = {};

    const isWelcome = key === 'welcome_message';
    const validInts = isWelcome ? ['bot_joined', 'member_joined', 'member_returned'] : ['bot_left', 'member_left'];

    Object.keys(GLOBAL_SETTINGS.welcome_goodbye_interactions).forEach(id => {
        const types = GLOBAL_SETTINGS.welcome_goodbye_interactions[id] || [];
        if (types.some(t => validInts.includes(t))) {
            delete GLOBAL_SETTINGS.welcome_goodbye_interactions[id];
            delete GLOBAL_SETTINGS.welcome_goodbye_definitions[id];
        }
    });

    window.currentEmbedDefs.forEach(def => {
        const id = def.id.startsWith("new_") ? String(Date.now() + Math.random()) : def.id;
        GLOBAL_SETTINGS.welcome_goodbye_definitions[id] = { content: def.content, embeds: def.embeds, username: def.username, avatar_url: def.avatar_url };
        GLOBAL_SETTINGS.welcome_goodbye_interactions[id] = def.interactions;
    });

    document.getElementById("status-" + key).innerText = "✓ Configured (Unsaved)";
    document.getElementById("status-" + key).style.color = "var(--success)";
    document.getElementById("embed-modal").remove();
    markDirty();
}

async function saveChanges() {
    const btn = document.getElementById("btn-save");
    const params = new URLSearchParams(location.search);
    const serverId = params.get("id");
    const token = getCookie("auth_token");
    btn.disabled = true; btn.innerText = "Saving...";

    const payload = { ...GLOBAL_SETTINGS };
    const permissionsPayload = {};

    SETTINGS_CONFIG.forEach(tab => {
        tab.settings.forEach(s => {
            if (["header", "title", "text"].includes(s.type)) return;
            const el = document.getElementById(s.key);
            if (s.type === "switch" && el) payload[s.key] = el.checked;
            else if (s.type === "textarea" && el) payload[s.key] = s.join ? el.value.split(s.join).map(v => v.trim()).filter(v => v) : el.value;
            else if (["select", "channelPick"].includes(s.type) && el) payload[s.key] = el.value || null;
            else if (s.type === "commandList") {
                GLOBAL_COMMANDS.forEach(c => {
                    const name = c.name.trim().replace(/\s+/g, '.');
                    const ck = `${name}_enabled`;
                    const pk = `${name}_permissions`;
                    const cel = document.getElementById(ck);
                    if (cel) {
                        payload[ck] = cel.checked;
                        const pData = GLOBAL_SETTINGS[pk] || { roles: [], permissions: [] };
                        permissionsPayload[pk] = {
                            ...pData,
                            enabled: cel.checked
                        };
                    }
                });
            } else if (s.type === "dict") {
                const dict = {};
                document.querySelectorAll(`#dict-${s.key} .dict-row`).forEach(row => {
                    const k = row.querySelector(".dict-k").value.trim();
                    const v = row.querySelector(".dict-v").value;
                    if (k) dict[k] = v;
                });
                payload[s.key] = dict;
            } else if (s.type === "supportChannelList") {
                const chks = document.querySelectorAll(`.support-channel-chk[data-key="${s.key}"]:checked`);
                payload[s.key] = Array.from(chks).map(cb => cb.value);
            } else if (s.type === "namedContentList") {
                const items = [];
                document.querySelectorAll(`#ncl-${s.key} .setting-card`).forEach(row => {
                    const name = row.querySelector(".ncl-name").value.trim();
                    const desc = row.querySelector(".ncl-desc").value.trim();
                    const skill = row.querySelector(".ncl-skill").value.trim();
                    if (name || desc || skill) items.push({ name, description: desc, skill });
                });
                payload[s.key] = items;
            } else if (s.type === "serverStats") {
                const enabledEl = document.getElementById("ss-enabled");
                const serverNameEl = document.getElementById("ss-server-name-template");
                const ssData = { enabled: enabledEl ? enabledEl.checked : false, stat_channels: {} };

                const existingSs = GLOBAL_SETTINGS.server_stats || {};
                const currentValue = serverNameEl ? serverNameEl.value : '';
                
                if (currentValue.trim()) {
                    ssData.server_name_template = currentValue.trim();
                } else if (existingSs.server_name_template) {
                    ssData.server_name_template = null;
                }

                const ssChannels = existingSs.stat_channels || {};
                Object.entries(ssChannels).forEach(([id, conf]) => {
                    const isNew = String(id).startsWith("new_");
                    if (isNew) {
                        if (conf.template && conf.category_id) {
                            ssData.stat_channels[id] = { template: conf.template, category_id: conf.category_id, type: conf.type || "voice" };
                        }
                    } else {
                        if (conf) ssData.stat_channels[id] = conf;
                    }
                });

                payload[s.key] = ssData;
            }
        });
    });

    payload.chatbots = { ...(GLOBAL_SETTINGS.chatbots || {}), ...PENDING_CHATBOTS };
    
    const sharedEl = document.getElementById("chatbot_shared_memory");
    const autoEl = document.getElementById("chatbot_auto_reply_on_name");
    const histEl = document.getElementById("chatbot_history_mode");
    if (sharedEl || autoEl || histEl) {
        payload.chatbot_config = {
            shared_memory: sharedEl ? sharedEl.checked : false,
            auto_reply_on_name: autoEl ? autoEl.checked : false,
            history_mode: histEl ? histEl.value : 'ai_only'
        };
    }

    try {
        const res = await fetch(`${API_BASE}/update-settings`, {
            method: "POST", headers: { "Content-Type": "application/json", "Authorization": token },
            body: JSON.stringify({ serverid: serverId, settings: payload, permissions: permissionsPayload })
        });
        if (res.ok) { 
            GLOBAL_SETTINGS = { ...payload, ...permissionsPayload }; 
            PENDING_CHATBOTS = {}; 
            isDirty = false; 
            document.getElementById("save-bar").classList.remove("visible"); 
        }
        else alert("Save failed.");
    } catch (err) { alert("Error saving."); }
    finally { btn.disabled = false; btn.innerText = "Save Changes"; }
}

if (document.getElementById("nav-menu")) document.addEventListener("DOMContentLoaded", initSettings);
