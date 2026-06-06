const STORAGE_KEY = 'mln-quiz-settings';

const DEFAULTS = {
  music: true,
  sfx: true,
  volume: 80,
  animations: true,
  name: '',
};

export class SettingsManager {
  constructor() {
    this.data = { ...DEFAULTS };
    this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) Object.assign(this.data, JSON.parse(raw));
    } catch { /* noop */ }
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  get(key) {
    return this.data[key];
  }

  set(key, value) {
    this.data[key] = value;
  }
}
