// Sound effects for the game
// Using Web Audio API to generate sounds without external files

class SoundManager {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.volume = 0.3;
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  playTone(frequency, duration, type = 'sine', delay = 0) {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(this.volume * 0.5, this.audioContext.currentTime + delay);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + delay + duration);

    oscillator.start(this.audioContext.currentTime + delay);
    oscillator.stop(this.audioContext.currentTime + delay + duration);
  }

  // Feed sound - happy ascending notes
  playFeed() {
    this.init();
    this.playTone(523.25, 0.1, 'sine', 0);    // C5
    this.playTone(659.25, 0.1, 'sine', 0.1);  // E5
    this.playTone(783.99, 0.15, 'sine', 0.2); // G5
  }

  // Play sound - cheerful melody
  playPlay() {
    this.init();
    this.playTone(523.25, 0.08, 'sine', 0);    // C5
    this.playTone(587.33, 0.08, 'sine', 0.08); // D5
    this.playTone(659.25, 0.08, 'sine', 0.16); // E5
    this.playTone(783.99, 0.12, 'sine', 0.24); // G5
  }

  // Clean sound - gentle swoosh
  playClean() {
    this.init();
    this.playTone(400, 0.05, 'triangle', 0);
    this.playTone(600, 0.05, 'triangle', 0.05);
    this.playTone(800, 0.1, 'triangle', 0.1);
  }

  // Sleep sound - soft descending notes
  playSleep() {
    this.init();
    this.playTone(523.25, 0.2, 'sine', 0);    // C5
    this.playTone(392.00, 0.2, 'sine', 0.2);  // G4
    this.playTone(261.63, 0.3, 'sine', 0.4);  // C4
  }

  // Wake up sound - bright ascending
  playWake() {
    this.init();
    this.playTone(261.63, 0.1, 'sine', 0);    // C4
    this.playTone(329.63, 0.1, 'sine', 0.1);  // E4
    this.playTone(523.25, 0.15, 'sine', 0.2); // C5
  }

  // Medicine sound - quick beep
  playMedicine() {
    this.init();
    this.playTone(880, 0.05, 'square', 0);
    this.playTone(880, 0.05, 'square', 0.1);
  }

  // Coin sound - high ping
  playCoin() {
    this.init();
    this.playTone(987.77, 0.1, 'sine', 0);    // B5
    this.playTone(1318.51, 0.15, 'sine', 0.1); // E6
  }

  // Achievement sound - fanfare
  playAchievement() {
    this.init();
    this.playTone(523.25, 0.1, 'sine', 0);    // C5
    this.playTone(659.25, 0.1, 'sine', 0.1);  // E5
    this.playTone(783.99, 0.1, 'sine', 0.2);  // G5
    this.playTone(1046.50, 0.2, 'sine', 0.3); // C6
  }

  // Death sound - sad descending
  playDeath() {
    this.init();
    this.playTone(523.25, 0.3, 'sine', 0);    // C5
    this.playTone(392.00, 0.3, 'sine', 0.3);  // G4
    this.playTone(261.63, 0.5, 'sine', 0.6);  // C4
  }

  // Game win sound
  playGameWin() {
    this.init();
    this.playTone(523.25, 0.1, 'sine', 0);
    this.playTone(659.25, 0.1, 'sine', 0.1);
    this.playTone(783.99, 0.1, 'sine', 0.2);
    this.playTone(1046.50, 0.2, 'sine', 0.3);
  }

  // Game lose sound
  playGameLose() {
    this.init();
    this.playTone(392.00, 0.2, 'sine', 0);    // G4
    this.playTone(349.23, 0.2, 'sine', 0.2);  // F4
    this.playTone(261.63, 0.3, 'sine', 0.4);  // C4
  }

  // Click sound - short blip
  playClick() {
    this.init();
    this.playTone(800, 0.03, 'square', 0);
  }

  // Error sound - low buzz
  playError() {
    this.init();
    this.playTone(200, 0.15, 'sawtooth', 0);
  }

  // Hatch sound - magical chime
  playHatch() {
    this.init();
    this.playTone(783.99, 0.1, 'sine', 0);    // G5
    this.playTone(987.77, 0.1, 'sine', 0.1);  // B5
    this.playTone(1174.66, 0.15, 'sine', 0.2); // D6
    this.playTone(1318.51, 0.2, 'sine', 0.35); // E6
  }

  // Buy sound - pleasant ding
  playBuy() {
    this.init();
    this.playTone(880, 0.08, 'sine', 0);
    this.playTone(1108.73, 0.12, 'sine', 0.08);
  }

  // Level up sound
  playLevelUp() {
    this.init();
    this.playTone(523.25, 0.08, 'sine', 0);
    this.playTone(659.25, 0.08, 'sine', 0.08);
    this.playTone(783.99, 0.08, 'sine', 0.16);
    this.playTone(1046.50, 0.08, 'sine', 0.24);
    this.playTone(1318.51, 0.2, 'sine', 0.32);
  }
}

// Create singleton instance
const soundManager = new SoundManager();

export default soundManager;