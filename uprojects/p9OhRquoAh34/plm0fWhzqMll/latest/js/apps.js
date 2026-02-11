// App Content and Initialization

// Get app HTML content
function getAppContent(appName) {
  const apps = {
    camera: getCameraApp(),
    photos: getPhotosApp(),
    calculator: getCalculatorApp(),
    weather: getWeatherApp(),
    notes: getNotesApp(),
    settings: getSettingsApp(),
    clock: getClockApp(),
    messages: getMessagesApp(),
    music: getMusicApp(),
    wallet: getWalletApp(),
    safari: getSafariApp(),
    mail: getMailApp(),
    calendar: getCalendarApp(),
    maps: getMapsApp(),
    facetime: getFacetimeApp(),
    appstore: getAppStoreApp(),
    health: getHealthApp(),
    files: getFilesApp(),
    reminders: getRemindersApp(),
    videos: getVideosApp()
  };
  
  return apps[appName] || getPlaceholderApp(appName);
}

// Initialize app-specific functionality
function initApp(appName) {
  switch(appName) {
    case 'camera': initCameraApp(); break;
    case 'photos': initPhotosApp(); break;
    case 'calculator': initCalculatorApp(); break;
    case 'weather': initWeatherApp(); break;
    case 'notes': initNotesApp(); break;
    case 'settings': initSettingsApp(); break;
    case 'clock': initClockApp(); break;
    case 'music': initMusicApp(); break;
  }
}

// =========================================
// CAMERA APP
// =========================================
function getCameraApp() {
  return `
    <div class="camera-app">
      <div class="camera-viewfinder">
        <video id="cameraVideo" autoplay playsinline></video>
        <canvas id="cameraCanvas" style="display:none;"></canvas>
        <div class="camera-overlay">
          <div class="camera-grid">
            <div></div><div></div><div></div>
            <div></div><div></div><div></div>
            <div></div><div></div><div></div>
          </div>
        </div>
        <div class="camera-top-bar">
          <button class="camera-btn" id="flashBtn">⚡</button>
          <button class="camera-btn" id="hdrBtn">HDR</button>
        </div>
      </div>
      <div class="camera-controls">
        <div class="camera-shutter-area">
          <div class="camera-thumbnail">
            <img src="" alt="" id="lastPhoto" style="display:none;">
          </div>
          <button class="camera-shutter" id="shutterBtn">
            <div class="camera-shutter-inner"></div>
          </button>
          <button class="camera-btn" id="flipBtn">🔄</button>
        </div>
        <div class="camera-mode-selector">
          <span class="camera-mode">TIME-LAPSE</span>
          <span class="camera-mode">SLO-MO</span>
          <span class="camera-mode">CINEMATIC</span>
          <span class="camera-mode active">VIDEO</span>
          <span class="camera-mode">PHOTO</span>
          <span class="camera-mode">PORTRAIT</span>
          <span class="camera-mode">PANO</span>
        </div>
      </div>
    </div>
  `;
}

let cameraStream = null;
let facingMode = 'environment';

function initCameraApp() {
  const video = document.getElementById('cameraVideo');
  const shutterBtn = document.getElementById('shutterBtn');
  const flipBtn = document.getElementById('flipBtn');
  const lastPhoto = document.getElementById('lastPhoto');
  
  if (iOS.photos.length > 0) {
    lastPhoto.src = iOS.photos[0].data;
    lastPhoto.style.display = 'block';
  }
  
  startCamera();
  
  shutterBtn.addEventListener('click', capturePhoto);
  
  flipBtn.addEventListener('click', () => {
    facingMode = facingMode === 'environment' ? 'user' : 'environment';
    stopCamera();
    startCamera();
  });
  
  document.querySelectorAll('.camera-mode').forEach(mode => {
    mode.addEventListener('click', () => {
      document.querySelector('.camera-mode.active').classList.remove('active');
      mode.classList.add('active');
    });
  });
}

