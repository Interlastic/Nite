// App data and configurations
const apps = {
    phone: {
        name: 'Phone',
        icon: '📱',
        color: '#4caf50',
        content: `
            <div class="placeholder">
                <div class="placeholder-icon">📱</div>
                <h3>Phone App</h3>
                <p>Dialer and contacts would appear here</p>
            </div>
        `
    },
    messages: {
        name: 'Messages',
        icon: '💬',
        color: '#2196f3',
        content: `
            <div class="placeholder">
                <div class="placeholder-icon">💬</div>
                <h3>Messages</h3>
                <p>Your conversations would appear here</p>
            </div>
        `
    },
    camera: {
        name: 'Camera',
        icon: '📷',
        color: '#ff5722',
        content: `
            <div class="placeholder" style="background: #000; color: white;">
                <div class="placeholder-icon">📷</div>
                <h3>Camera</h3>
                <p>Camera viewfinder would appear here</p>
            </div>
        `
    },
    gallery: {
        name: 'Gallery',
        icon: '🖼️',
        color: '#9c27b0',
        content: `
            <div class="placeholder">
                <div class="placeholder-icon">🖼️</div>
                <h3>Gallery</h3>
                <p>Your photos and videos would appear here</p>
            </div>
        `
    },
    settings: {
        name: 'Settings',
        icon: '⚙️',
        color: '#607d8b',
        content: `
            <div class="placeholder">
                <div class="placeholder-icon">⚙️</div>
                <h3>Settings</h3>
                <p>Device settings would appear here</p>
            </div>
        `
    },
    browser: {
        name: 'Browser',
        icon: '🌐',
        color: '#00bcd4',
        content: `
            <div class="placeholder">
                <div class="placeholder-icon">🌐</div>
                <h3>Browser</h3>
                <p>Web browser would appear here</p>
            </div>
        `
    },
    music: {
        name: 'Music',
        icon: '🎵',
        color: '#e91e63',
        content: `
            <div class="placeholder">
                <div class="placeholder-icon">🎵</div>
                <h3>Music</h3>
                <p>Your music library would appear here</p>
            </div>
        `
    },
    maps: {
        name: 'Maps',
        icon: '🗺️',
        color: '#3f51b5',
        content: `
            <div class="placeholder">
                <div class="placeholder-icon">🗺️</div>
                <h3>Maps</h3>
                <p>Navigation and maps would appear here</p>
            </div>
        `
    },
    weather: {
        name: 'Weather',
        icon: '🌤️',
        color: '#00bcd4',
        content: `
            <div class="placeholder">
                <div class="placeholder-icon">🌤️</div>
                <h3>Weather</h3>
                <p>Weather forecast would appear here</p>
            </div>
        `
    }
};

// DOM Elements
const homeScreen = document.getElementById('homeScreen');
const appContainer = document.getElementById('appContainer');
const navBack = document.getElementById('navBack');
const navHome = document.getElementById('navHome');
const navRecents = document.getElementById('navRecents');

let currentApp = null;
let isAnimating = false;

// Update time
function updateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
    const dateStr = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
    });
    
    document.querySelector('.status-time').textContent = timeStr;
    document.querySelector('.clock-widget .time').textContent = timeStr;
    document.querySelector('.clock-widget .date').textContent = dateStr;
}

// Update time every second
updateTime();
setInterval(updateTime, 1000);

// Open app
function openApp(appId) {
    if (isAnimating || currentApp) return;
    if (!apps[appId]) return;
    
    isAnimating = true;
    const appData = apps[appId];
    
    // Create app element
    const appElement = document.createElement('div');
    appElement.className = 'app';
    appElement.id = `app-${appId}`;
    appElement.innerHTML = `
        <div class="app-header" style="background: ${appData.color}">
            <h2>${appData.name}</h2>
        </div>
        <div class="app-content">
            ${appData.content}
        </div>
    `;
    
    appContainer.appendChild(appElement);
    
    // Animate home screen out
    homeScreen.classList.add('animating-out');
    
    // Animate app in
    setTimeout(() => {
        appElement.classList.add('open');
        currentApp = appId;
        isAnimating = false;
    }, 50);
}

// Close current app
function closeApp() {
    if (isAnimating || !currentApp) return;
    
    isAnimating = true;
    const appElement = document.getElementById(`app-${currentApp}`);
    
    if (appElement) {
        // Animate app out
        appElement.classList.remove('open');
        appElement.classList.add('closing');
        
        // Animate home screen in
        homeScreen.classList.remove('animating-out');
        homeScreen.classList.add('animating-in');
        
        // Remove app element after animation
        setTimeout(() => {
            appElement.remove();
            homeScreen.classList.remove('animating-in');
            currentApp = null;
            isAnimating = false;
        }, 300);
    } else {
        isAnimating = false;
        currentApp = null;
    }
}

// Go back (same as close app for now)
function goBack() {
    closeApp();
}

// Go home
function goHome() {
    closeApp();
}

// Show recents (placeholder)
function showRecents() {
    if (currentApp) {
        closeApp();
    }
    // Could add a recents screen here
    console.log('Recents - Feature coming soon!');
}

// Event listeners for app icons
document.querySelectorAll('.app-icon').forEach(icon => {
    icon.addEventListener('click', () => {
        const appId = icon.dataset.app;
        if (appId) {
            openApp(appId);
        }
    });
});

// Navigation bar listeners
navBack.addEventListener('click', goBack);
navHome.addEventListener('click', goHome);
navRecents.addEventListener('click', showRecents);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Backspace') {
        goBack();
    }
    if (e.key === 'Home') {
        goHome();
    }
});

// Prevent context menu on right click
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

console.log('AndroidOS Clone loaded! Click any app icon to open it.');