export const DEFAULT_SETTINGS = {
  music: true,
  fx: true,
  language: "ENG",
};

export class SettingsManager {
  constructor(storageKey = "paragon-settings") {
    this.storageKey = storageKey;
    this.settings = { ...DEFAULT_SETTINGS };
  }

  async load() {
    const storage = this.#getStorage();
    if (!storage) {
      return this.settings;
    }

    try {
      const raw = storage.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.settings = { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.warn("[SettingsManager] Failed to load settings", error);
      this.settings = { ...DEFAULT_SETTINGS };
    }

    return this.settings;
  }

  save() {
    const storage = this.#getStorage();
    if (!storage) {
      return;
    }

    try {
      storage.setItem(this.storageKey, JSON.stringify(this.settings));
    } catch (error) {
      console.warn("[SettingsManager] Failed to save settings", error);
    }
  }

  set(key, value) {
    if (!(key in this.settings)) {
      console.warn(`[SettingsManager] Attempted to set unknown key: ${key}`);
      return;
    }

    this.settings[key] = value;
    this.save();
  }

  toggle(key) {
    if (typeof this.settings[key] !== "boolean") {
      console.warn(`[SettingsManager] Cannot toggle non-boolean key: ${key}`);
      return;
    }

    this.set(key, !this.settings[key]);
  }

  get(key) {
    return this.settings[key];
  }

  #getStorage() {
    if (typeof window === "undefined" || !window.localStorage) {
      return null;
    }

    return window.localStorage;
  }
}

export default SettingsManager;