async function startCamera() {
  try {
    const video = document.getElementById('cameraVideo');
    const constraints = {
      video: { facingMode: facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
      audio: false
    };
    cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = cameraStream;
  } catch (err) {
    console.error('Camera error:', err);
    alert('Camera access denied. Please allow camera access to use this feature.');
  }
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
}

function capturePhoto() {
  const video = document.getElementById('cameraVideo');
  const canvas = document.getElementById('cameraCanvas');
  const lastPhoto = document.getElementById('lastPhoto');
  
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  
  if (facingMode === 'user') {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  
  ctx.drawImage(video, 0, 0);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
  savePhoto(dataUrl);
  
  lastPhoto.src = dataUrl;
  lastPhoto.style.display = 'block';
  
  const flash = document.createElement('div');
  flash.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:#fff;z-index:9999;opacity:1;transition:opacity 0.3s;';
  document.body.appendChild(flash);
  setTimeout(() => flash.style.opacity = '0', 50);
  setTimeout(() => flash.remove(), 350);
  
  hapticFeedback();
}

// =========================================
// PHOTOS APP
// =========================================
function getPhotosApp() {
  const photosHTML = iOS.photos.map(photo => `
    <div class="photos-item" data-id="${photo.id}">
      <img src="${photo.data}" alt="Photo">
    </div>
  `).join('');
  
  const emptyHTML = iOS.photos.length === 0 ? `
    <div class="photos-empty">
      <div class="photos-empty-icon">📷</div>
      <div class="photos-empty-text">No Photos</div>
      <div class="photos-empty-hint">Take photos with the Camera app</div>
    </div>
  ` : '';
  
  return `
    <div class="photos-app">
      <div class="photos-header">
        <h1 class="photos-title">Photos</h1>
        <button class="app-header-btn">Select</button>
      </div>
      <div class="photos-tabs">
        <span class="photos-tab">Library</span>
        <span class="photos-tab active">For You</span>
        <span class="photos-tab">Albums</span>
        <span class="photos-tab">Search</span>
      </div>
      <div class="photos-grid">${photosHTML}</div>
      ${emptyHTML}
    </div>
    <div class="photo-viewer" id="photoViewer">
      <button class="photo-viewer-close" id="closeViewer">✕</button>
      <img class="photo-viewer-image" id="viewerImage" src="" alt="">
      <div class="photo-viewer-actions">
        <button class="photo-viewer-btn">📤</button>
        <button class="photo-viewer-btn">❤️</button>
        <button class="photo-viewer-btn" id="deletePhotoBtn">🗑️</button>
      </div>
    </div>
  `;
}

let currentViewingPhoto = null;

function initPhotosApp() {
  const viewer = document.getElementById('photoViewer');
  const viewerImage = document.getElementById('viewerImage');
  const closeBtn = document.getElementById('closeViewer');
  const deleteBtn = document.getElementById('deletePhotoBtn');
  
  document.querySelectorAll('.photos-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = parseInt(item.dataset.id);
      const photo = iOS.photos.find(p => p.id === id);
      if (photo) {
        currentViewingPhoto = photo;
        viewerImage.src = photo.data;
        viewer.classList.add('active');
      }
    });
  });
  
  closeBtn.addEventListener('click', () => {
    viewer.classList.remove('active');
    currentViewingPhoto = null;
  });
  
  deleteBtn.addEventListener('click', () => {
    if (currentViewingPhoto) {
      deletePhoto(currentViewingPhoto.id);
      viewer.classList.remove('active');
      openApp('photos');
    }
  });
  
  document.querySelectorAll('.photos-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelector('.photos-tab.active').classList.remove('active');
      tab.classList.add('active');
    });
  });
}

