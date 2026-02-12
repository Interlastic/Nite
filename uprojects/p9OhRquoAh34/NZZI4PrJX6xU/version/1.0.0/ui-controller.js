/**
 * BeatForge - UI Controller
 * Handles all UI interactions and updates
 */

class UIController {
    constructor() {
        this.audioEngine = null;
        this.sequencer = null;
        this.visualizer = null;
        this.elements = {};
        this.keyboardMap = {
            'a': { note: 'C', octave: 4, freq: 261.63 },
            'w': { note: 'C#', octave: 4, freq: 277.18 },
            's': { note: 'D', octave: 4, freq: 293.66 },
            'e': { note: 'D#', octave: 4, freq: 311.13 },
            'd': { note: 'E', octave: 4, freq: 329.63 },
            'f': { note: 'F', octave: 4, freq: 349.23 },
            't': { note: 'F#', octave: 4, freq: 369.99 },
            'g': { note: 'G', octave: 4, freq: 392.00 },
            'y': { note: 'G#', octave: 4, freq: 415.30 },
            'h': { note: 'A', octave: 4, freq: 440.00 },
            'u': { note: 'A#', octave: 4, freq: 466.16 },
            'j': { note: 'B', octave: 4, freq: 493.88 },
            'k': { note: 'C', octave: 5, freq: 523.25 },
            'o': { note: 'C#', octave: 5, freq: 554.37 },
            'l': { note: 'D', octave: 5, freq: 587.33 }
        };
        this.activeKeys = new Set();
    }
    
    init(audioEngine, sequencer, visualizer) {
        this.audioEngine = audioEngine;
        this.sequencer = sequencer;
        this.visualizer = visualizer;
        
        this.cacheElements();
        this.buildSequencerGrid();
        this.buildMixer();
        this.buildPianoKeyboard();
        this.bindEvents();
        this.bindKeyboard();
        
        // Set up sequencer callbacks
        this.sequencer.onStepChange = (step) => this.updateStepIndicator(step);
        this.sequencer.onPatternChange = (pattern) => this.updatePatternButtons(pattern);
        
        // Update UI with loaded data
        this.updateAllUI();
    }
    
    cacheElements() {
        this.elements = {
            playBtn: document.getElementById('playBtn'),
            stopBtn: document.getElementById('stopBtn'),
            recordBtn: document.getElementById('recordBtn'),
            tempoSlider: document.getElementById('tempoSlider'),
            tempoValue: document.getElementById('tempoValue'),
            swingSlider: document.getElementById('swingSlider'),
            swingValue: document.getElementById('swingValue'),
            stepIndicators: document.getElementById('stepIndicators'),
            sequencerGrid: document.getElementById('sequencerGrid'),
            mixerControls: document.getElementById('mixerControls'),
            pianoKeyboard: document.getElementById('pianoKeyboard'),
            currentStep: document.getElementById('currentStep'),
            currentPattern: document.getElementById('currentPattern'),
            statusText: document.getElementById('statusText'),
            visualizer: document.getElementById('visualizer'),
            installBtn: document.getElementById('installBtn'),
            
            // Pattern controls
            copyPattern: document.getElementById('copyPattern'),
            pastePattern: document.getElementById('pastePattern'),
            clearPattern: document.getElementById('clearPattern'),
            randomizePattern: document.getElementById('randomizePattern'),
            chainInput: document.getElementById('chainInput'),
            playChain: document.getElementById('playChain'),
            saveProject: document.getElementById('saveProject'),
            loadProject: document.getElementById('loadProject'),
            exportWav: document.getElementById('exportWav'),
            
            // Synth controls
            oscType: document.getElementById('oscType'),
            attack: document.getElementById('attack'),
            decay: document.getElementById('decay'),
            sustain: document.getElementById('sustain'),
            release: document.getElementById('release'),
            filterType: document.getElementById('filterType'),
            filterCutoff: document.getElementById('filterCutoff'),
            filterRes: document.getElementById('filterRes'),
            
            // Effects controls
            reverbEnabled: document.getElementById('reverbEnabled'),
            reverbDecay: document.getElementById('reverbDecay'),
            reverbMix: document.getElementById('reverbMix'),
            delayEnabled: document.getElementById('delayEnabled'),
            delayTime: document.getElementById('delayTime'),
            delayFeedback: document.getElementById('delayFeedback'),
            delayMix: document.getElementById('delayMix'),
            distortionEnabled: document.getElementById('distortionEnabled'),
            distortionDrive: document.getElementById('distortionDrive'),
            distortionMix: document.getElementById('distortionMix'),
            
            // Panel toggles
            toggleSynth: document.getElementById('toggleSynth'),
            synthContent: document.getElementById('synthContent'),
            toggleEffects: document.getElementById('toggleEffects'),
            effectsContent: document.getElementById('effectsContent')
        };
    }
    
