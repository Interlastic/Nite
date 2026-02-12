/**
 * BeatForge - Audio Engine
 * Web Audio API-based sound synthesis and effects engine
 */

class AudioEngine {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.analyser = null;
        this.compressor = null;
        this.effects = {};
        this.tracks = {};
        this.noiseBuffer = null;
        this.isInitialized = false;
        
        // Track configuration
        this.trackConfig = {
            kick: { name: 'Kick', icon: '🥁', color: '#ff4757' },
            snare: { name: 'Snare', icon: '🪘', color: '#ffa502' },
            hihat: { name: 'Hi-Hat', icon: '🎩', color: '#2ed573' },
            openhat: { name: 'Open Hat', icon: '📤', color: '#1e90ff' },
            bass: { name: 'Bass', icon: '🎸', color: '#a55eea' },
            synth: { name: 'Synth', icon: '🎹', color: '#00d4ff' },
            clap: { name: 'Clap', icon: '👏', color: '#ff6b81' },
            perc: { name: 'Perc', icon: '🔔', color: '#eccc68' }
        };
        
        // Default synth settings
        this.synthSettings = {
            oscillator: 'sawtooth',
            attack: 0.01,
            decay: 0.3,
            sustain: 0.7,
            release: 0.3,
            filterType: 'lowpass',
            filterCutoff: 5000,
            filterResonance: 1
        };
        