// =========================================
// CALCULATOR APP
// =========================================
function getCalculatorApp() {
  return `
    <div class="calculator-app">
      <div class="calculator-display">
        <span class="calculator-display-text" id="calcDisplay">0</span>
      </div>
      <div class="calculator-buttons">
        <button class="calc-btn function" data-action="clear">AC</button>
        <button class="calc-btn function" data-action="negate">±</button>
        <button class="calc-btn function" data-action="percent">%</button>
        <button class="calc-btn operator" data-action="divide">÷</button>
        <button class="calc-btn number" data-num="7">7</button>
        <button class="calc-btn number" data-num="8">8</button>
        <button class="calc-btn number" data-num="9">9</button>
        <button class="calc-btn operator" data-action="multiply">×</button>
        <button class="calc-btn number" data-num="4">4</button>
        <button class="calc-btn number" data-num="5">5</button>
        <button class="calc-btn number" data-num="6">6</button>
        <button class="calc-btn operator" data-action="subtract">−</button>
        <button class="calc-btn number" data-num="1">1</button>
        <button class="calc-btn number" data-num="2">2</button>
        <button class="calc-btn number" data-num="3">3</button>
        <button class="calc-btn operator" data-action="add">+</button>
        <button class="calc-btn number zero" data-num="0">0</button>
        <button class="calc-btn number" data-action="decimal">.</button>
        <button class="calc-btn operator" data-action="equals">=</button>
      </div>
    </div>
  `;
}

let calcDisplay = '0';
let calcPrevious = null;
let calcOperation = null;
let calcWaitingForOperand = false;

function initCalculatorApp() {
  document.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.num !== undefined) {
        inputNumber(btn.dataset.num);
      } else {
        inputOperation(btn.dataset.action);
      }
      updateCalcDisplay();
    });
  });
}

function inputNumber(num) {
  if (calcWaitingForOperand) {
    calcDisplay = num;
    calcWaitingForOperand = false;
  } else {
    calcDisplay = calcDisplay === '0' ? num : calcDisplay + num;
  }
}

function inputOperation(op) {
  const current = parseFloat(calcDisplay);
  switch(op) {
    case 'clear': calcDisplay = '0'; calcPrevious = null; calcOperation = null; break;
    case 'negate': calcDisplay = String(-current); break;
    case 'percent': calcDisplay = String(current / 100); break;
    case 'decimal': if (!calcDisplay.includes('.')) calcDisplay += '.'; break;
    case 'add': case 'subtract': case 'multiply': case 'divide':
      if (calcPrevious !== null && !calcWaitingForOperand) calculate();
      calcPrevious = current; calcOperation = op; calcWaitingForOperand = true; break;
    case 'equals': if (calcPrevious !== null) { calculate(); calcPrevious = null; calcOperation = null; } break;
  }
}

function calculate() {
  const current = parseFloat(calcDisplay);
  let result;
  switch(calcOperation) {
    case 'add': result = calcPrevious + current; break;
    case 'subtract': result = calcPrevious - current; break;
    case 'multiply': result = calcPrevious * current; break;
    case 'divide': result = calcPrevious / current; break;
    default: return;
  }
  calcDisplay = String(result);
  calcWaitingForOperand = true;
}

function updateCalcDisplay() {
  const display = document.getElementById('calcDisplay');
  if (display) {
    let text = calcDisplay;
    if (text.length > 9) text = parseFloat(text).toExponential(4);
    display.textContent = text;
  }
}

// =========================================
// WEATHER APP
// =========================================
function getWeatherApp() {
  return `
    <div class="weather-app">
      <div class="weather-header">
        <div class="weather-location">San Francisco</div>
        <div class="weather-temp">72°</div>
        <div class="weather-condition">Mostly Sunny</div>
        <div class="weather-high-low">H:78° L:62°</div>
      </div>
      <div class="weather-hourly">
        <div class="weather-hour-item"><span class="weather-hour-time">Now</span><span class="weather-hour-icon">☀️</span><span class="weather-hour-temp">72°</span></div>
        <div class="weather-hour-item"><span class="weather-hour-time">1PM</span><span class="weather-hour-icon">🌤️</span><span class="weather-hour-temp">74°</span></div>
        <div class="weather-hour-item"><span class="weather-hour-time">2PM</span><span class="weather-hour-icon">🌤️</span><span class="weather-hour-temp">76°</span></div>
        <div class="weather-hour-item"><span class="weather-hour-time">3PM</span><span class="weather-hour-icon">☀️</span><span class="weather-hour-temp">78°</span></div>
        <div class="weather-hour-item"><span class="weather-hour-time">4PM</span><span class="weather-hour-icon">☀️</span><span class="weather-hour-temp">77°</span></div>
        <div class="weather-hour-item"><span class="weather-hour-time">5PM</span><span class="weather-hour-icon">🌤️</span><span class="weather-hour-temp">75°</span></div>
      </div>
      <div class="weather-details">
        <div class="weather-detail-card"><div class="weather-detail-label">UV INDEX</div><div class="weather-detail-value">6</div></div>
        <div class="weather-detail-card"><div class="weather-detail-label">HUMIDITY</div><div class="weather-detail-value">52%</div></div>
        <div class="weather-detail-card"><div class="weather-detail-label">WIND</div><div class="weather-detail-value">8 mph</div></div>
        <div class="weather-detail-card"><div class="weather-detail-label">FEELS LIKE</div><div class="weather-detail-value">70°</div></div>
      </div>
    </div>
  `;
}

