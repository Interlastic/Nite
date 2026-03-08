let GLOBAL_SETTINGS = {};
let GLOBAL_CHANNELS = [];
let GLOBAL_ROLES = [];
let GLOBAL_COMMANDS = [];
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
                GLOBAL_ROLES = data.roles || [];
                GLOBAL_COMMANDS = data.commands || [];
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
    });

    viewport.addEventListener("input", markDirty);
    viewport.addEventListener("change", markDirty);
}

function renderSettings(list) {
    return list.map(s => {
        if (s.type === "header") return `<h2 style="margin: 2rem 0 1rem;">${s.text}</h2>`;
        if (s.type === "title") return `<h3 style="margin: 1.5rem 0 0.5rem; color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase;">${s.text}</h3>`;
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

function renderCommands() {
    return GLOBAL_COMMANDS.map(c => {
        const key = `${c.name.trim().replace(/\s+/g, '.')}_enabled`;
        const checked = GLOBAL_SETTINGS[key] !== false;
        return `
            <div class="command-item">
                <div class="command-header">
                    <span class="command-name">/${c.name}</span>
                    <label class="switch">
                        <input type="checkbox" id="${key}" ${checked ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="command-desc">${escapeForHtml(c.description)}</div>
            </div>
        `;
    }).join("");
}

function renderDict(s) {
    const data = GLOBAL_SETTINGS[s.key] || {};
    let rows = Object.entries(data).map(([k, v]) => `
        <div class="dict-row">
            <input type="text" class="input dict-k" value="${escapeForHtml(k)}" placeholder="Key">
            <textarea class="textarea dict-v" rows="1" placeholder="Value">${escapeForHtml(v)}</textarea>
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
        <input type="text" class="input dict-k" placeholder="Key">
        <textarea class="textarea dict-v" rows="1" placeholder="Value"></textarea>
        <button class="btn btn-danger" onclick="this.parentElement.remove(); markDirty();" style="width: auto; padding: 5px 10px;">×</button>
    `;
    container.appendChild(div);
    markDirty();
}

function switchTab(id, nav) {
    document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
    nav.classList.add("active");
    document.querySelectorAll(".tab-pane").forEach(el => el.classList.add("hide"));
    document.getElementById(`tab-${id}`).classList.remove("hide");
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
    SETTINGS_CONFIG.forEach(tab => {
        tab.settings.forEach(s => {
            if (["header", "title", "text"].includes(s.type)) return;
            const el = document.getElementById(s.key);
            if (s.type === "switch" && el) payload[s.key] = el.checked;
            else if (s.type === "textarea" && el) payload[s.key] = s.join ? el.value.split(s.join).map(v => v.trim()).filter(v => v) : el.value;
            else if (["select", "channelPick"].includes(s.type) && el) payload[s.key] = el.value || null;
            else if (s.type === "commandList") {
                GLOBAL_COMMANDS.forEach(c => {
                    const ck = `${c.name.trim().replace(/\s+/g, '.')}_enabled`;
                    const cel = document.getElementById(ck);
                    if (cel) payload[ck] = cel.checked;
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
            body: JSON.stringify({ serverid: serverId, settings: payload })
        });
        if (res.ok) { GLOBAL_SETTINGS = payload; PENDING_CHATBOTS = {}; isDirty = false; document.getElementById("save-bar").classList.remove("visible"); }
        else alert("Save failed.");
    } catch (err) { alert("Error saving."); }
    finally { btn.disabled = false; btn.innerText = "Save Changes"; }
}

if (document.getElementById("nav-menu")) document.addEventListener("DOMContentLoaded", initSettings);
