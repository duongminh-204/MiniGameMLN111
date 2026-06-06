import { AVATAR_DEFAULT, SKINS } from './avatar-data.js';

const AVATAR_KEY = 'mln-quiz-avatar';
const UNLOCKS_KEY = 'mln-quiz-unlocks';

export class AvatarStorage {
  constructor() {
    this.avatar = { ...AVATAR_DEFAULT };
    this.unlocks = { skins: ['default'], achievements: [] };
    this.load();
  }

  load() {
    try {
      const a = localStorage.getItem(AVATAR_KEY);
      if (a) this.avatar = { ...AVATAR_DEFAULT, ...JSON.parse(a) };
      const u = localStorage.getItem(UNLOCKS_KEY);
      if (u) this.unlocks = { skins: ['default'], achievements: [], ...JSON.parse(u) };
      if (!this.unlocks.skins.includes('default')) this.unlocks.skins.unshift('default');
    } catch { /* noop */ }
  }

  saveAvatar(config) {
    this.avatar = { ...AVATAR_DEFAULT, ...config };
    localStorage.setItem(AVATAR_KEY, JSON.stringify(this.avatar));
  }

  saveUnlocks() {
    localStorage.setItem(UNLOCKS_KEY, JSON.stringify(this.unlocks));
  }

  hasAvatar() {
    return !!localStorage.getItem(AVATAR_KEY);
  }

  getAvatar() {
    return { ...this.avatar };
  }

  setSkin(skinId) {
    if (this.unlocks.skins.includes(skinId)) {
      this.avatar.skinId = skinId;
      this.saveAvatar(this.avatar);
      return true;
    }
    return false;
  }

  isSkinUnlocked(skinId) {
    return this.unlocks.skins.includes(skinId);
  }

  checkUnlocks(gameState, results = null) {
    const { stagesDone, correct, totalQuestions } = gameState;
    const total = totalQuestions || 15;
    const pct = results ? results.pct : Math.round((correct / total) * 100);
    const toUnlock = [];

    if (stagesDone?.includes(0)) toUnlock.push('warrior');
    if (stagesDone?.includes(1)) toUnlock.push('scholar');
    if (stagesDone?.length >= 3 || stagesDone?.includes(2)) toUnlock.push('revolutionary');
    if (pct >= 90) toUnlock.push('golden');

    let changed = false;
    toUnlock.forEach((id) => {
      if (!this.unlocks.skins.includes(id)) {
        this.unlocks.skins.push(id);
        changed = true;
      }
    });
    if (changed) this.saveUnlocks();
    return toUnlock.filter((id) => !this.isSkinUnlocked(id) || changed);
  }

  unlockAchievement(id) {
    if (!this.unlocks.achievements.includes(id)) {
      this.unlocks.achievements.push(id);
      this.saveUnlocks();
      return true;
    }
    return false;
  }

  getSkinList() {
    return Object.values(SKINS).map((s) => ({
      ...s,
      unlocked: this.isSkinUnlocked(s.id),
      active: this.avatar.skinId === s.id,
    }));
  }
}
