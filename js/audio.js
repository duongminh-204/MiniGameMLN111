/**
 * AudioManager — Web Audio API with placeholder hooks for sound files.
 * Replace playTone calls with audio.load('correct') when assets are ready.
 */
export class AudioManager {
  constructor(settings) {
    this.settings = settings;
    this.ctx = null;
    this.bgmTimer = null;
    this.bgmOn = false;
    this.files = {
      click: null,
      correct: null,
      wrong: null,
      tick: null,
    };
  }

  getCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.ctx;
  }

  getVol(mult = 1) {
    return (this.settings.volume / 100) * mult;
  }

  /** Placeholder: load sound files from assets/sounds/ */
  async loadSound(name, url) {
    try {
      const res = await fetch(url);
      const buf = await res.arrayBuffer();
      this.files[name] = await this.getCtx().decodeAudioData(buf);
    } catch {
      this.files[name] = null;
    }
  }

  playFile(name, vol = 0.5) {
    if (!this.settings.sfx || !this.files[name]) return false;
    const src = this.getCtx().createBufferSource();
    const gain = this.getCtx().createGain();
    src.buffer = this.files[name];
    gain.gain.value = this.getVol(vol);
    src.connect(gain);
    gain.connect(this.getCtx().destination);
    src.start();
    return true;
  }

  tone(freq, dur, type = 'sine', vol = 0.25, when = 0) {
    try {
      const a = this.getCtx();
      const t = a.currentTime + when;
      const o = a.createOscillator();
      const g = a.createGain();
      o.connect(g);
      g.connect(a.destination);
      o.type = type;
      o.frequency.value = freq;
      const v = vol * this.getVol();
      g.gain.setValueAtTime(v, a.currentTime + when);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.start(t);
      o.stop(t + dur);
    } catch { /* noop */ }
  }

  click() {
    if (!this.settings.sfx) return;
    if (!this.playFile('click', 0.4)) {
      this.tone(600, 0.06, 'sine', 0.2);
      this.tone(900, 0.04, 'triangle', 0.12, 0.03);
    }
  }

  correct() {
    if (!this.settings.sfx) return;
    if (!this.playFile('correct', 0.5)) {
      [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.12, 'sine', 0.22, i * 0.07));
    }
  }

  wrong() {
    if (!this.settings.sfx) return;
    if (!this.playFile('wrong', 0.45)) {
      this.tone(300, 0.15, 'sawtooth', 0.2);
      this.tone(200, 0.2, 'sawtooth', 0.18, 0.1);
    }
  }

  fanfare() {
    if (!this.settings.sfx) return;
    [523, 659, 784, 1047, 1318].forEach((f, i) => this.tone(f, 0.2, 'sine', 0.25, i * 0.1));
  }

  startBGM() {
    if (this.bgmOn || !this.settings.music) return;
    try {
      this.getCtx().resume();
      this.bgmOn = true;
      const melody = [262, 294, 330, 349, 392, 349, 330, 294];
      let step = 0;
      const play = () => {
        if (!this.bgmOn || !this.settings.music) return;
        const f = melody[step % melody.length];
        this.tone(f, 0.18, 'sine', 0.06);
        step++;
        this.bgmTimer = setTimeout(play, 450);
      };
      play();
    } catch { /* noop */ }
  }

  stopBGM() {
    this.bgmOn = false;
    if (this.bgmTimer) clearTimeout(this.bgmTimer);
    this.bgmTimer = null;
  }

  toggleBGM() {
    this.settings.music = !this.bgmOn;
    if (this.bgmOn) this.stopBGM();
    else this.startBGM();
    return this.settings.music;
  }
}
