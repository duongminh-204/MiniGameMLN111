import { SKINS } from './avatar-data.js';

/**
 * Layered SVG sprite avatar — reusable component.
 * Renders body parts as sprite layers with CSS-driven animation states.
 */
export class AvatarRenderer {
  constructor(container) {
    this.container = container;
    this.config = null;
    this.skinId = 'default';
    this.root = null;
  }

  mount(config, skinId = 'default') {
    this.config = { ...config };
    this.skinId = skinId;
    if (!this.container) return;
    this.container.innerHTML = this._buildHTML();
    this.root = this.container.querySelector('.avatar');
  }

  update(config, skinId) {
    if (config) this.config = { ...this.config, ...config };
    if (skinId) this.skinId = skinId;
    this.mount(this.config, this.skinId);
  }

  getEffectiveConfig() {
    const skin = SKINS[this.skinId] || SKINS.default;
    const base = { ...this.config };
    if (skin.outfitOverride) Object.assign(base, skin.outfitOverride);
    return { ...base, skin };
  }

  _buildHTML() {
    const c = this.getEffectiveConfig();
    const skin = c.skin;
    const gw = c.gender === 'female' ? 0.92 : c.gender === 'male' ? 1.08 : 1;
    const hair = this._hairPath(c.hairStyle);
    const eyes = this._eyes(c.eyeStyle);
    const mouth = 'mouth-normal';
    const outfit = this._outfit(c.outfit, c.outfitColor);
    const acc = this._accessory(c.accessory);

    return `
      <div class="avatar avatar--idle ${skin.animClass}" data-skin="${skin.id}" data-aura="${skin.aura}">
        <div class="avatar__platform"></div>
        <div class="avatar__aura avatar__aura--${skin.aura}"></div>
        <div class="avatar__speech" aria-live="polite"></div>
        <div class="avatar__fx"></div>
        <svg class="avatar__sprite" viewBox="0 0 100 140" style="--skin:${c.skinColor};--hair:${c.hairColor};--outfit:${c.outfitColor};--scale:${gw}">
          <g class="avatar__body-group">
            ${outfit.legs}
            ${outfit.body}
            ${outfit.arms}
          </g>
          <g class="avatar__head-group">
            <ellipse class="avatar__neck" cx="50" cy="72" rx="8" ry="6" fill="var(--skin)"/>
            <ellipse class="avatar__head" cx="50" cy="48" rx="22" ry="24" fill="var(--skin)"/>
            ${hair}
            <g class="avatar__eyes">${eyes}</g>
            <g class="avatar__mouth avatar__mouth--normal">${this._mouth('normal')}</g>
            ${acc}
          </g>
        </svg>
      </div>`;
  }

  _hairPath(style) {
    const h = 'var(--hair)';
    const paths = {
      short: `<path class="avatar__hair" d="M28 42 Q50 18 72 42 Q74 55 70 50 Q50 28 30 50 Q26 55 28 42" fill="${h}"/>`,
      long: `<path class="avatar__hair" d="M26 48 Q50 12 74 48 L76 95 Q50 105 24 95 Z" fill="${h}"/>
             <path d="M24 70 Q50 85 76 70" fill="none" stroke="${h}" stroke-width="8"/>`,
      spiky: `<path class="avatar__hair" d="M30 48 L38 22 L50 38 L62 18 L70 48 Q50 30 30 48" fill="${h}"/>`,
      ponytail: `<path class="avatar__hair" d="M28 44 Q50 20 72 44 Q70 58 68 52 Q50 32 32 52 Q28 58 28 44" fill="${h}"/>
                 <ellipse cx="78" cy="55" rx="10" ry="18" fill="${h}"/>`,
      curly: `<path class="avatar__hair" d="M26 50 Q35 25 50 35 Q65 25 74 50 Q78 40 72 55 Q50 65 28 55 Q22 40 26 50" fill="${h}"/>`,
    };
    return paths[style] || paths.short;
  }

  _eyes(style) {
    const styles = {
      normal: `<ellipse class="avatar__eye-l" cx="40" cy="48" rx="5" ry="6" fill="#fff"/><ellipse cx="40" cy="49" rx="2.5" ry="3" fill="#2d3436"/>
               <ellipse class="avatar__eye-r" cx="60" cy="48" rx="5" ry="6" fill="#fff"/><ellipse cx="60" cy="49" rx="2.5" ry="3" fill="#2d3436"/>`,
      wide: `<ellipse class="avatar__eye-l" cx="40" cy="48" rx="7" ry="8" fill="#fff"/><ellipse cx="40" cy="49" rx="3.5" ry="4" fill="#2d3436"/>
             <ellipse class="avatar__eye-r" cx="60" cy="48" rx="7" ry="8" fill="#fff"/><ellipse cx="60" cy="49" rx="3.5" ry="4" fill="#2d3436"/>`,
      determined: `<rect class="avatar__eye-l" x="34" y="44" width="12" height="8" rx="2" fill="#fff"/><rect x="37" y="46" width="6" height="4" fill="#2d3436"/>
                   <rect class="avatar__eye-r" x="54" y="44" width="12" height="8" rx="2" fill="#fff"/><rect x="57" y="46" width="6" height="4" fill="#2d3436"/>`,
      gentle: `<path class="avatar__eye-l" d="M34 50 Q40 44 46 50" fill="none" stroke="#2d3436" stroke-width="2.5" stroke-linecap="round"/>
               <path class="avatar__eye-r" d="M54 50 Q60 44 66 50" fill="none" stroke="#2d3436" stroke-width="2.5" stroke-linecap="round"/>`,
    };
    return styles[style] || styles.normal;
  }

