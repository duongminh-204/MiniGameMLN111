import { AVATAR_OPTIONS, AVATAR_DEFAULT } from './avatar-data.js';
import { AvatarController } from './avatar-controller.js';

const $ = (id) => document.getElementById(id);

/**
 * Avatar Creator & Profile UI — real-time preview.
 */
export class AvatarUIManager {
  constructor(storage, effects, settings) {
    this.storage = storage;
    this.effects = effects;
    this.settings = settings;
    this.draft = { ...AVATAR_DEFAULT };
    this.previewCtrl = null;
    this.profileCtrl = null;
    this.onSave = null;
  }

  init() {
    this.previewCtrl = new AvatarController($('avatar-preview'), this.effects);
    this.profileCtrl = new AvatarController($('profile-avatar-preview'), this.effects);
    this.previewCtrl.setEnabled(this.settings.get('animations'));
    this.profileCtrl.setEnabled(this.settings.get('animations'));
  }

  loadDraft() {
    this.draft = this.storage.hasAvatar()
      ? this.storage.getAvatar()
      : { ...AVATAR_DEFAULT };
  }

  openCreator() {
    this.loadDraft();
    this.previewCtrl.init(this.draft, this.draft.skinId);
    this.renderCreatorOptions();
    this.showScreen('screen-creator');
  }

  openProfile() {
    const av = this.storage.getAvatar();
    this.profileCtrl.init(av, av.skinId);
    this.renderSkinGrid();
    this.showScreen('screen-profile');
  }

  showScreen(id) {
    ['screen-start', 'screen-creator', 'screen-profile', 'screen-quiz', 'screen-stage', 'screen-end']
      .forEach((s) => $(s)?.classList.toggle('active', s === id));
  }

  renderCreatorOptions() {
    const wrap = $('creator-options');
    if (!wrap) return;

    const groups = [
      { key: 'gender', type: 'btn', options: AVATAR_OPTIONS.gender },
      { key: 'hairStyle', type: 'btn', options: AVATAR_OPTIONS.hairStyle },
      { key: 'hairColor', type: 'swatch', options: AVATAR_OPTIONS.hairColor },
      { key: 'eyeStyle', type: 'btn', options: AVATAR_OPTIONS.eyeStyle },
      { key: 'skinColor', type: 'swatch', options: AVATAR_OPTIONS.skinColor },
      { key: 'outfit', type: 'btn', options: AVATAR_OPTIONS.outfit },
      { key: 'outfitColor', type: 'swatch', options: AVATAR_OPTIONS.outfitColor },
      { key: 'accessory', type: 'btn', options: AVATAR_OPTIONS.accessory },
    ];

    wrap.innerHTML = groups.map((g) => `
      <div class="option-group" data-key="${g.key}">
        <label>${this._label(g.key)}</label>
        <div class="option-row">${this._renderOpts(g)}</div>
      </div>`).join('');

    wrap.querySelectorAll('[data-pick]').forEach((el) => {
      el.addEventListener('click', () => {
        const key = el.closest('.option-group')?.dataset.key;
        const val = el.dataset.pick;
        this.draft[key] = val;
        this._syncActive(wrap, key, val, el.classList.contains('opt-swatch'));
        this.previewCtrl.update(this.draft, this.draft.skinId);
      });
    });
  }

  _label(key) {
    const map = {
      gender: 'Giới tính', hairStyle: 'Kiểu tóc', hairColor: 'Màu tóc',
      eyeStyle: 'Mắt', skinColor: 'Da', outfit: 'Trang phục',
      outfitColor: 'Màu áo', accessory: 'Phụ kiện',
    };
    return map[key] || key;
  }

  _renderOpts(g) {
    if (g.type === 'swatch') {
      return g.options.map((c) =>
        `<button type="button" class="opt-swatch ${this.draft[g.key] === c ? 'active' : ''}"
          data-pick="${c}" style="background:${c}" title="${c}"></button>`
      ).join('');
    }
    return g.options.map((o) => {
      const id = o.id || o;
      const label = o.label || o.icon || o;
      return `<button type="button" class="opt-btn ${this.draft[g.key] === id ? 'active' : ''}"
        data-pick="${id}">${label}</button>`;
    }).join('');
  }

  _syncActive(wrap, key, val, isSwatch) {
    const group = wrap.querySelector(`[data-key="${key}"]`);
    const cls = isSwatch ? 'opt-swatch' : 'opt-btn';
    group?.querySelectorAll(`.${cls}`).forEach((el) => {
      el.classList.toggle('active', el.dataset.pick === val);
    });
  }

  saveCreator() {
    this.storage.saveAvatar(this.draft);
    const cb = this.onSave;
    this.onSave = null;
    if (cb) cb();
    else this.showScreen('screen-start');
  }

  renderSkinGrid() {
    const wrap = $('skin-grid');
    if (!wrap) return;
    const skins = this.storage.getSkinList();

    wrap.innerHTML = skins.map((s) => `
      <div class="skin-card glass ${s.active ? 'active' : ''} ${s.unlocked ? '' : 'locked'}"
           data-skin="${s.id}" role="button" tabindex="${s.unlocked ? 0 : -1}">
        ${!s.unlocked ? '<span class="skin-card__lock">🔒</span>' : ''}
        <div class="skin-card__icon">${s.icon}</div>
        <div class="skin-card__name">${s.name}</div>
        <div class="skin-card__desc">${s.desc}</div>
      </div>`).join('');

    wrap.querySelectorAll('.skin-card:not(.locked)').forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.dataset.skin;
        if (this.storage.setSkin(id)) {
          wrap.querySelectorAll('.skin-card').forEach((c) => c.classList.remove('active'));
          card.classList.add('active');
          const av = this.storage.getAvatar();
          this.profileCtrl.update(av, id);
        }
      });
    });
  }

  showAchievement(ach) {
    const el = $('achievement-popup');
    if (!el || !ach) return;
    el.querySelector('.achievement-popup__icon').textContent = ach.icon;
    el.querySelector('.achievement-popup__title').textContent = ach.title;
    el.querySelector('.achievement-popup__desc').textContent = ach.desc;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 4000);
  }
}
