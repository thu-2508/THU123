// Web Audio API Synthesizer - 100% offline, zero external dependencies

class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private bgmOscillators: OscillatorNode[] = [];
  private bgmGain: GainNode | null = null;
  public bgmPlaying: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (!val && this.bgmPlaying) {
      this.stopBgm();
    }
  }

  // Play cheerful victory chord
  public playCorrect() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.001, this.ctx!.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.2, this.ctx!.currentTime + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + idx * 0.08);
        osc.stop(this.ctx!.currentTime + idx * 0.08 + 0.4);
      });
    } catch {
      // ignore
    }
  }

  // Play gentle, supportive non-stressful sound for incorrect answer
  public playIncorrect() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(329.63, this.ctx.currentTime); // E4
      osc.frequency.exponentialRampToValueAtTime(261.63, this.ctx.currentTime + 0.25); // C4

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.32);
    } catch {
      // ignore
    }
  }

  // Play fanfare when completing stage or finishing game
  public playFanfare() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const fanfare = [
        { freq: 440, delay: 0, dur: 0.15 },
        { freq: 554.37, delay: 0.12, dur: 0.15 },
        { freq: 659.25, delay: 0.24, dur: 0.15 },
        { freq: 880, delay: 0.36, dur: 0.5 },
      ];

      fanfare.forEach((n) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.freq, this.ctx!.currentTime + n.delay);

        gain.gain.setValueAtTime(0.01, this.ctx!.currentTime + n.delay);
        gain.gain.linearRampToValueAtTime(0.22, this.ctx!.currentTime + n.delay + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + n.delay + n.dur);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + n.delay);
        osc.stop(this.ctx!.currentTime + n.delay + n.dur + 0.05);
      });
    } catch {
      // ignore
    }
  }

  // Gentle reminder click when time is low
  public playTick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch {
      // ignore
    }
  }

  public playClick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // ignore
    }
  }

  // Gentle synthesized background melody (ambient, loopable)
  public toggleBgm(): boolean {
    if (this.bgmPlaying) {
      this.stopBgm();
      return false;
    } else {
      this.startBgm();
      return true;
    }
  }

  public startBgm() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      this.stopBgm();

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      this.bgmGain.connect(this.ctx.destination);

      // Warm soothing chord: D-major add9 (D4, F#4, A4, E5)
      const freqs = [293.66, 369.99, 440.00, 659.25];
      freqs.forEach((f) => {
        const osc = this.ctx!.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, this.ctx!.currentTime);
        osc.connect(this.bgmGain!);
        osc.start();
        this.bgmOscillators.push(osc);
      });

      this.bgmPlaying = true;
    } catch {
      // ignore
    }
  }

  public stopBgm() {
    try {
      this.bgmOscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
      });
      this.bgmOscillators = [];
      if (this.bgmGain) {
        this.bgmGain.disconnect();
        this.bgmGain = null;
      }
      this.bgmPlaying = false;
    } catch {
      // ignore
    }
  }
}

export const sound = new SoundManager();