    buildSequencerGrid() {
        const grid = this.elements.sequencerGrid;
        const indicators = this.elements.stepIndicators;
        const tracks = this.sequencer.tracks;
        const totalSteps = this.sequencer.totalSteps;
        
        grid.innerHTML = '';
        indicators.innerHTML = '';
        
        // Build step indicators
        for (let i = 0; i < totalSteps; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'step-indicator' + (i % 4 === 0 ? ' quarter' : '');
            indicator.textContent = i + 1;
            indicators.appendChild(indicator);
        }
        
        // Build track rows
        tracks.forEach(trackId => {
            const trackConfig = this.audioEngine.trackConfig[trackId];
            const row = document.createElement('div');
            row.className = 'track-row';
            row.dataset.track = trackId;
            
            // Track label
            const label = document.createElement('div');
            label.className = 'track-label';
            label.innerHTML = `<span class="track-icon">${trackConfig.icon}</span>${trackConfig.name}`;
            row.appendChild(label);
            
            // Track cells
            const cells = document.createElement('div');
            cells.className = 'track-cells';
            
            for (let i = 0; i < totalSteps; i++) {
                const cell = document.createElement('div');
                cell.className = 'step-cell' + (i % 4 === 0 ? ' beat' : '');
                cell.dataset.step = i;
                
                // Click handler
                cell.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleCellClick(trackId, i);
                });
                
                // Right-click for probability
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.handleCellRightClick(trackId, i, cell);
                });
                
