/**
 * @class SaveManager
 * Handles saving and loading game data via localStorage (async-safe).
 * Future-proof: all methods return Promises, allowing migration to IndexedDB or filesystem later.
 */
export class SaveManager {
  constructor(key = "PARAGON_SAVE") {
    this.key = key;
    this.initialized = true;
  }

  /** Save game state asynchronously */
  async saveGame(data = {}) {
    try {
      if (!this.initialized) {
        console.warn("[SaveManager] Ignored save — manager not initialized yet.");
        return;
      }
      if (!data || typeof data !== "object") return;

      // ⚠️ Skip invalid player saves
      if (data.player && data.player.x === 0 && data.player.y === 0) {
        console.warn("[SaveManager] Ignoring invalid save (0,0)");
        return;
      }

      const json = JSON.stringify(data);
      await Promise.resolve(localStorage.setItem(this.key, json));
      console.log("[SaveManager] ✅ Game saved:", data);
    } catch (err) {
      console.error("[SaveManager] ❌ Save error:", err);
    }
  }

  /** Load game state asynchronously */
  async loadGame() {
    try {
      const json = await Promise.resolve(localStorage.getItem(this.key));
      if (!json) {
        console.warn("[SaveManager] No save found for key:", this.key);
        return null;
      }

      const parsed = JSON.parse(json);
      console.log("[SaveManager] ✅ Loaded from memory:", parsed);
      return parsed;
    } catch (err) {
      console.error("[SaveManager] ❌ Load error:", err);
      return null;
    }
  }

  /** Check if a save exists (synchronous check is fine here) */
  hasSave() {
    try {
      return localStorage.getItem(this.key) !== null;
    } catch (err) {
      console.error("[SaveManager] ❌ hasSave() error:", err);
      return false;
    }
  }

  /** Delete save asynchronously */
  async clearSave() {
    try {
      await Promise.resolve(localStorage.removeItem(this.key));
      console.log("[SaveManager] 🗑️ Save cleared");
    } catch (err) {
      console.error("[SaveManager] ❌ Clear error:", err);
    }
  }
}

export default SaveManager;