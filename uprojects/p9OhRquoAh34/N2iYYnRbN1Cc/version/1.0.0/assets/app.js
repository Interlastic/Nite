// Noise Detector - Emoji Bouncer with Matter.js Physics Engine

// Matter.js module aliases
const { Engine, Render, Runner, Bodies, Body, Composite, Events, Vector } = Matter;

// App configuration with editable settings
const config = {
    sensitivity: 1.5,
    threshold: 70,
    emojiCount: 15,
    bounceForce: 0.05,
    gravity: 1,
    emojiSize: 40,
    quietDuration: 500
};

// Emojis to use
const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🙈', '🙉', '🙊', '💋', '💌', '💘', '💝', '💖', '💗', '💓', '💞', '💕', '💟', '❣️', '💔', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💣', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'];

// Global variables
let engine, render, runner;
let emojiBodies = [];
let audioContext, analyser, microphone, dataArray;
let isListening = false;
let currentVolume = 0;
let quietTimeout = null;
let canvasWidth, canvasHeight;

// DOM elements
const startBtn = document.getElementById('start-btn');
const volumeBar = document.getElementById('volume-bar');
const volumeValue = document.getElementById('volume-value');
const quietOverlay = document.getElementById('quiet-overlay');
const settingsPanel = document.getElementById('settings-panel');
const settingsToggle = document.getElementById('settings-toggle');

// Initialize physics engine
function initPhysics() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    // Create engine
    engine = Engine.create();
    engine.world.gravity.y = config.gravity;

    // Create renderer
    render = Render.create({
        element: document.getElementById('canvas-container'),
        canvas: document.getElementById('physics-canvas'),
        engine: engine,
        options: {
            width: canvasWidth,
            height: canvasHeight,
            wireframes: false,
            background: 'transparent',
            pixelRatio: window.devicePixelRatio
        }
    });

    // Create walls
    const wallThickness = 60;
    const walls = [
        // Floor
        Bodies.rectangle(canvasWidth / 2, canvasHeight + wallThickness / 2, canvasWidth * 2, wallThickness, { 
            isStatic: true,
            render: { visible: false }
        }),
        // Left wall
        Bodies.rectangle(-wallThickness / 2, canvasHeight / 2, wallThickness, canvasHeight * 2, { 
            isStatic: true,
            render: { visible: false }
        }),
        // Right wall
        Bodies.rectangle(canvasWidth + wallThickness / 2, canvasHeight / 2, wallThickness, canvasHeight * 2, { 
            isStatic: true,
            render: { visible: false }
        }),
        // Ceiling
        Bodies.rectangle(canvasWidth / 2, -wallThickness / 2, canvasWidth * 2, wallThickness, { 
            isStatic: true,
            render: { visible: false }
        })
    ];

    Composite.add(engine.world, walls);

    // Create emoji bodies
    createEmojiBodies();

    // Run the renderer
    Render.run(render);

    // Create runner
    runner = Runner.create();
    Runner.run(runner, engine);

    // Custom render for emojis
    Events.on(render, 'afterRender', customRender);
}

// Create emoji bodies
function createEmojiBodies() {
    // Remove existing bodies
    emojiBodies.forEach(body => Composite.remove(engine.world, body));
    emojiBodies = [];

    for (let i = 0; i < config.emojiCount; i++) {
        const x = Math.random() * (canvasWidth - 100) + 50;
        const y = Math.random() * (canvasHeight / 2);
        const size = config.emojiSize;
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];

        const body = Bodies.circle(x, y, size / 2, {
            restitution: 0.8,
            friction: 0.01,
            frictionAir: 0.001,
            density: 0.001,
            render: { visible: false },
            label: emoji
        });

        emojiBodies.push(body);
        Composite.add(engine.world, body);
    }
}