function initWeatherApp() {}

// =========================================
// NOTES APP
// =========================================
function getNotesApp() {
  const notesList = iOS.notes.map(note => `
    <div class="note-item" data-id="${note.id}">
      <div class="note-item-title">${note.title}</div>
      <div class="note-item-preview">${note.content.substring(0, 50)}</div>
      <div class="note-item-date">${formatDate(note.date)}</div>
    </div>
  `).join('');
  
  return `
    <div class="notes-app">
      <div class="notes-header"><h1 class="notes-title">Notes</h1></div>
      <div class="ios-search-bar notes-search"><span>🔍</span><input type="text" placeholder="Search"></div>
      <div class="notes-list">${notesList || '<div style="text-align:center;padding:40px;color:var(--ios-gray);">No notes yet</div>'}</div>
      <button class="ios-button" style="position:absolute;bottom:calc(var(--safe-area-bottom) + 20px);right:20px;border-radius:50%;width:50px;height:50px;padding:0;font-size:24px;" id="newNoteBtn">+</button>
    </div>
    <div class="note-editor" id="noteEditor">
      <div class="note-editor-header">
        <button class="app-header-btn" id="cancelNoteBtn">Cancel</button>
        <button class="app-header-btn" id="saveNoteBtn">Done</button>
      </div>
      <textarea placeholder="Start typing..." id="noteContent"></textarea>
    </div>
  `;
}

function initNotesApp() {
  const newNoteBtn = document.getElementById('newNoteBtn');
  const noteEditor = document.getElementById('noteEditor');
  const cancelBtn = document.getElementById('cancelNoteBtn');
  const saveBtn = document.getElementById('saveNoteBtn');
  const noteContent = document.getElementById('noteContent');
  
  newNoteBtn?.addEventListener('click', () => { noteContent.value = ''; noteEditor.classList.add('active'); noteContent.focus(); });
  cancelBtn?.addEventListener('click', () => { noteEditor.classList.remove('active'); });
  saveBtn?.addEventListener('click', () => {
    const content = noteContent.value.trim();
    if (content) { saveNote(content.split('\n')[0].substring(0, 30), content); noteEditor.classList.remove('active'); openApp('notes'); }
  });
  document.querySelectorAll('.note-item').forEach(item => {
    item.addEventListener('click', () => {
      const note = iOS.notes.find(n => n.id === parseInt(item.dataset.id));
      if (note) { noteContent.value = note.content; noteEditor.classList.add('active'); noteContent.focus(); }
    });
  });
}

