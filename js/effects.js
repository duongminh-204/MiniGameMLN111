/** Visual effects — sparkles, confetti, damage, fire aura */

export class EffectsManager {
  constructor(settings) {
    this.settings = settings;
  }

  get enabled() {
    return this.settings?.get?.('animations') ?? true;
  }

  spawn(container, type, count = 12) {
    if (!container || !this.enabled) return;
    container.innerHTML = '';

    const makers = {
      sparkle: () => this._sparkle(container, count),
      confetti: () => this._confetti(container, count),
      damage: () => this._damage(container),
      victory: () => { this._confetti(container, 40); this._sparkle(container, 20); },
    };
    makers[type]?.();
  }

  _sparkle(el, n) {
    const icons = ['✨', '⭐', '💫', '🌟'];
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      s.className = 'fx-sparkle';
      s.textContent = icons[i % icons.length];
      s.style.left = `${10 + Math.random() * 80}%`;
      s.style.top = `${10 + Math.random() * 70}%`;
      s.style.animationDelay = `${Math.random() * 0.5}s`;
      el.appendChild(s);
    }
    setTimeout(() => { el.innerHTML = ''; }, 1500);
  }

  _confetti(el, n) {
    const colors = ['#e21b3c', '#1368ce', '#d89e00', '#26890c', '#6c5ce7', '#fd79a8'];
    for (let i = 0; i < n; i++) {
      const c = document.createElement('div');
      c.className = 'fx-confetti';
      c.style.left = `${Math.random() * 100}%`;
      c.style.background = colors[i % colors.length];
      c.style.animationDelay = `${Math.random() * 0.6}s`;
      c.style.width = `${6 + Math.random() * 8}px`;
      c.style.height = `${6 + Math.random() * 8}px`;
      el.appendChild(c);
    }
    setTimeout(() => { el.innerHTML = ''; }, 2500);
  }

  _damage(el) {
    const d = document.createElement('div');
    d.className = 'fx-damage';
    d.textContent = '💥';
    el.appendChild(d);
    setTimeout(() => { el.innerHTML = ''; }, 800);
  }
}
