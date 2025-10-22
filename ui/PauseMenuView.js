import { MenuViewBase } from "./MenuViewBase.js";

// Shared button constants
export default class PauseMenuView extends MenuViewBase {
  constructor({ manager, canvas, settingsManager } = {}) {
    super({ manager, canvas, settingsManager });
    this.manager = manager;
    this.canvas = canvas || document.getElementById("screenID");
    this.settingsManager = settingsManager;
    this.fadeAlpha = 0;
    this.fadeSpeed = 0.05; // tweak this for faster/slower fade
  }

  // Called automatically by MenuViewBase
  setupTouchZones() {
    if (!this.canvas) return console.warn("[PauseMenuView] No canvas found");

    const ctx = this.canvas.getContext("2d");
    if (!ctx) return;

    const scale = ctx.getTransform().a || 1;
    const w = ctx.canvas.width / scale;
    const h = ctx.canvas.height / scale;

    const buttonWidth = w * 0.5;
    const buttonHeight = 50;
    const startY = h * 0.4;
    const spacing = 70;

    // Clear existing zones (base already clears, but safe here)
    this.touch?.clearZones();

    // --- Resume button ---
    this.touch.addZone(
      "Resume",
      w / 2 - buttonWidth / 2,
      startY,
      buttonWidth,
      buttonHeight,
      () => {
        console.log("[PauseMenuView] Resuming game...");
        this.manager._isResuming = true;
        this.manager.setActiveView("MapView");
      }
    );

    // --- Options button ---
    this.touch.addZone(
      "Options",
      w / 2 - buttonWidth / 2,
      startY + spacing,
      buttonWidth,
      buttonHeight,
      () => {
        console.log("[PauseMenuView] Opening Options...");
        this.manager._returnToPause = true;
        this.manager.setActiveView("OptionsView");
      }
    );

    // --- Title button ---
    this.touch.addZone(
      "Title",
      w / 2 - buttonWidth / 2,
      startY + spacing * 2,
      buttonWidth,
      buttonHeight,
      () => {
        console.log("[PauseMenuView] Returning to Title...");
        this.manager._returnToPause = false;
        this.manager.setActiveView("TitleView");
      }
    );
  }

  draw(ctx) {
    const scale = ctx.getTransform().a || 1;
    const w = ctx.canvas.width / scale;
    const h = ctx.canvas.height / scale;

    // Dim background
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, w, h);

    // Text
    ctx.fillStyle = "#00FF00";
    ctx.font = "bold 24px monospace";
    ctx.textAlign = "center";
    ctx.fillText("Paused", w / 2, h * 0.25);

    ctx.font = "18px monospace";
    ctx.fillText("Resume", w / 2, h * 0.4 + 25);
    ctx.fillText("Options", w / 2, h * 0.4 + 95);
    ctx.fillText("Return to Title", w / 2, h * 0.4 + 165);
  }
}
