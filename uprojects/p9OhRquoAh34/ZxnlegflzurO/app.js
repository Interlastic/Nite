// iOS Clone JavaScript

document.addEventListener('DOMContentLoaded', () => {
    initDateWidget();
    initAppInteractions();
    initCamera();
    initClock();
    initPhotos();
});

function initDateWidget() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const now = new Date();
    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const date = now.getDate();
    document.getElementById('widget-day').textContent = dayName;
    document.getElementById('widget-date').textContent = `${monthName} ${date}`;
}

function initAppInteractions() {
    document.querySelectorAll('.app[data-app]').forEach(app => {
        app.addEventListener('click', (e) => {
            const appName = app.dataset.app;
            openApp(appName);
            createRipple(e, app);
        });
    });
    document.querySelectorAll('.close-app').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const screenId = btn.dataset.close;
            closeApp(screenId);
        });
    });
    document.querySelector('.home-indicator').addEventListener('click', () => {
        closeAllApps();
    });
}

function createRipple(event, element) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple-effect');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    element.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

function openApp(appName) {
    const screenId = `${appName}-screen`;
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active');
    } else {
        alert(`Opening ${appName.charAt(0).toUpperCase() + appName.slice(1)}...`);
    }
}

function closeApp(screenId) {
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.remove('active');
    }
}

function closeAllApps() {
    document.querySelectorAll('.app-screen.active').forEach(screen => {
        screen.classList.remove('active');
    });
    stopCamera();
}

let cameraStream = null;
let facingMode = 'user';

async function initCamera() {
    const captureBtn = document.querySelector('.capture-btn');
    const flipBtn = document.querySelector('.flip-btn');
    const flashBtn = document.querySelector('.flash-btn');
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.classList.contains('active')) {
                startCamera();
            } else {
                stopCamera();
            }
        });
    });
    const cameraScreen = document.getElementById('camera-screen');
    observer.observe(cameraScreen, { attributes: true, attributeFilter: ['class'] });
    captureBtn.addEventListener('click', () => {
        capturePhoto(document.getElementById('camera-feed'));
    });
    flipBtn.addEventListener('click', () => {
        facingMode = facingMode === 'user' ? 'environment' : 'user';
        stopCamera();
        startCamera();
    });
    let flashOn = false;
    flashBtn.addEventListener('click', () => {
        flashOn = !flashOn;
        flashBtn.style.background = flashOn ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.2)';
    });
}

async function startCamera() {
    try {
        const constraints = {
            video: {
                facingMode: facingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        };
        cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
        document.getElementById('camera-feed').srcObject = cameraStream;
    } catch (err) {
        console.error('Error accessing camera:', err);
        alert('Unable to access camera. Please ensure you have granted camera permissions.');
    }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
}

function capturePhoto(video) {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const flash = document.createElement('div');
    flash.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: white; z-index: 10000; pointer-events: none;';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 100);
    addPhotoToGallery(canvas.toDataURL('image/jpeg'));
    alert('Photo captured!');
}

let photos = [];

function initPhotos() {
    const sampleColors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)'
    ];
    sampleColors.forEach(color => {
        photos.push(color);
    });
    renderPhotos();
}

function addPhotoToGallery(dataUrl) {
    photos.unshift(dataUrl);
    renderPhotos();
}

function renderPhotos() {
    const grid = document.getElementById('photos-grid');
    grid.innerHTML = '';
    photos.forEach(photo => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.style.background = photo.startsWith('data:') ? 'none' : photo;
        if (photo.startsWith('data:')) {
            const img = document.createElement('img');
            img.src = photo;
            photoItem.appendChild(img);
        }
        grid.appendChild(photoItem);
    });
}

function initClock() {
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const digitalTime = document.getElementById('digital-time');
    digitalTime.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    const hourHand = document.getElementById('hour-hand');
    const minuteHand = document.getElementById('minute-hand');
    const secondHand = document.getElementById('second-hand');
    const hourDeg = (hours % 12) * 30 + minutes * 0.5;
    const minuteDeg = minutes * 6;
    const secondDeg = seconds * 6;
    hourHand.style.transform = `rotate(${hourDeg}deg)`;
    minuteHand.style.transform = `rotate(${minuteDeg}deg)`;
    secondHand.style.transform = `rotate(${secondDeg}deg)`;
}

document.querySelectorAll('.settings-item').forEach(item => {
    item.addEventListener('click', () => {
        const settingName = item.querySelector('span').textContent;
        alert(`${settingName} settings`);
    });
});

document.querySelectorAll('.message-item').forEach(item => {
    item.addEventListener('click', () => {
        const name = item.querySelector('.message-name').textContent;
        alert(`Open conversation with ${name}`);
    });
});
