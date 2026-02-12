/**
 * BeatForge - Step Sequencer
 * Handles timing, scheduling, and pattern playback
 */

class Sequencer {
    constructor() {
        this.audioEngine = null;
        this.isPlaying = false;
        this.tempo = 120;
        this.swing = 0;
        this.currentStep = 0;
        this.totalSteps = 32;
        this.lookahead = 25; // ms
        this.scheduleAheadTime = 0.1; // seconds
        this.nextNoteTime = 0;
        this.timerID = null;
        
        // Pattern data
        this.patterns = {
            A: this.createEmptyPattern(),
            B: this.createEmptyPattern(),
            C: this.createEmptyPattern(),
            D: this.createEmptyPattern()
        };
        this.currentPattern = 'A';
        this.copiedPattern = null;
        
        // Chain mode
        this.chainMode = false;
        this.chain = ['A'];
        this.chainIndex = 0;
        
        // Tracks configuration
        this.tracks = ['kick', 'snare', 'hihat', 'openhat', 'bass', 'synth', 'clap', 'perc'];
        
        // Callbacks
        this.onStepChange = null;
        this.onPatternChange = null;
        
        // Bass and synth note mappings
        this.bassNotes = {
            0: 55,    // A1
            4: 61.74, // B1
            8: 65.41, // C2
            12: 73.42, // D2
            16: 82.41, // E2
            20: 87.31, // F2
            24: 98.00, // G2
            28: 110   // A2
        };
        
        this.synthNotes = {
            0: 220,   // A3
            4: 246.94, // B3
            8: 261.63, // C4
            12: 293.66, // D4
            16: 329.63, // E4
            20: 349.23, // F4
            24: 392.00, // G4
            28: 440    // A4
        };
    }
    
    createEmptyPattern() {
        const pattern = {};
        this.tracks.forEach(track => {
            pattern[track] = new Array(64).fill(null).map(() => ({
                active: false,
                probability: 1,
                velocity: 1,
                note: null
            }));
        });
        return pattern;
    }
    
    init(audioEngine) {
        this.audioEngine = audioEngine;
        this.loadFromStorage();
    }
    
    // Timing and scheduling
    start() {
        if (this.isPlaying) return;
        
        if (!this.audioEngine.isInitialized) {
            this.audioEngine.init();
        }
        
        if (this.audioEngine.context.state === 'suspended') {
            this.audioEngine.context.resume();
        }
        
        this.isPlaying = true;
        this.currentStep = 0;
        this.nextNoteTime = this.audioEngine.getCurrentTime();
        this.scheduler();
    }
    
    stop() {
        this.isPlaying = false;
        if (this.timerID) {
            clearTimeout(this.timerID);
            this.timerID = null;
        }
        this.currentStep = 0;
        if (this.onStepChange) {
            this.onStepChange(0);
        }
    }
    
    pause() {
        this.isPlaying = false;
        if (this.timerID) {
            clearTimeout(this.timerID);
            this.timerID = null;
        }
    }
    
