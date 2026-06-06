import { REACTIONS } from './avatar-data.js';
import { AvatarRenderer } from './avatar-renderer.js';

const STATES = ['idle', 'happy', 'sad', 'jump', 'victory', 'streak', 'damage'];

/**
 * JS animation controller — drives CSS sprite states + speech + blink.
 */
export class AvatarController {
  constructor(container, effects) {
    this.renderer = new AvatarRenderer(container);
    this.effects = effects;
    this.state = 'idle';
    this.blinkTimer = null;
    this.breathTimer = null;
    this.streak = 0;
    this.enabled = true;
  }

  init(config, skinId) {
    this.renderer.mount(config, skinId);
    this.setState('idle');
    this._startBlink();
  }

  update(config, skinId) {
    this.renderer.update(config, skinId);
    this.setState(this.state);
  }

  destroy() {
    clearInterval(this.blinkTimer);
    clearInterval(this.breathTimer);
  }

  setState(state) {
    if (!STATES.includes(state) && state !== 'jump') state = 'idle';
    this.state = state;
    const root = this.renderer.getRoot();
    if (!root) return;

    root.className = root.className.replace(/avatar--\w+/g, '').trim();
    root.classList.add('avatar', `avatar--${state}`);
    const skin = this.renderer.getEffectiveConfig().skin;
    if (skin?.animClass) root.classList.add(skin.animClass);
    root.dataset.aura = skin?.aura || 'none';

    const exprMap = {
      idle: 'normal', happy: 'happy', sad: 'sad', jump: 'happy',
      victory: 'happy', streak: 'open', damage: 'sad',
    };
    this.renderer.setExpression(exprMap[state] || 'normal');

    if (state === 'idle') this._startBlink();
    else clearInterval(this.blinkTimer);
  }

  _startBlink() {
    clearInterval(this.blinkTimer);
    if (!this.enabled) return;
    this.blinkTimer = setInterval(() => {
      const root = this.renderer.getRoot();
      if (!root || this.state !== 'idle') return;
      root.classList.add('avatar--blink');
      setTimeout(() => root.classList.remove('avatar--blink'), 150);
    }, 2800 + Math.random() * 2000);
  }

  say(text, duration = 2200) {
    const el = this.renderer.getSpeechEl();
    if (!el) return;
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(this._speechTimer);
    this._speechTimer = setTimeout(() => el.classList.remove('show'), duration);
  }

  randomSay(pool) {
    const msg = pool[Math.floor(Math.random() * pool.length)];
    this.say(msg);
    return msg;
  }

  onCorrect(streak = 1) {
    this.streak = streak;
    if (streak >= 3) {
      this.setState('streak');
      this.randomSay(REACTIONS.streak);
      this.effects?.spawn(this.renderer.getFxContainer(), 'sparkle', 16);
    } else {
      this.setState('jump');
      this.randomSay(REACTIONS.correct);
      this.effects?.spawn(this.renderer.getFxContainer(), 'sparkle', 10);
    }
    setTimeout(() => this.setState('idle'), 1200);
  }

  onWrong() {
    this.streak = 0;
    this.setState('sad');
    this.randomSay(REACTIONS.wrong);
    this.effects?.spawn(this.renderer.getFxContainer(), 'damage');
    setTimeout(() => this.setState('idle'), 1400);
  }

  onVictory() {
    this.setState('victory');
    this.randomSay(REACTIONS.victory);
    this.effects?.spawn(this.renderer.getFxContainer(), 'victory', 30);
  }

  resetStreak() {
    this.streak = 0;
  }

  setEnabled(v) {
    this.enabled = v;
    if (!v) clearInterval(this.blinkTimer);
    else if (this.state === 'idle') this._startBlink();
  }
}
