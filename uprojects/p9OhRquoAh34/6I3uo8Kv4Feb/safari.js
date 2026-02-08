let hist=[],cur='https://www.apple.com';
document.addEventListener('DOMContentLoaded',() => updateUrl());
function updateUrl() { document.getElementById('url-bar').value=cur; }
function navTo(u) {
    if(!u.includes('http')) u='safari://'+u.toLowerCase(); hist.push(cur); cur=u; updateUrl();
    document.getElementById('safari-content').innerHTML='<div class="loading">Loading...</div>';
    setTimeout(() => u.startsWith('safari://')?showPage(u):showExt(u),500);
}
function showPage(u) {
    const p=u.replace('safari://',''),c=document.getElementById('safari-content');
    let html=''; if(p==='favorites') html='<div class="safari-page"><h2>Favorites</h2><div class="favorites-list"><div onclick="navTo(\'https://www.apple.com\')">Apple</div><div onclick="navTo(\'https://www.google.com\')">Google</div></div></div>';
    else if(p==='history') html='<div class="safari-page"><h2>History</h2>'+(hist.length?hist.map(h=>'<div onclick="navTo(\''+h+'\')">'+h+'</div>').join(''):'<p>No history</p>')+'</div>';
    else html='<div class="safari-page"><h2>'+p+'</h2><p>Not found</p></div>';
    c.innerHTML=html; cur='safari://'+p; updateUrl();
}
function showExt(u) {
    document.getElementById('safari-content').innerHTML='<div class="safari-page"><div class="external-warning"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg><h3>External Navigation</h3><p>Cannot load external websites.</p><p style="color:#007aff;word-break:break-all;">'+u+'</p></div></div>';
}
function back() {
    if(hist.length>0) { cur=hist.pop(); updateUrl(); cur.startsWith('safari://')?showPage(cur):showExt(cur); }
}
function refresh() { cur.startsWith('safari://')?showPage(cur):showExt(cur); }
function closeApp() { window.location.href='index.html'; }