// Custom render to draw emojis
function customRender() {
    const ctx = render.context;
    ctx.font = `${config.emojiSize}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    emojiBodies.forEach(body => {
        const emoji = body.label;
        ctx.save();
        ctx.translate(body.position.x, body.position.y);
        ctx.rotate(body.angle);
        ctx.fillText(emoji, 0, 0);
        ctx.restore();
    });
}

// Apply force to emojis based on volume
function applyVolumeForce(volume) {
    const forceMagnitude = volume * config.bounceForce * 0.01;

    emojiBodies.forEach((body, index) => {
        // Random upward and sideways force based on volume
        const forceX = (Math.random() - 0.5) * forceMagnitude * 2;
        const forceY = -Math.random() * forceMagnitude * 3 - forceMagnitude;

        Body.applyForce(body, body.position, {
            x: forceX,
            y: forceY
        });

        // Add some spin
        Body.setAngularVelocity(body, body.angularVelocity + (Math.random() - 0.5) * forceMagnitude * 0.1);
    });
}

// Initialize audio
async function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        dataArray = new Uint8Array(analyser.frequencyBinCount);

        isListening = true;
        startBtn.classList.add('hidden');

        // Start audio processing loop
        processAudio();
    } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Could not access microphone. Please ensure microphone permissions are granted.');
    }
}

// Process audio data
function processAudio() {
    if (!isListening) return;

    analyser.getByteFrequencyData(dataArray);

    // Calculate average volume
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
    }
    const average = sum / dataArray.length;

    // Normalize to 0-100 range and apply sensitivity
    currentVolume = Math.min(100, (average / 128) * 100 * config.sensitivity);

    // Update UI
    volumeBar.style.width = `${currentVolume}%`;
    volumeValue.textContent = `${Math.round(currentVolume)} dB`;

    // Apply physics force based on volume
    if (currentVolume > 5) {
        applyVolumeForce(currentVolume);
    }

    // Check if too loud
    if (currentVolume > config.threshold) {
        showQuietOverlay();
    }

    requestAnimationFrame(processAudio);
}

// Show quiet overlay
function showQuietOverlay() {
    quietOverlay.classList.add('active');

    // Create floating emoji particles
    createEmojiParticles();

    // Clear existing timeout
    if (quietTimeout) {
        clearTimeout(quietTimeout);
    }

    // Hide overlay after duration
    quietTimeout = setTimeout(() => {
        quietOverlay.classList.remove('active');
    }, config.quietDuration);
}

// Create floating emoji particles for overlay effect
function createEmojiParticles() {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'emoji-particle';
            particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            quietOverlay.appendChild(particle);

            // Remove after animation
            setTimeout(() => particle.remove(), 1000);
            particle = null;
        }, i * 100);
    }
}

// Update gravity
function updateGravity(value) {
    config.gravity = value;
    engine.world.gravity.y = value;
}

// Setup settings listeners
function setupSettings() {
    // Sensitivity
    const sensitivityInput = document.getElementById('sensitivity');
    const sensitivityValue = document.getElementById('sensitivity-value');
    sensitivityInput.addEventListener('input', (e) => {
        config.sensitivity = parseFloat(e.target.value);
        sensitivityValue.textContent = config.sensitivity.toFixed(1);
    });

    // Threshold
    const thresholdInput = document.getElementById('threshold');
    const thresholdValueEl = document.getElementById('threshold-value');
    thresholdInput.addEventListener('input', (e) => {
        config.threshold = parseInt(e.target.value);
        thresholdValueEl.textContent = config.threshold;
    });

    // Emoji Count
    const emojiCountInput = document.getElementById('emoji-count');
    const emojiCountValueEl = document.getElementById('emoji-count-value');
    emojiCountInput.addEventListener('input', (e) => {
        config.emojiCount = parseInt(e.target.value);
        emojiCountValueEl.textContent = config.emojiCount;
        createEmojiBodies();
    });

    // Bounce Force
    const bounceForceInput = document.getElementById('bounce-force');
    const bounceForceValueEl = document.getElementById('bounce-force-value');
    bounceForceInput.addEventListener('input', (e) => {
        config.bounceForce = parseFloat(e.target.value);
        bounceForceValueEl.textContent = config.bounceForce.toFixed(2);
    });

    // Gravity
    const gravityInput = document.getElementById('gravity');
    const gravityValueEl = document.getElementById('gravity-value');
    gravityInput.addEventListener('input', (e) => {
        updateGravity(parseFloat(e.target.value));
        gravityValueEl.textContent = config.gravity.toFixed(1);
    });

    // Emoji Size
    const emojiSizeInput = document.getElementById('emoji-size');
    const emojiSizeValueEl = document.getElementById('emoji-size-value');
    emojiSizeInput.addEventListener('input', (e) => {
        config.emojiSize = parseInt(e.target.value);
        emojiSizeValueEl.textContent = config.emojiSize;
        // Recreate bodies with new size
        createEmojiBodies();
    });

    // Quiet Duration
    const quietDurationInput = document.getElementById('quiet-duration');
    const quietDurationValueEl = document.getElementById('quiet-duration-value');
    quietDurationInput.addEventListener('input', (e) => {
        config.quietDuration = parseInt(e.target.value);
        quietDurationValueEl.textContent = config.quietDuration;
    });

    // Settings panel toggle
    settingsToggle.addEventListener('click', () => {
        settingsPanel.classList.toggle('collapsed');
    });
}

// Handle window resize
function handleResize() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    render.canvas.width = canvasWidth;
    render.canvas.height = canvasHeight;
    render.options.width = canvasWidth;
    render.options.height = canvasHeight;

    // Recreate walls
    const walls = Composite.allBodies(engine.world).filter(body => body.isStatic);
    Composite.remove(engine.world, walls);

    const wallThickness = 60;
    const newWalls = [
        Bodies.rectangle(canvasWidth / 2, canvasHeight + wallThickness / 2, canvasWidth * 2, wallThickness, { 
            isStatic: true,
            render: { visible: false }
        }),
        Bodies.rectangle(-wallThickness / 2, canvasHeight / 2, wallThickness, canvasHeight * 2, { 
            isStatic: true,
            render: { visible: false }
        }),
        Bodies.rectangle(canvasWidth + wallThickness / 2, canvasHeight / 2, wallThickness, canvasHeight * 2, { 
            isStatic: true,
            render: { visible: false }
        }),
        Bodies.rectangle(canvasWidth / 2, -wallThickness / 2, canvasWidth * 2, wallThickness, { 
            isStatic: true,
            render: { visible: false }
        })
    ];

    Composite.add(engine.world, newWalls);
}

// Initialize app
function init() {
    initPhysics();
    setupSettings();

    // Start button handler
    startBtn.addEventListener('click', initAudio);

    // Window resize handler
    window.addEventListener('resize', handleResize);
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        config,
        emojis,
        createEmojiBodies,
        applyVolumeForce,
        updateGravity,
        showQuietOverlay
    };
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
