let hist=[],cur='https://www.apple.com';
document.addEventListener('DOMContentLoaded',() => updateUrl());
function updateUrl() { document.getElementById('url-bar').value=cur; }
function handleUrlKeypress(e) {
    if(e.key === 'Enter') navigateToUrl();
}
function navigateToUrl(url) {
    let u = url || document.getElementById('url-bar').value.trim();
    if(!u) return;
    if(!u.includes('http')) u='https://'+u;
    if(u !== cur) hist.push(cur);
    cur=u; updateUrl();
    loadWebview(u);
}
function loadWebview(url) {
    const webview = document.getElementById('webview');
    const home = document.getElementById('safari-home');
    
    home.style.display = 'none';
    webview.style.display = 'block';
    webview.src = url;
}
function navTo(u) {
    if(u.startsWith('safari://')) {
        document.getElementById('webview').style.display = 'none';
        document.getElementById('safari-home').style.display = 'block';
        showPage(u);
    } else {
        navigateToUrl(u);
    }
}
function showPage(u) {
    const p=u.replace('safari://',''),c=document.getElementById('safari-home');
    c.style.display = 'block';
    document.getElementById('webview').style.display = 'none';
    let html=''; if(p==='favorites') html='<h2>Favorites</h2><div class="favorites-list"><div onclick="navigateToUrl(\'https://www.apple.com\')">Apple</div><div onclick="navigateToUrl(\'https://www.google.com\')">Google</div></div>';
    else if(p==='history') html='<h2>History</h2>'+(hist.length?hist.map(h=>'<div onclick="navigateToUrl(\''+h+'\')">'+h+'</div>').join(''):'<p>No history</p>')+'</div>';
    else html='<h2>'+p+'</h2><p>Not found</p></div>';
    c.innerHTML = '<div class="safari-page"><div class="safari-logo"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div>' + html + '</div>';
    cur='safari://'+p; updateUrl();
}
function back() {
    if(hist.length>0) { cur=hist.pop(); updateUrl(); cur.startsWith('safari://')?showPage(cur):loadWebview(cur); }
}
function refresh() { cur.startsWith('safari://')?showPage(cur):loadWebview(cur); }
function closeApp() { window.location.href='index.html'; }