  _mouth(expr) {
    const m = {
      normal: '<path d="M42 58 Q50 64 58 58" fill="none" stroke="#c0392b" stroke-width="2" stroke-linecap="round"/>',
      happy: '<path d="M40 56 Q50 68 60 56" fill="none" stroke="#c0392b" stroke-width="2.5" stroke-linecap="round"/>',
      sad: '<path d="M42 62 Q50 56 58 62" fill="none" stroke="#c0392b" stroke-width="2" stroke-linecap="round"/>',
      open: '<ellipse cx="50" cy="60" rx="6" ry="4" fill="#c0392b"/>',
    };
    return m[expr] || m.normal;
  }

  _outfit(type, color) {
    const c = color;
    const bodies = {
      casual: `<rect x="32" y="74" width="36" height="38" rx="8" fill="${c}"/>
               <rect x="36" y="78" width="28" height="6" rx="2" fill="rgba(255,255,255,.25)"/>`,
      formal: `<rect x="30" y="74" width="40" height="40" rx="4" fill="${c}"/>
               <polygon points="50,74 42,88 58,88" fill="rgba(255,255,255,.3)"/>
               <rect x="46" y="88" width="8" height="22" fill="#fff" opacity=".8"/>`,
      hoodie: `<rect x="30" y="76" width="40" height="36" rx="10" fill="${c}"/>
               <ellipse cx="50" cy="82" rx="14" ry="10" fill="rgba(0,0,0,.15)"/>`,
      uniform: `<rect x="32" y="74" width="36" height="40" rx="4" fill="${c}"/>
                <rect x="38" y="78" width="24" height="4" fill="#fdcb6e"/>
                <circle cx="50" cy="90" r="4" fill="#fdcb6e"/>`,
    };
    return {
      body: bodies[type] || bodies.casual,
      legs: `<rect x="36" y="110" width="12" height="24" rx="4" fill="#2d3436"/>
             <rect x="52" y="110" width="12" height="24" rx="4" fill="#2d3436"/>`,
      arms: `<rect class="avatar__arm-l" x="22" y="78" width="10" height="28" rx="5" fill="${c}"/>
             <rect class="avatar__arm-r" x="68" y="78" width="10" height="28" rx="5" fill="${c}"/>
             <ellipse cx="27" cy="108" rx="6" ry="5" fill="var(--skin)"/>
             <ellipse cx="73" cy="108" rx="6" ry="5" fill="var(--skin)"/>`,
    };
  }

  _accessory(id) {
    const a = {
      none: '',
      glasses: `<rect x="33" y="45" width="14" height="10" rx="2" fill="none" stroke="#2d3436" stroke-width="1.5"/>
                <rect x="53" y="45" width="14" height="10" rx="2" fill="none" stroke="#2d3436" stroke-width="1.5"/>
                <line x1="47" y1="50" x2="53" y2="50" stroke="#2d3436" stroke-width="1.5"/>`,
      cap: `<ellipse cx="50" cy="32" rx="24" ry="8" fill="#e17055"/>
            <rect x="30" y="28" width="40" height="12" rx="4" fill="#e17055"/>`,
      scarf: `<path d="M34 68 Q50 80 66 68 L64 88 Q50 95 36 88 Z" fill="#e84393" opacity=".9"/>`,
      badge: `<circle cx="62" cy="82" r="8" fill="#fdcb6e" stroke="#f39c12" stroke-width="2"/>
              <text x="62" y="86" text-anchor="middle" font-size="10" fill="#d35400">★</text>`,
    };
    return a[id] || '';
  }

  setExpression(expr) {
    const mouth = this.root?.querySelector('.avatar__mouth');
    if (!mouth) return;
    mouth.innerHTML = this._mouth(expr);
    // SVG <g> elements: className is read-only — use setAttribute or classList
    mouth.setAttribute('class', `avatar__mouth avatar__mouth--${expr}`);
  }

  getFxContainer() {
    return this.root?.querySelector('.avatar__fx');
  }

  getSpeechEl() {
    return this.root?.querySelector('.avatar__speech');
  }

  getRoot() {
    return this.root;
  }
}
