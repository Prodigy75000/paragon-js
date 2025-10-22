/**
 * @class SaveManager
 * Handles saving and loading game data via localStorage.
 */
export class SaveManager {
  constructor(key = "PARAGON_SAVE") {
    this.key = key;
  }

  /** Save game state to localStorage */
  saveGame(data = {}) {
    try {
      if (!data || typeof data !== "object") return;

      // ⚠️ Skip invalid player saves
      if (data.player && data.player.x === 0 && data.player.y === 0) {
        console.warn("[SaveManager] Ignoring invalid save (0,0)");
        return;
      }

      const json = JSON.stringify(data);
      localStorage.setItem(this.key, json);
      console.log("[SaveManager] ✅ Game saved:", data);
    } catch (err) {
      console.error("[SaveManager] ❌ Save error:", err);
    }
  }

  /** Load saved data from localStorage */
  loadGame() {
    try {
      const json = localStorage.getItem(this.key);
      if (!json) {
        console.warn(
          "[SaveManager] No save found in localStorage for key:",
          this.key
        );
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

  /** Check if a save exists */
  hasSave() {
    return localStorage.getItem(this.key) !== null;
  }

  /** Delete save */
  clearSave() {
    try {
      localStorage.removeItem(this.key);
      console.log("[SaveManager] 🗑️ Save cleared");
    } catch (err) {
      console.error("[SaveManager] ❌ Clear error:", err);
    }
  }
}

export default SaveManager;
