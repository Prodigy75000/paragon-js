import { View } from "../core/View.js";
import { TouchManager } from "../core/TouchManager.js";

export class MenuViewBase extends View {
  constructor({ manager, canvas, settingsManager }) {
    super();
    this.manager = manager;
    this.canvas = canvas;
    this.settingsManager = settingsManager;
    this.touch = null;
  }
  lockInput(duration = 300) {
    if (!this.touch) {
      console.warn("[LockInput] No TouchManager yet — skipping lock");
      return;
    }
    console.log(`[LockInput] Input locked for ${duration}ms`);
    this.touch._inputLocked = true;

    clearTimeout(this._unlockTimer);
    this._unlockTimer = setTimeout(() => {
      this.touch._inputLocked = false;
      console.log("[LockInput] Input unlocked");
    }, duration);
  }

  onEnter() {
    if (!this.touch && this.canvas) {
      this.touch = new TouchManager(this.canvas);
    }
    this.touch.clearZones();

    // NEW: setup zones defined by the child view
    this.setupTouchZones?.();
  }
  // Called when leaving the view
  onExit() {
    if (this.touch) {
      this.touch.clearZones();
      this.touch.dispose();
      this.touch = null;
    }
  }
  // Child classes will override this to define their touch zones
  setupTouchZones() {}

  getContext() {
    return this.canvas.getContext("2d");
  }
}
export const UI_METRICS = {
  BUTTON_WIDTH: 70,
  BUTTON_HEIGHT: 30,
  CONFIRM_BUTTON_WIDTH: 100,
  CONFIRM_BUTTON_HEIGHT: 30,
  MARGIN: 10,
  SPACING: 12,
  FONT: "16px monospace",
  TITLE_FONT: "bold 26px monospace",
  COLOR_PRIMARY: "#00FF00",
  COLOR_BG: "#0a3310",
};

// Move helper OUTSIDE the object
export function addCornerButton(view, name, position, callback) {
  const { BUTTON_WIDTH: bw, BUTTON_HEIGHT: bh, MARGIN: m } = UI_METRICS;
  const w = view.canvas.width;
  const h = view.canvas.height;

  const x = position === "left" ? m : w - bw - m;
  const y = h - bh - m;

  view.touch.addZone(name, x, y, bw, bh, callback);
}