    resume() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.nextNoteTime = this.audioEngine.getCurrentTime();
            this.scheduler();
        }
    }
    
    scheduler() {
        const currentTime = this.audioEngine.getCurrentTime();
        
        // Schedule notes until we have enough scheduled
        while (this.nextNoteTime < currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.currentStep, this.nextNoteTime);
            this.nextStep();
        }
        
        // Continue scheduling
        if (this.isPlaying) {
            this.timerID = setTimeout(() => this.scheduler(), this.lookahead);
        }
    }
    
    nextStep() {
        const secondsPerBeat = 60.0 / this.tempo;
        const secondsPerStep = secondsPerBeat / 4; // 16th notes
        
        // Apply swing to even-numbered steps (after the first)
        let swingOffset = 0;
        if (this.swing > 0 && this.currentStep % 2 === 0 && this.currentStep > 0) {
            swingOffset = secondsPerStep * (this.swing / 100) * 0.5;
        }
        
        this.nextNoteTime += secondsPerStep + swingOffset;
        
        this.currentStep++;
        if (this.currentStep >= this.totalSteps) {
            this.currentStep = 0;
            
            // Handle chain mode
            if (this.chainMode && this.chain.length > 1) {
                this.chainIndex++;
                if (this.chainIndex >= this.chain.length) {
                    this.chainIndex = 0;
                }
                const nextPattern = this.chain[this.chainIndex];
                if (nextPattern !== this.currentPattern) {
                    this.setCurrentPattern(nextPattern);
                }
            }
        }
        
        if (this.onStepChange) {
            this.onStepChange(this.currentStep);
        }
    }
    
    scheduleNote(step, time) {
        const pattern = this.patterns[this.currentPattern];
        
        this.tracks.forEach(trackId => {
            const stepData = pattern[trackId][step];
            if (stepData && stepData.active) {
                let frequency = null;
                
                // Get frequency for melodic tracks
                if (trackId === 'bass') {
                    frequency = stepData.note || this.bassNotes[step % 32] || 55;
                } else if (trackId === 'synth') {
                    frequency = stepData.note || this.synthNotes[step % 32] || 220;
                }
                
                this.audioEngine.playNote(trackId, time, {
                    frequency: frequency,
                    probability: stepData.probability
                });
            }
        });
    }
    
    // Pattern management
    setCurrentPattern(patternId) {
        if (this.patterns[patternId]) {
            this.currentPattern = patternId;
            if (this.onPatternChange) {
                this.onPatternChange(patternId);
            }
        }
    }
    
    toggleStep(trackId, step) {
        const pattern = this.patterns[this.currentPattern];
        if (pattern && pattern[trackId] && pattern[trackId][step]) {
            pattern[trackId][step].active = !pattern[trackId][step].active;
            this.saveToStorage();
            return pattern[trackId][step].active;
        }
        return false;
    }
    
    setStepProbability(trackId, step, probability) {
        const pattern = this.patterns[this.currentPattern];
        if (pattern && pattern[trackId] && pattern[trackId][step]) {
            pattern[trackId][step].probability = probability;
            this.saveToStorage();
        }
    }
    
    setStepNote(trackId, step, note) {
        const pattern = this.patterns[this.currentPattern];
        if (pattern && pattern[trackId] && pattern[trackId][step]) {
            pattern[trackId][step].note = note;
            this.saveToStorage();
        }
    }
    
    copyPattern() {
        this.copiedPattern = JSON.parse(JSON.stringify(this.patterns[this.currentPattern]));
    }
    
    pastePattern() {
        if (this.copiedPattern) {
            this.patterns[this.currentPattern] = JSON.parse(JSON.stringify(this.copiedPattern));
            this.saveToStorage();
            return true;
        }
        return false;
    }
    
    clearPattern() {
        this.patterns[this.currentPattern] = this.createEmptyPattern();
        this.saveToStorage();
    }
    
    randomizePattern() {
        const pattern = this.patterns[this.currentPattern];
        
        this.tracks.forEach(track => {
            for (let i = 0; i < this.totalSteps; i++) {
                // Different probability based on track type
                let probability = 0.2;
                if (track === 'kick') probability = 0.25;
                else if (track === 'snare') probability = 0.15;
                else if (track === 'hihat') probability = 0.4;
                else if (track === 'bass') probability = 0.2;
                
                pattern[track][i].active = Math.random() < probability;
                pattern[track][i].probability = 0.7 + Math.random() * 0.3;
            }
        });
        
        this.saveToStorage();
    }
    
    setChain(chainString) {
        const patterns = chainString.toUpperCase().split(/[-,\s]+/).filter(p => /[ABCD]/.test(p));
        if (patterns.length > 0) {
            this.chain = patterns;
            this.chainIndex = 0;
            this.chainMode = true;
            return true;
        }
        return false;
    }
    
    startChain() {
        this.chainIndex = 0;
        this.chainMode = true;
        this.setCurrentPattern(this.chain[0]);
        this.start();
    }
    
    // Settings
    setTempo(bpm) {
        this.tempo = Math.max(60, Math.min(200, bpm));
    }
    
    setSwing(value) {
        this.swing = Math.max(0, Math.min(100, value));
    }
    
    setTotalSteps(steps) {
        this.totalSteps = steps;
        if (this.currentStep >= steps) {
            this.currentStep = 0;
        }
    }
    
    // Storage
    saveToStorage() {
        try {
            const data = {
                patterns: this.patterns,
                tempo: this.tempo,
                swing: this.swing,
                totalSteps: this.totalSteps,
                chain: this.chain
            };
            localStorage.setItem('beatforge_patterns', JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save patterns:', e);
        }
    }
    
    loadFromStorage() {
        try {
            const data = localStorage.getItem('beatforge_patterns');
            if (data) {
                const parsed = JSON.parse(data);
                if (parsed.patterns) {
                    // Merge with existing patterns to ensure all tracks exist
                    Object.keys(parsed.patterns).forEach(key => {
                        if (this.patterns[key]) {
                            this.patterns[key] = parsed.patterns[key];
                        }
                    });
                }
                if (parsed.tempo) this.tempo = parsed.tempo;
                if (parsed.swing) this.swing = parsed.swing;
                if (parsed.totalSteps) this.totalSteps = parsed.totalSteps;
                if (parsed.chain) this.chain = parsed.chain;
            }
        } catch (e) {
            console.error('Failed to load patterns:', e);
        }
    }
    
    exportProject() {
        return {
            version: '1.0',
            patterns: this.patterns,
            tempo: this.tempo,
            swing: this.swing,
            totalSteps: this.totalSteps,
            chain: this.chain,
            synthSettings: this.audioEngine.synthSettings,
            effectsSettings: this.audioEngine.effectsSettings,
            trackVolumes: Object.keys(this.audioEngine.tracks).reduce((acc, id) => {
                acc[id] = this.audioEngine.tracks[id].volume;
                return acc;
            }, {}),
            trackPans: Object.keys(this.audioEngine.tracks).reduce((acc, id) => {
                acc[id] = this.audioEngine.tracks[id].panValue;
                return acc;
            }, {})
        };
    }
    
    importProject(data) {
        try {
            if (data.patterns) {
                Object.keys(data.patterns).forEach(key => {
                    if (this.patterns[key]) {
                        this.patterns[key] = data.patterns[key];
                    }
                });
            }
            if (data.tempo) this.tempo = data.tempo;
            if (data.swing) this.swing = data.swing;
            if (data.totalSteps) this.totalSteps = data.totalSteps;
            if (data.chain) this.chain = data.chain;
            
            if (data.synthSettings) {
                this.audioEngine.setSynthSettings(data.synthSettings);
            }
            if (data.effectsSettings) {
                const e = data.effectsSettings;
                if (e.reverb) this.audioEngine.setReverb(e.reverb.enabled, e.reverb.decay, e.reverb.mix);
                if (e.delay) this.audioEngine.setDelay(e.delay.enabled, e.delay.time, e.delay.feedback, e.delay.mix);
                if (e.distortion) this.audioEngine.setDistortion(e.distortion.enabled, e.distortion.drive, e.distortion.mix);
            }
            if (data.trackVolumes) {
                Object.keys(data.trackVolumes).forEach(id => {
                    this.audioEngine.setTrackVolume(id, data.trackVolumes[id]);
                });
            }
            if (data.trackPans) {
                Object.keys(data.trackPans).forEach(id => {
                    this.audioEngine.setTrackPan(id, data.trackPans[id]);
                });
            }
            
            this.saveToStorage();
            return true;
        } catch (e) {
            console.error('Failed to import project:', e);
            return false;
        }
    }
    
    getPattern() {
        return this.patterns[this.currentPattern];
    }
    
    getStepData(trackId, step) {
        const pattern = this.patterns[this.currentPattern];
        return pattern && pattern[trackId] ? pattern[trackId][step] : null;
    }
}

// Create global instance
window.sequencer = new Sequencer();
