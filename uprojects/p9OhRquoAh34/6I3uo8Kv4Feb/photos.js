let photos = []; let currentPhotoIndex = 0;
document.addEventListener('DOMContentLoaded',() => {loadPhotos(); initTabs();});
function loadPhotos() {
    const cp = JSON.parse(localStorage.getItem('capturedPhotos') || '[]');
    const sp = ['linear-gradient(135deg,#667eea 0%,#764ba2 100%)','linear-gradient(135deg,#f093fb 0%,#f5576c 100%)','linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)','linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)','linear-gradient(135deg,#fa709a 0%,#fee140 100%)'];
    photos = [...cp.map(p => ({type:'image',data:p.data,date:new Date(p.date)})), ...sp.map((c,i) => ({type:'gradient',data:c,date:new Date(Date.now() - (i+1)*86400000*(i+1))}))]; renderPhotos();
}
function renderPhotos() {
    const grid = document.getElementById('photos-grid'); grid.innerHTML = '';
    photos.forEach((photo,i) => { const pi = document.createElement('div'); pi.className = 'photo-item'; pi.onclick = () => openPhoto(i);
        if(photo.type === 'image') { const img = document.createElement('img'); img.src = photo.data; pi.appendChild(img); } else { pi.style.background = photo.data; } grid.appendChild(pi);
    });
}
function initTabs() {
    document.querySelectorAll('.photos-tab').forEach(tab => { tab.addEventListener('click',() => {
        document.querySelectorAll('.photos-tab').forEach(t => t.classList.remove('active')); tab.classList.add('active');
    }); });
}
function openPhoto(i) {
    currentPhotoIndex = i; const photo = photos[i]; const viewer = document.getElementById('photo-viewer'); const vi = document.getElementById('viewer-image');
    if(photo.type === 'image') { vi.src = photo.data; vi.style.display = 'block'; } else { vi.style.display = 'none'; document.getElementById('viewer-content').style.background = photo.data; }
    document.getElementById('viewer-date').textContent = formatDate(photo.date); viewer.classList.add('active'); setupSwipe();
}
function closeViewer() {
    document.getElementById('photo-viewer').classList.remove('active'); document.getElementById('viewer-content').style.background = ''; loadPhotos();
}
function setupSwipe() {
    const v = document.getElementById('photo-viewer'); let ts = 0, te = 0;
    v.addEventListener('touchstart',e => ts = e.changedTouches[0].screenX);
    v.addEventListener('touchend',e => { te = e.changedTouches[0].screenX; const d = ts - te; if(Math.abs(d) > 50) { if(d > 0 && currentPhotoIndex < photos.length-1) openPhoto(currentPhotoIndex+1); else if(d < 0 && currentPhotoIndex > 0) openPhoto(currentPhotoIndex-1); } });
}
function formatDate(date) {
    const days = Math.floor((new Date() - date) / 86400000); if(days === 0) return 'Today'; if(days === 1) return 'Yesterday'; if(days < 7) return days + ' days ago'; return date.toLocaleDateString('en-US',{month:'short',day:'numeric'});
}
function sharePhoto() { alert('Share functionality'); }
function deletePhoto() {
    if(confirm('Delete?')) {
        if(photos[currentPhotoIndex].type === 'image') { const cp = JSON.parse(localStorage.getItem('capturedPhotos') || '[]'); const idx = cp.findIndex(p => p.data === photos[currentPhotoIndex].data); if(idx !== -1) { cp.splice(idx,1); localStorage.setItem('capturedPhotos',JSON.stringify(cp)); } }
        photos.splice(currentPhotoIndex,1); if(currentPhotoIndex >= photos.length) currentPhotoIndex = Math.max(0,photos.length-1); if(photos.length > 0) openPhoto(currentPhotoIndex); else closeViewer();
    }
}
function closeApp() { window.location.href = 'index.html'; }