        // Effects settings
        this.effectsSettings = {
            reverb: { enabled: false, decay: 2.0, mix: 0.3 },
            delay: { enabled: false, time: 0.3, feedback: 0.4, mix: 0.2 },
            distortion: { enabled: false, drive: 20, mix: 0.5 }
        };
    }
    
    async init() {
        if (this.isInitialized) return;
        
        // Create AudioContext
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create master chain
        this.masterGain = this.context.createGain();
        this.masterGain.gain.value = 0.8;
        
        // Compressor for limiting
        this.compressor = this.context.createDynamicsCompressor();
        this.compressor.threshold.value = -24;
        this.compressor.knee.value = 30;
        this.compressor.ratio.value = 12;
        this.compressor.attack.value = 0.003;
        this.compressor.release.value = 0.25;
        
        // Analyser for visualization
        this.analyser = this.context.createAnalyser();
        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = 0.8;
        
        // Initialize effects
        await this.initEffects();
        
        // Create noise buffer for drums
        this.createNoiseBuffer();
        
        // Initialize track channels
        this.initTracks();
        
        // Connect master chain
        this.masterGain.connect(this.compressor);
        this.compressor.connect(this.analyser);
        this.analyser.connect(this.context.destination);
        
        this.isInitialized = true;
        console.log('Audio Engine initialized');
    }
    
    async initEffects() {
        // Reverb (convolver with generated impulse response)
        this.effects.reverb = {
            convolver: this.context.createConvolver(),
            wetGain: this.context.createGain(),
            dryGain: this.context.createGain()
        };
        await this.createReverbImpulse(2.0);
        this.effects.reverb.wetGain.gain.value = 0.3;
        this.effects.reverb.dryGain.gain.value = 1.0;
        
        // Delay
        this.effects.delay = {
            delayNode: this.context.createDelay(2.0),
            feedback: this.context.createGain(),
            wetGain: this.context.createGain(),
            dryGain: this.context.createGain()
        };
        this.effects.delay.delayNode.delayTime.value = 0.3;
        this.effects.delay.feedback.gain.value = 0.4;
        this.effects.delay.wetGain.gain.value = 0.0;
        this.effects.delay.dryGain.gain.value = 1.0;
        
        // Delay feedback loop
        this.effects.delay.delayNode.connect(this.effects.delay.feedback);
        this.effects.delay.feedback.connect(this.effects.delay.delayNode);
        
        // Distortion
        this.effects.distortion = {
            shaper: this.context.createWaveShaper(),
            wetGain: this.context.createGain(),
            dryGain: this.context.createGain()
        };
        this.createDistortionCurve(20);
        this.effects.distortion.wetGain.gain.value = 0.0;
        this.effects.distortion.dryGain.gain.value = 1.0;
    }
    
    async createReverbImpulse(duration) {
        const sampleRate = this.context.sampleRate;
        const length = sampleRate * duration;
        const impulse = this.context.createBuffer(2, length, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                const decay = Math.pow(1 - i / length, 2);
                channelData[i] = (Math.random() * 2 - 1) * decay;
            }
        }
        
        this.effects.reverb.convolver.buffer = impulse;
    }
    
    createDistortionCurve(amount) {
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
        }
        
        this.effects.distortion.shaper.curve = curve;
        this.effects.distortion.shaper.oversample = '4x';
    }
    
    createNoiseBuffer() {
        const bufferSize = this.context.sampleRate * 2;
        this.noiseBuffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = this.noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
    }
    
    initTracks() {
        Object.keys(this.trackConfig).forEach(trackId => {
            this.tracks[trackId] = {
                gain: this.context.createGain(),
                pan: this.context.createStereoPanner(),
                filter: this.context.createBiquadFilter(),
                mute: false,
                solo: false,
                volume: 0.8,
                panValue: 0
            };
            
            // Set default filter
            this.tracks[trackId].filter.type = 'lowpass';
            this.tracks[trackId].filter.frequency.value = 20000;
            
            // Connect track chain
            this.tracks[trackId].filter.connect(this.tracks[trackId].pan);
            this.tracks[trackId].pan.connect(this.tracks[trackId].gain);
        });
    }
    
    connectTrackToMaster(trackId) {
        const track = this.tracks[trackId];
        if (!track) return;
        
        // Connect through effects chain
        let output = track.gain;
        
        // Reverb
        if (this.effectsSettings.reverb.enabled) {
            output.connect(this.effects.reverb.convolver);
            this.effects.reverb.convolver.connect(this.effects.reverb.wetGain);
            this.effects.reverb.wetGain.connect(this.masterGain);
        }
        
        // Delay
        if (this.effectsSettings.delay.enabled) {
            output.connect(this.effects.delay.delayNode);
            this.effects.delay.delayNode.connect(this.effects.delay.wetGain);
            this.effects.delay.wetGain.connect(this.masterGain);
        }
        
        // Distortion
        if (this.effectsSettings.distortion.enabled) {
            output.connect(this.effects.distortion.shaper);
            this.effects.distortion.shaper.connect(this.effects.distortion.wetGain);
            this.effects.distortion.wetGain.connect(this.masterGain);
        }
        
        // Dry signal
        output.connect(this.masterGain);
    }
    
    // Sound Synthesis Methods
    
    playKick(time, probability = 1) {
        if (Math.random() > probability) return;
        
        const track = this.tracks.kick;
        if (track.mute) return;
        
        // Kick drum: sine wave with pitch envelope
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(30, time + 0.1);
        
        gain.gain.setValueAtTime(1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
        
        osc.connect(gain);
        gain.connect(track.filter);
        
        osc.start(time);
        osc.stop(time + 0.4);
        
        this.connectTrackToMaster('kick');
    }
    
    playSnare(time, probability = 1) {
        if (Math.random() > probability) return;
        
        const track = this.tracks.snare;
        if (track.mute) return;
        
        // Snare: noise + oscillator body
        // Noise part
        const noiseSource = this.context.createBufferSource();
        noiseSource.buffer = this.noiseBuffer;
        
        const noiseFilter = this.context.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000;
        
        const noiseGain = this.context.createGain();
        noiseGain.gain.setValueAtTime(0.8, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        
        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(track.filter);
        
        // Body (tone) part
        const osc = this.context.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = 180;
        
        const oscGain = this.context.createGain();
        oscGain.gain.setValueAtTime(0.7, time);
        oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        
        osc.connect(oscGain);
        oscGain.connect(track.filter);
        
        noiseSource.start(time);
        noiseSource.stop(time + 0.2);
        osc.start(time);
        osc.stop(time + 0.1);
        
        this.connectTrackToMaster('snare');
    }
    
    playHiHat(time, probability = 1, open = false) {
        if (Math.random() > probability) return;
        
        const trackId = open ? 'openhat' : 'hihat';
        const track = this.tracks[trackId];
        if (track.mute) return;
        
        // Hi-hat: filtered noise with envelope
        const noiseSource = this.context.createBufferSource();
        noiseSource.buffer = this.noiseBuffer;
        
        const filter = this.context.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 7000;
        
        const filter2 = this.context.createBiquadFilter();
        filter2.type = 'bandpass';
        filter2.frequency.value = 10000;
        filter2.Q.value = 1;
        
        const gain = this.context.createGain();
        const duration = open ? 0.3 : 0.08;
        
        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
        
        noiseSource.connect(filter);
        filter.connect(filter2);
        filter2.connect(gain);
        gain.connect(track.filter);
        
        noiseSource.start(time);
        noiseSource.stop(time + duration);
        
        this.connectTrackToMaster(trackId);
    }
    
    playClap(time, probability = 1) {
        if (Math.random() > probability) return;
        
        const track = this.tracks.clap;
        if (track.mute) return;
        
        // Clap: multiple short noise bursts
        const createBurst = (delay) => {
            const noiseSource = this.context.createBufferSource();
            noiseSource.buffer = this.noiseBuffer;
            
            const filter = this.context.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 2500;
            filter.Q.value = 2;
            
            const gain = this.context.createGain();
            gain.gain.setValueAtTime(0, time + delay);
            gain.gain.linearRampToValueAtTime(0.5, time + delay + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.01, time + delay + 0.08);
            
            noiseSource.connect(filter);
            filter.connect(gain);
            gain.connect(track.filter);
            
            noiseSource.start(time + delay);
            noiseSource.stop(time + delay + 0.1);
        };
        
        // Multiple bursts for clap effect
        [0, 0.01, 0.02, 0.015].forEach(d => createBurst(d));
        
        this.connectTrackToMaster('clap');
    }
    
    playPerc(time, probability = 1) {
        if (Math.random() > probability) return;
        
        const track = this.tracks.perc;
        if (track.mute) return;
        
        // Perc: FM synthesis
        const carrier = this.context.createOscillator();
        const modulator = this.context.createOscillator();
        const modGain = this.context.createGain();
        const gain = this.context.createGain();
        
        carrier.type = 'sine';
        carrier.frequency.value = 800;
        
        modulator.type = 'sine';
        modulator.frequency.value = 200;
        modGain.gain.value = 400;
        
        modulator.connect(modGain);
        modGain.connect(carrier.frequency);
        
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        
        carrier.connect(gain);
        gain.connect(track.filter);
        
        carrier.start(time);
        modulator.start(time);
        carrier.stop(time + 0.1);
        modulator.stop(time + 0.1);
        
        this.connectTrackToMaster('perc');
    }
    
    playBass(time, frequency = 55, probability = 1) {
        if (Math.random() > probability) return;
        
        const track = this.tracks.bass;
        if (track.mute) return;
        
        const osc1 = this.context.createOscillator();
        const osc2 = this.context.createOscillator();
        const filter = this.context.createBiquadFilter();
        const gain = this.context.createGain();
        
        osc1.type = 'sawtooth';
        osc1.frequency.value = frequency;
        
        osc2.type = 'sawtooth';
        osc2.frequency.value = frequency * 1.005; // Slight detune
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, time);
        filter.frequency.exponentialRampToValueAtTime(200, time + 0.2);
        filter.Q.value = 5;
        
        const settings = this.synthSettings;
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.6, time + settings.attack);
        gain.gain.linearRampToValueAtTime(0.6 * settings.sustain, time + settings.attack + settings.decay);
        gain.gain.exponentialRampToValueAtTime(0.01, time + settings.attack + settings.decay + settings.release);
        
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(track.filter);
        
        osc1.start(time);
        osc2.start(time);
        osc1.stop(time + settings.attack + settings.decay + settings.release + 0.1);
        osc2.stop(time + settings.attack + settings.decay + settings.release + 0.1);
        
        this.connectTrackToMaster('bass');
    }
    
    playSynth(time, frequency = 440, probability = 1) {
        if (Math.random() > probability) return;
        
        const track = this.tracks.synth;
        if (track.mute) return;
        
        const settings = this.synthSettings;
        
        const osc = this.context.createOscillator();
        const filter = this.context.createBiquadFilter();
        const gain = this.context.createGain();
        
        osc.type = settings.oscillator;
        osc.frequency.value = frequency;
        
        filter.type = settings.filterType;
        filter.frequency.value = settings.filterCutoff;
        filter.Q.value = settings.filterResonance;
        
        // ADSR envelope
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.5, time + settings.attack);
        gain.gain.linearRampToValueAtTime(0.5 * settings.sustain, time + settings.attack + settings.decay);
        gain.gain.exponentialRampToValueAtTime(0.01, time + settings.attack + settings.decay + settings.release);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(track.filter);
        
        osc.start(time);
        osc.stop(time + settings.attack + settings.decay + settings.release + 0.1);
        
        this.connectTrackToMaster('synth');
    }
    
    // Play note by track ID
    playNote(trackId, time, options = {}) {
        const { frequency, probability = 1, open = false } = options;
        
        switch(trackId) {
            case 'kick':
                this.playKick(time, probability);
                break;
            case 'snare':
                this.playSnare(time, probability);
                break;
            case 'hihat':
                this.playHiHat(time, probability, false);
                break;
            case 'openhat':
                this.playHiHat(time, probability, true);
                break;
            case 'bass':
                this.playBass(time, frequency || 55, probability);
                break;
            case 'synth':
                this.playSynth(time, frequency || 440, probability);
                break;
            case 'clap':
                this.playClap(time, probability);
                break;
            case 'perc':
                this.playPerc(time, probability);
                break;
        }
    }
    
    // Track controls
    setTrackVolume(trackId, value) {
        if (this.tracks[trackId]) {
            this.tracks[trackId].volume = value;
            if (!this.tracks[trackId].mute) {
                this.tracks[trackId].gain.gain.value = value;
            }
        }
    }
    
    setTrackPan(trackId, value) {
        if (this.tracks[trackId]) {
            this.tracks[trackId].panValue = value;
            this.tracks[trackId].pan.pan.value = value;
        }
    }
    
    setTrackMute(trackId, mute) {
        if (this.tracks[trackId]) {
            this.tracks[trackId].mute = mute;
            this.tracks[trackId].gain.gain.value = mute ? 0 : this.tracks[trackId].volume;
        }
    }
    
    setTrackSolo(trackId, solo) {
        if (this.tracks[trackId]) {
            this.tracks[trackId].solo = solo;
            this.updateSoloState();
        }
    }
    
    updateSoloState() {
        const anySolo = Object.values(this.tracks).some(t => t.solo);
        
        Object.keys(this.tracks).forEach(trackId => {
            const track = this.tracks[trackId];
            if (anySolo) {
                track.gain.gain.value = track.solo ? track.volume : 0;
            } else {
                track.gain.gain.value = track.mute ? 0 : track.volume;
            }
        });
    }
    
    // Master controls
    setMasterVolume(value) {
        if (this.masterGain) {
            this.masterGain.gain.value = value;
        }
    }
    
    // Effects controls
    setReverb(enabled, decay, mix) {
        this.effectsSettings.reverb = { enabled, decay, mix };
        if (this.effects.reverb) {
            this.effects.reverb.wetGain.gain.value = enabled ? mix : 0;
            if (decay > 0) {
                this.createReverbImpulse(decay);
            }
        }
    }
    
    setDelay(enabled, time, feedback, mix) {
        this.effectsSettings.delay = { enabled, time, feedback, mix };
        if (this.effects.delay) {
            this.effects.delay.delayNode.delayTime.value = time;
            this.effects.delay.feedback.gain.value = feedback;
            this.effects.delay.wetGain.gain.value = enabled ? mix : 0;
        }
    }
    
    setDistortion(enabled, drive, mix) {
        this.effectsSettings.distortion = { enabled, drive, mix };
        if (this.effects.distortion) {
            this.createDistortionCurve(drive);
            this.effects.distortion.wetGain.gain.value = enabled ? mix : 0;
        }
    }
    
    // Synth settings
    setSynthSettings(settings) {
        this.synthSettings = { ...this.synthSettings, ...settings };
    }
    
    // Get analyser data
    getAnalyserData() {
        if (!this.analyser) return { frequency: new Uint8Array(0), waveform: new Uint8Array(0) };
        
        const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
        const waveformData = new Uint8Array(this.analyser.frequencyBinCount);
        
        this.analyser.getByteFrequencyData(frequencyData);
        this.analyser.getByteTimeDomainData(waveformData);
        
        return { frequency: frequencyData, waveform: waveformData };
    }
    
    // WAV Export
    async exportWAV(duration, pattern, bpm) {
        const sampleRate = 44100;
        const offlineContext = new OfflineAudioContext(2, sampleRate * duration, sampleRate);
        
        // Render audio offline
        // This is a simplified version - full implementation would
        // render the entire pattern
        
        const renderedBuffer = await offlineContext.startRendering();
        return this.bufferToWav(renderedBuffer);
    }
    
    bufferToWav(buffer) {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const format = 1; // PCM
        const bitDepth = 16;
        
        const bytesPerSample = bitDepth / 8;
        const blockAlign = numChannels * bytesPerSample;
        
        const dataLength = buffer.length * blockAlign;
        const bufferLength = 44 + dataLength;
        
        const arrayBuffer = new ArrayBuffer(bufferLength);
        const view = new DataView(arrayBuffer);
        
        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, bufferLength - 8, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, format, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitDepth, true);
        writeString(36, 'data');
        view.setUint32(40, dataLength, true);
        
        // Audio data
        const channelData = [];
        for (let i = 0; i < numChannels; i++) {
            channelData.push(buffer.getChannelData(i));
        }
        
        let offset = 44;
        for (let i = 0; i < buffer.length; i++) {
            for (let channel = 0; channel < numChannels; channel++) {
                const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
                view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                offset += 2;
            }
        }
        
        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }
    
    getCurrentTime() {
        return this.context ? this.context.currentTime : 0;
    }
}

// Create global instance
window.audioEngine = new AudioEngine();
