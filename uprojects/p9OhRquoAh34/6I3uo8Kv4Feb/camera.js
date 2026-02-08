let cameraStream = null; let facingMode = 'user'; let flashOn = false; let cameraGranted = false;
document.addEventListener('DOMContentLoaded',() => {initCamera();});
async function requestCameraPermission() {
    try { const stream = await navigator.mediaDevices.getUserMedia({video:true}); stream.getTracks().forEach(t => t.stop()); cameraGranted = true; document.getElementById('permission-overlay').classList.add('hidden'); startCamera(); }
    catch(err) { console.error(err); alert('Camera permission denied. Please allow camera access.'); }
}
async function initCamera() {
    if(localStorage.getItem('cameraGranted') === 'true') { cameraGranted = true; document.getElementById('permission-overlay').classList.add('hidden'); startCamera(); }
}
async function startCamera() {
    if(!cameraGranted) return;
    try { const constraints = {video:{facingMode,width:{ideal:1280},height:{ideal:720}},audio:false}; cameraStream = await navigator.mediaDevices.getUserMedia(constraints); document.getElementById('camera-feed').srcObject = cameraStream; }
    catch(err) { console.error(err); alert('Unable to access camera.'); }
}
function stopCamera() { if(cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); cameraStream = null; } }
function capturePhoto() {
    if(!cameraStream) { alert('Camera not active.'); return; }
    const video = document.getElementById('camera-feed'); const canvas = document.createElement('canvas'); canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d'); ctx.drawImage(video,0,0);
    const flash = document.createElement('div'); flash.className = 'camera-flash'; document.body.appendChild(flash); setTimeout(() => flash.remove(),100);
    const photoData = canvas.toDataURL('image/jpeg',0.9); savePhoto(photoData); showCaptureThumbnail(photoData);
}
function savePhoto(dataUrl) {
    let photos = JSON.parse(localStorage.getItem('capturedPhotos') || '[]'); photos.unshift({data:dataUrl,date:new Date().toISOString()});
    if(photos.length > 50) photos = photos.slice(0,50); localStorage.setItem('capturedPhotos',JSON.stringify(photos));
}
function showCaptureThumbnail(dataUrl) {
    const btn = document.querySelector('.camera-control-btn'); const existing = btn.querySelector('.capture-thumbnail'); if(existing) existing.remove();
    const thumb = document.createElement('div'); thumb.className = 'capture-thumbnail'; thumb.style.backgroundImage = 'url(' + dataUrl + ')'; btn.appendChild(thumb);
}
function flipCamera() { facingMode = facingMode === 'user' ? 'environment' : 'user'; stopCamera(); startCamera(); }
function toggleFlash() { flashOn = !flashOn; document.getElementById('flash-btn').classList.toggle('active',flashOn); }
function openPhotos() { localStorage.setItem('cameraGranted','true'); window.location.href = 'photos.html'; }
function closeApp() { stopCamera(); window.location.href = 'index.html'; }