                cells.appendChild(cell);
            }
            
            row.appendChild(cells);
            grid.appendChild(row);
        });
        
        this.updateGridFromPattern();
    }
    
    buildMixer() {
        const mixer = this.elements.mixerControls;
        const tracks = this.sequencer.tracks;
        
        mixer.innerHTML = '';
        
        tracks.forEach(trackId => {
            const trackConfig = this.audioEngine.trackConfig[trackId];
            const track = this.audioEngine.tracks[trackId];
            
            const strip = document.createElement('div');
            strip.className = 'mixer-strip';
            strip.innerHTML = `
                <span class="strip-label">${trackConfig.name}</span>
                <input type="range" class="volume-slider" min="0" max="100" value="${track.volume * 100}" data-track="${trackId}">
                <input type="range" class="pan-slider" min="-100" max="100" value="${track.panValue * 100}" data-track="${trackId}">
                <button class="btn btn-small mute-btn" data-track="${trackId}">M</button>
                <button class="btn btn-small solo-btn" data-track="${trackId}">S</button>
            `;
            
            mixer.appendChild(strip);
        });
        
        // Bind mixer events
        mixer.querySelectorAll('.volume-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const trackId = e.target.dataset.track;
                const value = e.target.value / 100;
                this.audioEngine.setTrackVolume(trackId, value);
            });
        });
        
        mixer.querySelectorAll('.pan-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const trackId = e.target.dataset.track;
                const value = e.target.value / 100;
                this.audioEngine.setTrackPan(trackId, value);
            });
        });
        
        mixer.querySelectorAll('.mute-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const trackId = e.target.dataset.track;
                const track = this.audioEngine.tracks[trackId];
                track.mute = !track.mute;
                this.audioEngine.setTrackMute(trackId, track.mute);
                e.target.classList.toggle('muted', track.mute);
            });
        });
        
        mixer.querySelectorAll('.solo-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const trackId = e.target.dataset.track;
                const track = this.audioEngine.tracks[trackId];
                track.solo = !track.solo;
                this.audioEngine.setTrackSolo(trackId, track.solo);
                e.target.classList.toggle('soloed', track.solo);
            });
        });
    }
    
    buildPianoKeyboard() {
        const keyboard = this.elements.pianoKeyboard;
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D'];
        const blackKeys = ['C#', 'D#', 'F#', 'G#', 'A#'];
        
        keyboard.innerHTML = '';
        
        notes.forEach((note, i) => {
            const key = document.createElement('div');
            const isBlack = blackKeys.includes(note);
            key.className = 'piano-key' + (isBlack ? ' black' : '');
            key.dataset.note = note;
            key.dataset.octave = i < 12 ? 4 : 5;
            
            const keyLabel = Object.keys(this.keyboardMap).find(k => 
                this.keyboardMap[k].note === note && 
                this.keyboardMap[k].octave === (i < 12 ? 4 : 5)
            );
            if (keyLabel) key.textContent = keyLabel.toUpperCase();
            
            // Touch/mouse events
            const playNote = () => {
                const freq = this.getFrequency(note, i < 12 ? 4 : 5);
                this.audioEngine.playNote('synth', this.audioEngine.getCurrentTime(), { frequency: freq });
                key.classList.add('active');
            };
            
            const stopNote = () => {
                key.classList.remove('active');
            };
            
            key.addEventListener('mousedown', playNote);
            key.addEventListener('mouseup', stopNote);
            key.addEventListener('mouseleave', stopNote);
            key.addEventListener('touchstart', (e) => { e.preventDefault(); playNote(); });
            key.addEventListener('touchend', stopNote);
            
            keyboard.appendChild(key);
        });
    }
    
    getFrequency(note, octave) {
        const noteMap = { 'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11 };
        const semitone = noteMap[note] + (octave - 4) * 12;
        return 261.63 * Math.pow(2, semitone / 12);
    }
    
    bindEvents() {
        // Transport controls
        this.elements.playBtn.addEventListener('click', () => this.togglePlay());
        this.elements.stopBtn.addEventListener('click', () => this.stop());
        
        // Tempo
        this.elements.tempoSlider.addEventListener('input', (e) => {
            const tempo = parseInt(e.target.value);
            this.sequencer.setTempo(tempo);
            this.elements.tempoValue.textContent = tempo;
        });
        
        // Swing
        this.elements.swingSlider.addEventListener('input', (e) => {
            const swing = parseInt(e.target.value);
            this.sequencer.setSwing(swing);
            this.elements.swingValue.textContent = swing + '%';
        });
        
        // Step count buttons
        document.querySelectorAll('.step-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.step-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const steps = parseInt(e.target.dataset.steps);
                this.sequencer.setTotalSteps(steps);
                this.buildSequencerGrid();
            });
        });
        
        // Pattern buttons
        document.querySelectorAll('.pattern-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pattern = e.target.dataset.pattern;
                this.sequencer.setCurrentPattern(pattern);
                this.updatePatternButtons(pattern);
                this.updateGridFromPattern();
            });
        });
        
        // Pattern actions
        this.elements.copyPattern.addEventListener('click', () => {
            this.sequencer.copyPattern();
            this.updateStatus('Pattern copied');
        });
        
        this.elements.pastePattern.addEventListener('click', () => {
            if (this.sequencer.pastePattern()) {
                this.updateGridFromPattern();
                this.updateStatus('Pattern pasted');
            }
        });
        
        this.elements.clearPattern.addEventListener('click', () => {
            this.sequencer.clearPattern();
            this.updateGridFromPattern();
            this.updateStatus('Pattern cleared');
        });
        
        this.elements.randomizePattern.addEventListener('click', () => {
            this.sequencer.randomizePattern();
            this.updateGridFromPattern();
            this.updateStatus('Pattern randomized');
        });
        
        // Chain
        this.elements.playChain.addEventListener('click', () => {
            const chainString = this.elements.chainInput.value;
            if (this.sequencer.setChain(chainString)) {
                this.sequencer.startChain();
            }
        });
        
        // Save/Load
        this.elements.saveProject.addEventListener('click', () => this.saveProject());
        this.elements.loadProject.addEventListener('click', () => this.loadProject());
        this.elements.exportWav.addEventListener('click', () => this.exportWAV());
        
        // Visualization mode buttons
        document.querySelectorAll('.viz-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.viz-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.visualizer.setMode(e.target.dataset.viz);
            });
        });
        
        // Synth controls
        this.elements.oscType.addEventListener('change', (e) => {
            this.audioEngine.synthSettings.oscillator = e.target.value;
        });
        
        ['attack', 'decay', 'sustain', 'release'].forEach(param => {
            this.elements[param].addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                const map = { attack: 0.01, decay: 0.01, sustain: 0.01, release: 0.01 };
                const scaledValue = value * map[param] * 10;
                this.audioEngine.synthSettings[param] = scaledValue;
                document.getElementById(param + 'Val').textContent = scaledValue.toFixed(2) + 's';
            });
        });
        
        // Filter controls
        this.elements.filterType.addEventListener('change', (e) => {
            this.audioEngine.synthSettings.filterType = e.target.value;
        });
        
        this.elements.filterCutoff.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.audioEngine.synthSettings.filterCutoff = value;
            document.getElementById('cutoffVal').textContent = value + 'Hz';
        });
        
        this.elements.filterRes.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.audioEngine.synthSettings.filterResonance = value;
            document.getElementById('resVal').textContent = value;
        });
        
        // Effects controls
        this.elements.reverbEnabled.addEventListener('change', (e) => {
            this.updateEffects();
        });
        this.elements.delayEnabled.addEventListener('change', (e) => {
            this.updateEffects();
        });
        this.elements.distortionEnabled.addEventListener('change', (e) => {
            this.updateEffects();
        });
        
        [this.elements.reverbDecay, this.elements.reverbMix, 
         this.elements.delayTime, this.elements.delayFeedback, this.elements.delayMix,
         this.elements.distortionDrive, this.elements.distortionMix].forEach(el => {
            el.addEventListener('input', () => this.updateEffects());
        });
        
        // Panel toggles
        this.elements.toggleSynth.addEventListener('click', () => {
            const content = this.elements.synthContent;
            content.classList.toggle('collapsed');
            this.elements.toggleSynth.textContent = content.classList.contains('collapsed') ? '+' : '−';
        });
        
        this.elements.toggleEffects.addEventListener('click', () => {
            const content = this.elements.effectsContent;
            content.classList.toggle('collapsed');
            this.elements.toggleEffects.textContent = content.classList.contains('collapsed') ? '+' : '−';
        });
    }
    
    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            if (e.repeat) return;
            const key = e.key.toLowerCase();
            
            if (this.keyboardMap[key] && !this.activeKeys.has(key)) {
                this.activeKeys.add(key);
                const note = this.keyboardMap[key];
                this.audioEngine.playNote('synth', this.audioEngine.getCurrentTime(), { frequency: note.freq });
                
                // Highlight key on virtual keyboard
                const keyEl = this.elements.pianoKeyboard.querySelector(`[data-note="${note.note}"]`);
                if (keyEl) keyEl.classList.add('active');
            }
            
            // Spacebar for play/pause
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePlay();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            
            if (this.keyboardMap[key]) {
                this.activeKeys.delete(key);
                const note = this.keyboardMap[key];
                const keyEl = this.elements.pianoKeyboard.querySelector(`[data-note="${note.note}"]`);
                if (keyEl) keyEl.classList.remove('active');
            }
        });
    }
    
    handleCellClick(trackId, step) {
        const isActive = this.sequencer.toggleStep(trackId, step);
        const cell = this.elements.sequencerGrid.querySelector(
            `.track-row[data-track="${trackId}"] .step-cell[data-step="${step}"]`
        );
        cell.classList.toggle('active', isActive);
    }
    
    handleCellRightClick(trackId, step, cell) {
        // Cycle through probability values
        const stepData = this.sequencer.getStepData(trackId, step);
        if (!stepData || !stepData.active) return;
        
        const probabilities = [1, 0.75, 0.5, 0.25];
        const currentIndex = probabilities.indexOf(stepData.probability);
        const newProbability = probabilities[(currentIndex + 1) % probabilities.length];
        
        this.sequencer.setStepProbability(trackId, step, newProbability);
        
        // Visual indicator
        let indicator = cell.querySelector('.probability-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'probability-indicator';
            cell.appendChild(indicator);
        }
        indicator.style.width = (newProbability * 80) + '%';
        indicator.style.opacity = newProbability < 1 ? 1 : 0;
    }
    
    togglePlay() {
        if (this.sequencer.isPlaying) {
            this.sequencer.pause();
            this.elements.playBtn.classList.remove('playing');
        } else {
            this.sequencer.start();
            this.elements.playBtn.classList.add('playing');
            this.visualizer.start();
        }
    }
    
    stop() {
        this.sequencer.stop();
        this.elements.playBtn.classList.remove('playing');
        this.updateStepIndicator(0);
    }
    
    updateStepIndicator(step) {
        // Update current step display
        this.elements.currentStep.textContent = 'Step: ' + (step + 1);
        
        // Update step indicators
        const indicators = this.elements.stepIndicators.children;
        Array.from(indicators).forEach((ind, i) => {
            ind.classList.toggle('current', i === step);
        });
        
        // Update grid cells
        document.querySelectorAll('.step-cell.current').forEach(cell => {
            cell.classList.remove('current');
        });
        document.querySelectorAll(`.step-cell[data-step="${step}"]`).forEach(cell => {
            cell.classList.add('current');
        });
    }
    
    updateGridFromPattern() {
        const pattern = this.sequencer.getPattern();
        
        Object.keys(pattern).forEach(trackId => {
            const track = pattern[trackId];
            track.forEach((stepData, step) => {
                const cell = this.elements.sequencerGrid.querySelector(
                    `.track-row[data-track="${trackId}"] .step-cell[data-step="${step}"]`
                );
                if (cell) {
                    cell.classList.toggle('active', stepData.active);
                    
                    // Probability indicator
                    if (stepData.active && stepData.probability < 1) {
                        let indicator = cell.querySelector('.probability-indicator');
                        if (!indicator) {
                            indicator = document.createElement('div');
                            indicator.className = 'probability-indicator';
                            cell.appendChild(indicator);
                        }
                        indicator.style.width = (stepData.probability * 80) + '%';
                    }
                }
            });
        });
    }
    
    updatePatternButtons(pattern) {
        document.querySelectorAll('.pattern-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.pattern === pattern);
        });
        this.elements.currentPattern.textContent = 'Pattern: ' + pattern;
        this.updateGridFromPattern();
    }
    
    updateAllUI() {
        this.elements.tempoSlider.value = this.sequencer.tempo;
        this.elements.tempoValue.textContent = this.sequencer.tempo;
        this.elements.swingSlider.value = this.sequencer.swing;
        this.elements.swingValue.textContent = this.sequencer.swing + '%';
        this.elements.chainInput.value = this.sequencer.chain.join('-');
        this.updateGridFromPattern();
    }
    
    updateEffects() {
        const reverbEnabled = this.elements.reverbEnabled.checked;
        const reverbDecay = this.elements.reverbDecay.value / 50 * 4;
        const reverbMix = this.elements.reverbMix.value / 100;
        
        const delayEnabled = this.elements.delayEnabled.checked;
        const delayTime = this.elements.delayTime.value / 100 * 1;
        const delayFeedback = this.elements.delayFeedback.value / 100;
        const delayMix = this.elements.delayMix.value / 100;
        
        const distortionEnabled = this.elements.distortionEnabled.checked;
        const distortionDrive = this.elements.distortionDrive.value;
        const distortionMix = this.elements.distortionMix.value / 100;
        
        this.audioEngine.setReverb(reverbEnabled, reverbDecay, reverbMix);
        this.audioEngine.setDelay(delayEnabled, delayTime, delayFeedback, delayMix);
        this.audioEngine.setDistortion(distortionEnabled, distortionDrive, distortionMix);
    }
    
    updateStatus(text) {
        this.elements.statusText.textContent = text;
        setTimeout(() => {
            this.elements.statusText.textContent = 'Ready';
        }, 2000);
    }
    
    saveProject() {
        const data = this.sequencer.exportProject();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'beatforge-project.json';
        a.click();
        
        URL.revokeObjectURL(url);
        this.updateStatus('Project saved');
    }
    
    loadProject() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    this.sequencer.importProject(data);
                    this.updateAllUI();
                    this.updateStatus('Project loaded');
                } catch (err) {
                    this.updateStatus('Error loading project');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    async exportWAV() {
        this.updateStatus('Exporting WAV...');
        
        // Simple real-time recording
        const duration = (this.sequencer.totalSteps / 4) * (60 / this.sequencer.tempo);
        
        // Create offline context for rendering
        const sampleRate = 44100;
        const numSamples = Math.ceil(duration * sampleRate);
        
        // For now, show a message that this is a simplified export
        // Full implementation would render the entire pattern offline
        this.updateStatus('WAV export requires full implementation');
        
        // Alternative: Use MediaRecorder to record playback
        setTimeout(() => this.updateStatus('Ready'), 2000);
    }
}

// Create global instance
window.uiController = new UIController();
