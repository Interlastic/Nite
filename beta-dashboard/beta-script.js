const API_BASE = "https://api.niteapiworker.workers.dev";
const INVITE_URL = "https://discord.com/oauth2/authorize?client_id=1371513819104415804&permissions=2815042428980240&integration_type=0&scope=bot+applications.commands";

function setCookie(n, v, d = 7) {
    const dt = new Date();
    dt.setTime(dt.getTime() + (d * 24 * 60 * 60 * 1000));
    let c = n + "=" + v + ";expires=" + dt.toUTCString() + ";path=/";
    if (location.protocol === 'https:') c += ";Secure;SameSite=Lax";
    document.cookie = c;
}

function getCookie(n) {
    const m = document.cookie.match(new RegExp('(^| )' + n + '=([^;]+)'));
    return m ? m[2] : null;
}

function escapeHtml(text) {
    if (!text) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function logout() {
    document.cookie = "auth_token=;path=/;max-age=0";
    document.cookie = "auth_user=;path=/;max-age=0";
    location.href = "index.html";
}

function openLogin() {
    const w = 500;
    const h = 800;
    const l = (window.screen.width - w) / 2;
    const t = (window.screen.height - h) / 2;
    window.open(API_BASE + "/auth", "Login", `width=${w},height=${h},left=${l},top=${t}`);
}

window.addEventListener("message", (e) => {
    if (e.origin !== API_BASE) return;
    if (e.data.type === "LOGIN_SUCCESS") {
        setCookie("auth_token", e.data.token);
        setCookie("auth_user", e.data.username);
        location.reload();
    }
});

async function fetchServers() {
    const t = getCookie("auth_token");
    const st = document.getElementById("status");
    const grid = document.getElementById("server-list");
    if (!t || !grid) return;

    st.innerText = "Collecting Servers...";
    try {
        await fetch(API_BASE + "/trigger", { headers: { "Authorization": t } });
        let attempts = 0;
        while (attempts < 30) {
            attempts++;
            st.innerText = `Syncing... (${attempts}/30)`;
            const res = await fetch(`${API_BASE}/check?t=${Date.now()}`, { headers: { "Authorization": t } });
            if (res.status === 200) {
                const data = await res.json();
                renderServers(data.servers);
                st.innerText = "Select a server";
                return;
            }
            await new Promise(r => setTimeout(r, 1000));
        }
        st.innerText = "Timed Out";
    } catch (err) {
        st.innerText = "Failed to sync servers.";
    }
}

function renderServers(list) {
    const grid = document.getElementById("server-list");
    if (!grid) return;

    let h = (list || []).map(s => `
        <div class="server-card" 
             data-id="${escapeHtml(s.id)}" 
             data-name="${escapeHtml(s.name)}" 
             data-icon="${escapeHtml(s.picture_url || '')}" 
             onclick="manageServer(this)">
            <img class="server-avatar" src="${s.picture_url || 'https://cdn.discordapp.com/embed/avatars/0.png'}" alt="${escapeHtml(s.name)}">
            <span class="server-name">${escapeHtml(s.name)}</span>
        </div>
    `).join("");

    h += `
        <div class="server-card" onclick="window.open('${INVITE_URL}')">
            <div class="server-avatar flex items-center justify-center" style="background: var(--bg-tertiary);"><img src="plus.svg" style="width:30px; height:30px;"></div>
            <span class="server-name">Add to server</span>
        </div>
    `;
    grid.innerHTML = h;
}

function manageServer(el) {
    const id = el.dataset.id;
    const name = encodeURIComponent(el.dataset.name);
    const icon = encodeURIComponent(el.dataset.icon);
    location.href = `manage.html?id=${id}&name=${name}&icon=${icon}`;
}

function toggleSidebar() {
    const s = document.getElementById("sidebar");
    if (s) s.classList.toggle("open");
}

function init() {
    const u = getCookie("auth_user");
    const t = getCookie("auth_token");
    const vLogin = document.getElementById("view-login");
    const vDash = document.getElementById("view-dash");

    if (t && u) {
        if (vLogin) vLogin.classList.add("hide");
        if (vDash) {
            vDash.classList.remove("hide");
            document.getElementById("lbl-user").innerText = u;
            fetchServers();
        }
    } else {
        if (vLogin) vLogin.classList.remove("hide");
        if (vDash) vDash.classList.add("hide");
    }
}

if (document.getElementById("view-login") || document.getElementById("view-dash")) {
    document.addEventListener("DOMContentLoaded", init);
}