// =========================================
// SETTINGS APP
// =========================================
function getSettingsApp() {
  return `
    <div class="settings-app">
      <div class="settings-header"><h1 class="settings-title">Settings</h1></div>
      <div class="ios-search-bar settings-search"><span>🔍</span><input type="text" placeholder="Search"></div>
      <div class="settings-section">
        <div class="settings-list">
          <div class="settings-item">
            <div class="settings-item-icon" style="background:linear-gradient(135deg,#667eea,#764ba2);">👤</div>
            <div class="settings-item-label"><div style="font-weight:600;">User</div><div style="font-size:13px;color:var(--ios-gray);">Apple ID, iCloud, Media & Purchases</div></div>
            <span class="settings-item-arrow">›</span>
          </div>
        </div>
      </div>
      <div class="settings-section">
        <div class="settings-list">
          <div class="settings-item"><div class="settings-item-icon" style="background:var(--ios-orange);">✈️</div><span class="settings-item-label">Airplane Mode</span><div class="ios-toggle" id="airplaneToggle"><div class="ios-toggle-knob"></div></div></div>
          <div class="settings-item"><div class="settings-item-icon" style="background:var(--ios-blue);">📶</div><span class="settings-item-label">Wi-Fi</span><span class="settings-item-value">Home</span><span class="settings-item-arrow">›</span></div>
          <div class="settings-item"><div class="settings-item-icon" style="background:var(--ios-blue);">📱</div><span class="settings-item-label">Bluetooth</span><span class="settings-item-value">On</span><span class="settings-item-arrow">›</span></div>
        </div>
      </div>
    </div>
  `;
}

function initSettingsApp() {
  const airplaneToggle = document.getElementById('airplaneToggle');
  airplaneToggle?.addEventListener('click', () => { airplaneToggle.classList.toggle('active'); });
}

// =========================================
// CLOCK APP
// =========================================
function getClockApp() {
  return `
    <div class="clock-app">
      <div class="clock-tabs">
        <div class="clock-tab active">World Clock</div>
        <div class="clock-tab">Alarm</div>
        <div class="clock-tab">Stopwatch</div>
        <div class="clock-tab">Timer</div>
      </div>
      <div class="clock-face"><div class="clock-time" id="clockTime">12:00:00</div></div>
    </div>
  `;
}

function initClockApp() {
  function updateClockApp() {
    const now = new Date();
    const clockTime = document.getElementById('clockTime');
    if (clockTime) clockTime.textContent = now.toLocaleTimeString('en-US', { hour12: false });
  }
  updateClockApp();
  setInterval(updateClockApp, 1000);
  document.querySelectorAll('.clock-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelector('.clock-tab.active').classList.remove('active');
      tab.classList.add('active');
    });
  });
}

// =========================================
// MUSIC APP
// =========================================
function getMusicApp() {
  return `
    <div class="music-app">
      <div class="music-player">
        <div class="music-artwork">🎵</div>
        <div class="music-info"><div class="music-title">Not Playing</div><div class="music-artist">Select a song</div></div>
        <div class="music-progress"><div class="music-progress-bar"><div class="music-progress-fill"></div></div><div class="music-time"><span>0:00</span><span>0:00</span></div></div>
        <div class="music-controls"><button class="music-btn">⏮️</button><button class="music-btn play" id="playBtn">▶️</button><button class="music-btn">⏭️</button></div>
      </div>
    </div>
  `;
}

function initMusicApp() {
  const playBtn = document.getElementById('playBtn');
  playBtn?.addEventListener('click', () => { playBtn.textContent = playBtn.textContent === '▶️' ? '⏸️' : '▶️'; });
}

// =========================================
// PLACEHOLDER APPS
// =========================================
function getPlaceholderApp(name) {
  return `<div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--ios-dark-bg);"><div style="font-size:60px;margin-bottom:20px;">📱</div><div style="font-size:24px;font-weight:600;margin-bottom:8px;text-transform:capitalize;">${name}</div><div style="font-size:14px;color:var(--ios-gray);">Coming soon</div></div>`;
}

function getMessagesApp() { return getPlaceholderApp('Messages'); }
function getWalletApp() { return getPlaceholderApp('Wallet'); }
function getSafariApp() { return getPlaceholderApp('Safari'); }
function getMailApp() { return getPlaceholderApp('Mail'); }
function getCalendarApp() { return getPlaceholderApp('Calendar'); }
function getMapsApp() { return getPlaceholderApp('Maps'); }
function getFacetimeApp() { return getPlaceholderApp('FaceTime'); }
function getAppStoreApp() { return getPlaceholderApp('App Store'); }
function getHealthApp() { return getPlaceholderApp('Health'); }
function getFilesApp() { return getPlaceholderApp('Files'); }
function getRemindersApp() { return getPlaceholderApp('Reminders'); }
function getVideosApp() { return getPlaceholderApp('Videos'); }