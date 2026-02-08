function downloadApp(name) { document.getElementById('download-modal').classList.add('active'); }
function closeModal() { document.getElementById('download-modal').classList.remove('active'); }
function closeApp() { window.location.href = 'index.html'; }
document.querySelector('.search-input').addEventListener('keypress',e => { if(e.key==='Enter') downloadApp('Search'); });
