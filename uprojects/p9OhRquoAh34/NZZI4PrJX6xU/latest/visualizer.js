/**
 * BeatForge - Audio Visualizer
 * Real-time canvas visualizations with multiple modes
 */

class Visualizer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.audioEngine = null;
        this.mode = 'waveform';
        this.animationId = null;
        this.isRunning = false;
        
        // Visualization settings
        this.settings = {
            barCount: 64,
            smoothing: 0.8,
            sensitivity: 1.2,
            colors: {
                primary: '#00d4ff',
                secondary: '#8338ec',
                accent: '#ff006e',
                bg: '#0a0a0f'
            }
        };
        
        // Particle system
        this.particles = [];
        this.maxParticles = 150;
        
        // Circular visualization
        this.rotation = 0;
        this.pulseRadius = 0;
        
        // FPS tracking
        this.lastTime = 0;
        this.frameCount = 0;
        this.fps = 60;
    }
    
    init(canvasElement, audioEngine) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.audioEngine = audioEngine;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Initialize particles
        this.initParticles();
    }
    
    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }
    
    initParticles() {
        this.particles = [];
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push(this.createParticle());
        }
    }
    
    createParticle() {
        return {
            x: Math.random() * (this.canvas?.width || 800),
            y: Math.random() * (this.canvas?.height || 300),
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            radius: Math.random() * 3 + 1,
            hue: Math.random() * 60 + 180, // Cyan to purple range
            alpha: Math.random() * 0.5 + 0.3,
            life: 1
        };
    }
    
    setMode(mode) {
        this.mode = mode;
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.animate();
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    animate() {
        if (!this.isRunning) return;
        
        // Calculate FPS
        const now = performance.now();
        this.frameCount++;
        if (now - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = now;
        }
        
        // Get audio data
        const audioData = this.audioEngine.getAnalyserData();
        
        // Clear canvas with fade effect
        this.ctx.fillStyle = 'rgba(10, 10, 15, 0.15)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw based on mode
        switch (this.mode) {
            case 'waveform':
                this.drawWaveform(audioData.waveform);
                break;
            case 'spectrum':
                this.drawSpectrum(audioData.frequency);
                break;
            case 'circular':
                this.drawCircular(audioData.frequency);
                break;
            case 'particles':
                this.drawParticles(audioData.frequency);
                break;
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    drawWaveform(waveformData) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const sliceWidth = width / waveformData.length;
        
        // Draw waveform
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.settings.colors.primary;
        this.ctx.lineWidth = 2;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = this.settings.colors.primary;
        
        let x = 0;
        for (let i = 0; i < waveformData.length; i++) {
            const v = waveformData[i] / 128.0;
            const y = (v * height) / 2;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
            x += sliceWidth;
        }
        
        this.ctx.stroke();
        
        // Draw mirror waveform
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.settings.colors.secondary;
        this.ctx.shadowColor = this.settings.colors.secondary;
        
        x = 0;
        for (let i = 0; i < waveformData.length; i++) {
            const v = waveformData[i] / 128.0;
            const y = height - (v * height) / 2;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
            x += sliceWidth;
        }
        
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }
    
    drawSpectrum(frequencyData) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const barCount = this.settings.barCount;
        const barWidth = width / barCount - 1;
        const step = Math.floor(frequencyData.length / barCount);
        
        for (let i = 0; i < barCount; i++) {
            const value = frequencyData[i * step] * this.settings.sensitivity;
            const barHeight = (value / 255) * height * 0.9;
            const x = i * (barWidth + 1);
            
            // Color gradient based on frequency
            const hue = (i / barCount) * 60 + 180; // Cyan to purple
            this.ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.8)`;
            
            // Draw bar with glow
            this.ctx.shadowBlur = 5;
            this.ctx.shadowColor = `hsla(${hue}, 80%, 60%, 0.5)`;
            
            // Rounded bars
            const radius = barWidth / 2;
            this.ctx.beginPath();
            this.ctx.roundRect(x, height - barHeight, barWidth, barHeight, [radius, radius, 0, 0]);
            this.ctx.fill();
        }
        
        this.ctx.shadowBlur = 0;
    }
    
    drawCircular(frequencyData) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const maxRadius = Math.min(width, height) * 0.4;
        const minRadius = maxRadius * 0.3;
        const barCount = 64;
        const step = Math.floor(frequencyData.length / barCount);
        
        // Calculate average bass for pulse effect
        let bassAvg = 0;
        for (let i = 0; i < 8; i++) {
            bassAvg += frequencyData[i];
        }
        bassAvg /= 8;
        
        // Pulse effect
        this.pulseRadius = minRadius + (bassAvg / 255) * 30;
        
        // Draw central glow
        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, this.pulseRadius
        );
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0.3)');
        gradient.addColorStop(0.5, 'rgba(131, 56, 236, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, this.pulseRadius * 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Rotate slowly
        this.rotation += 0.002;
        
        // Draw frequency bars in circle
        for (let i = 0; i < barCount; i++) {
            const value = frequencyData[i * step] * this.settings.sensitivity;
            const barLength = ((value / 255) * (maxRadius - minRadius));
            const angle = (i / barCount) * Math.PI * 2 + this.rotation;
            
            const x1 = centerX + Math.cos(angle) * minRadius;
            const y1 = centerY + Math.sin(angle) * minRadius;
            const x2 = centerX + Math.cos(angle) * (minRadius + barLength);
            const y2 = centerY + Math.sin(angle) * (minRadius + barLength);
            
            const hue = (i / barCount) * 60 + 180;
            this.ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.8)`;
            this.ctx.lineWidth = 3;
            this.ctx.lineCap = 'round';
            this.ctx.shadowBlur = 3;
            this.ctx.shadowColor = `hsla(${hue}, 80%, 60%, 0.5)`;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }
        
        // Inner circle
        this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, minRadius - 5, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.shadowBlur = 0;
    }
    
    drawParticles(frequencyData) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Calculate frequency bands
        let bass = 0, mid = 0, high = 0;
        const bassEnd = Math.floor(frequencyData.length * 0.1);
        const midEnd = Math.floor(frequencyData.length * 0.5);
        
        for (let i = 0; i < bassEnd; i++) bass += frequencyData[i];
        for (let i = bassEnd; i < midEnd; i++) mid += frequencyData[i];
        for (let i = midEnd; i < frequencyData.length; i++) high += frequencyData[i];
        
        bass /= bassEnd;
        mid /= (midEnd - bassEnd);
        high /= (frequencyData.length - midEnd);
        
        // Update and draw particles
        this.particles.forEach((p, index) => {
            // Audio-reactive velocity
            const bassInfluence = bass / 255;
            const midInfluence = mid / 255;
            const highInfluence = high / 255;
            
            // Add some chaos based on audio
            p.vx += (Math.random() - 0.5) * highInfluence * 0.5;
            p.vy += (Math.random() - 0.5) * highInfluence * 0.5;
            
            // Bass pushes particles outward from center
            const dx = p.x - this.centerX;
            const dy = p.y - this.centerY;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            p.vx += (dx / dist) * bassInfluence * 0.5;
            p.vy += (dy / dist) * bassInfluence * 0.5;
            
            // Apply velocity with damping
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.98;
            p.vy *= 0.98;
            
            // Mid frequencies affect color
            p.hue = 180 + midInfluence * 60;
            
            // High frequencies affect size
            p.radius = 1 + highInfluence * 4;
            
            // Wrap around screen
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;
            
            // Draw particle with glow
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.alpha})`;
            this.ctx.shadowBlur = 5;
            this.ctx.shadowColor = `hsla(${p.hue}, 80%, 60%, 0.5)`;
            this.ctx.fill();
        });
        
        // Draw connections between close particles
        this.ctx.shadowBlur = 0;
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 50) {
                    const alpha = (1 - dist / 50) * 0.3;
                    this.ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }
}

// Create global instance
window.visualizer = new Visualizer();
