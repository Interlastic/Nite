/**
 * BeatForge - Main Application
 * Initializes all components and handles PWA installation
 */

class App {
    constructor() {
        this.initialized = false;
        this.deferredPrompt = null;
    }
    
    async init() {
        if (this.initialized) return;
        
        console.log('BeatForge initializing...');
        
        // Initialize audio engine
        await window.audioEngine.init();
        
        // Initialize sequencer
        window.sequencer.init(window.audioEngine);
        
        // Initialize visualizer
        const canvas = document.getElementById('visualizer');
        window.visualizer.init(canvas, window.audioEngine);
        
        // Initialize UI controller
        window.uiController.init(window.audioEngine, window.sequencer, window.visualizer);
        
        // Register service worker
        this.registerServiceWorker();
        
        // Set up install prompt
        this.setupInstallPrompt();
        
        // Start visualizer
        window.visualizer.start();
        
        this.initialized = true;
        console.log('BeatForge ready!');
        
        // Update status
        document.getElementById('statusText').textContent = 'Ready';
    }
    
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('service-worker.js');
                console.log('Service Worker registered:', registration.scope);
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }
    
    setupInstallPrompt() {
        const installBtn = document.getElementById('installBtn');
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            installBtn.classList.remove('hidden');
        });
        
        installBtn.addEventListener('click', async () => {
            if (!this.deferredPrompt) return;
            
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            console.log('Install prompt outcome:', outcome);
            this.deferredPrompt = null;
            installBtn.classList.add('hidden');
        });
        
        window.addEventListener('appinstalled', () => {
            console.log('App installed');
            installBtn.classList.add('hidden');
        });
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    
    // Start on first user interaction (required for AudioContext)
    const startOnInteraction = async () => {
        await app.init();
        document.removeEventListener('click', startOnInteraction);
        document.removeEventListener('keydown', startOnInteraction);
        document.removeEventListener('touchstart', startOnInteraction);
    };
    
    document.addEventListener('click', startOnInteraction, { once: true });
    document.addEventListener('keydown', startOnInteraction, { once: true });
    document.addEventListener('touchstart', startOnInteraction, { once: true });
});

// Handle visibility change for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause visualization when tab is hidden
        if (window.visualizer) {
            window.visualizer.stop();
        }
    } else {
        // Resume visualization when tab is visible
        if (window.visualizer && window.sequencer && window.sequencer.isPlaying) {
            window.visualizer.start();
        }
    }
});

// Prevent zoom on double-tap (mobile)
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - (this.lastTouchEnd || 0) < 300) {
        e.preventDefault();
    }
    this.lastTouchEnd = now;
}, false);
