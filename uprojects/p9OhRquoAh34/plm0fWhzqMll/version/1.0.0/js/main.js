// iOS Clone Main JavaScript

// Initialize state
const iOS = {
  isLocked: true,
  currentApp: null,
  photos: [],
  notes: [],
  settings: {
    wifi: true,
    bluetooth: true,
    airplane: false,
    darkMode: true
  }
};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  initServiceWorker();
  initClock();
  initLockScreen();
  initHomeScreen();
  initGestures();
  loadPhotos();
  loadNotes();
});

// Register Service Worker for PWA
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registered:', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed:', error);
      });
  }
}

// Update status bar time
function initClock() {
  updateClock();
  setInterval(updateClock, 1000);
  setInterval(updateLockScreen, 1000);
}

function updateClock() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;
  
  document.querySelectorAll('.status-bar-time').forEach(el => {
    el.textContent = timeStr;
  });
}

function updateLockScreen() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;
  
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  const dateStr = now.toLocaleDateString('en-US', options);
  
  const lockTime = document.querySelector('.lock-time');
  const lockDate = document.querySelector('.lock-date');
  
  if (lockTime) lockTime.textContent = timeStr;
  if (lockDate) lockDate.textContent = dateStr;
}

// Lock Screen
function initLockScreen() {
  const lockScreen = document.querySelector('.lock-screen');
  if (!lockScreen) return;
  
  let startY = 0;
  let currentY = 0;
  
  lockScreen.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
  }, { passive: true });
  
  lockScreen.addEventListener('touchmove', (e) => {
    currentY = e.touches[0].clientY;
    const diff = startY - currentY;
    if (diff > 50) {
      unlockPhone();
    }
  }, { passive: true });
  
  // Click to unlock for desktop testing
  lockScreen.addEventListener('click', unlockPhone);
}

function unlockPhone() {
  const lockScreen = document.querySelector('.lock-screen');
  if (lockScreen) {
    lockScreen.classList.add('hidden');
    iOS.isLocked = false;
    
    // Check URL params for app
    const params = new URLSearchParams(window.location.search);
    const app = params.get('app');
    if (app) {
      openApp(app);
    }
  }
}

function lockPhone() {
  const lockScreen = document.querySelector('.lock-screen');
  if (lockScreen) {
    lockScreen.classList.remove('hidden');
    iOS.isLocked = true;
    closeCurrentApp();
  }
}

// Home Screen
function initHomeScreen() {
  const appIcons = document.querySelectorAll('.app-icon');
  appIcons.forEach(icon => {
    icon.addEventListener('click', () => {
      const appName = icon.dataset.app;
      if (appName) {
        openApp(appName);
      }
    });
  });
  
  // Dock icons
  const dockIcons = document.querySelectorAll('.dock .app-icon');
  dockIcons.forEach(icon => {
    icon.addEventListener('click', () => {
      const appName = icon.dataset.app;
      if (appName) {
        openApp(appName);
      }
    });
  });
}

// App Management
function openApp(appName) {
  const appView = document.querySelector('.app-view');
  const appContainer = document.querySelector('.app-container');
  
  if (!appView || !appContainer) return;
  
  // Load app content
  const appContent = getAppContent(appName);
  appContainer.innerHTML = appContent;
  
  // Show app view
  appView.classList.add('active');
  iOS.currentApp = appName;
  
  // Initialize app-specific functionality
  initApp(appName);
  
  // Update URL
  history.pushState({ app: appName }, '', `?app=${appName}`);
}

function closeCurrentApp() {
  const appView = document.querySelector('.app-view');
  if (appView) {
    appView.classList.remove('active');
  iOS.currentApp = null;
    history.pushState({}, '', '/');
  }
}

// Gestures
function initGestures() {
  // Swipe up from bottom to go home
  let touchStartY = 0;
  let touchEndY = 0;
  
  document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  
  document.addEventListener('touchend', (e) => {
    touchEndY = e.changedTouches[0].clientY;
    const screenHeight = window.innerHeight;
    
    // If started near bottom and swiped up significantly
    if (touchStartY > screenHeight - 50 && touchStartY - touchEndY > 100) {
      if (iOS.currentApp) {
        closeCurrentApp();
      }
    }
  }, { passive: true });
  
  // Home indicator click
  const homeIndicator = document.querySelector('.home-indicator');
  if (homeIndicator) {
    homeIndicator.addEventListener('click', () => {
      if (iOS.currentApp) {
        closeCurrentApp();
      }
    });
  }
  
  // Handle back button
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.app) {
      openApp(e.state.app);
    } else {
      closeCurrentApp();
    }
  });
}

// Photo Storage
function savePhoto(dataUrl) {
  iOS.photos.unshift({
    id: Date.now(),
    data: dataUrl,
    date: new Date().toISOString()
  });
  localStorage.setItem('ios-photos', JSON.stringify(iOS.photos));
  updatePhotoThumbnail();
}

function loadPhotos() {
  const saved = localStorage.getItem('ios-photos');
  if (saved) {
    iOS.photos = JSON.parse(saved);
    updatePhotoThumbnail();
  }
}

function updatePhotoThumbnail() {
  const thumbnail = document.querySelector('.camera-thumbnail img');
  if (thumbnail && iOS.photos.length > 0) {
    thumbnail.src = iOS.photos[0].data;
  }
}

function deletePhoto(id) {
  iOS.photos = iOS.photos.filter(p => p.id !== id);
  localStorage.setItem('ios-photos', JSON.stringify(iOS.photos));
}

// Notes Storage
function saveNote(title, content) {
  const note = {
    id: Date.now(),
    title: title || 'New Note',
    content: content,
    date: new Date().toISOString()
  };
  iOS.notes.unshift(note);
  localStorage.setItem('ios-notes', JSON.stringify(iOS.notes));
  return note;
}

function loadNotes() {
  const saved = localStorage.getItem('ios-notes');
  if (saved) {
    iOS.notes = JSON.parse(saved);
  }
}

function deleteNote(id) {
  iOS.notes = iOS.notes.filter(n => n.id !== id);
  localStorage.setItem('ios-notes', JSON.stringify(iOS.notes));
}

// Helper: Format date
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Haptic feedback simulation
function hapticFeedback() {
  if ('vibrate' in navigator) {
    navigator.vibrate(10);
  }
}