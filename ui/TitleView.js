import { MenuViewBase, UI_METRICS as UI } from "./MenuViewBase.js";
import { DEBUG } from "../config/debug.js";
export default class TitleView extends MenuViewBase {
  constructor({ manager, canvas, settingsManager, renderer } = {}) {
    super({ manager, canvas, settingsManager });
    this.renderer = renderer || null;
    this.title = "PARAGON";
  }
  async onEnter() {
    super.onEnter(); // ensures touch manager + lockInput
    this.setupTouchZones();
  }
  setupTouchZones() {
    const { width: w, height: h } = this.canvas;
    const hasSave = this.manager.saveManager?.hasSave();

    // --- New Game ---
    const zoneWidth = w * 0.5;
    const zoneHeight = UI.BUTTON_HEIGHT;
    const zoneX = w / 2 - zoneWidth / 2;
    const newGameY = h * 0.55 - zoneHeight / 2;

    this.touch.addZone(
      "NewGame",
      zoneX,
      newGameY,
      zoneWidth,
      zoneHeight,
      () => {
        if (DEBUG.general) console.log("[TitleView] Starting new game...");
        this.manager.setActiveView("CharacterSelectView");
      }
    );

    // --- Continue (only if save exists) ---
    if (hasSave) {
      const continueY = h * 0.65 - zoneHeight / 2;
      this.touch.addZone(
        "Continue",
        zoneX,
        continueY,
        zoneWidth,
        zoneHeight,
        () => {
          if (DEBUG.general) console.log("[TitleView] Loading saved game...");
          this.manager._loadedFromSave = true;
          this.manager.setActiveView("MapView");
        }
      );
    }

    // --- Options button ---
    const optionsX = UI.MARGIN;
    const optionsY = h - UI.BUTTON_HEIGHT - UI.MARGIN;

    this.touch.addZone(
      "Options",
      optionsX,
      optionsY,
      UI.BUTTON_WIDTH,
      UI.BUTTON_HEIGHT,
      () => {
        if (DEBUG.general) console.log("[TitleView] Opening Options...");
        this.manager.setActiveView("OptionsView");
      }
    );

    if (DEBUG.general)
      console.log("[TitleView] Zones added:", this.touch.zones);
  }

  draw(ctx) {
    const scale = ctx.getTransform().a || 1;
    const w = ctx.canvas.width / scale;
    const h = ctx.canvas.height / scale;

    // Background
    ctx.fillStyle = "#000022";
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.textAlign = "center";
    ctx.font = UI.TITLE_FONT;
    ctx.fillStyle = UI.COLOR_PRIMARY;
    ctx.fillText(this.title, w / 2, h * 0.45);

    const hasSave = this.manager.saveManager?.hasSave();

    // Blinking "Tap to Start"
    const time = performance.now() / 1000;
    if (Math.sin(time * 3) > 0) {
      ctx.font = "20px monospace";
      ctx.fillStyle = UI.COLOR_PRIMARY;
      ctx.fillText("Tap to start", w / 2, h * 0.55);
    }

    // Continue button (if save exists)
    if (hasSave) {
      ctx.font = "18px monospace";
      ctx.fillStyle = UI.COLOR_PRIMARY;
      ctx.fillText("Continue", w / 2, h * 0.65);
    }

    // Options button
    const optionsX = UI.MARGIN;
    const optionsY = h - UI.BUTTON_HEIGHT - UI.MARGIN;

    ctx.fillStyle = UI.COLOR_BG;
    ctx.fillRect(optionsX, optionsY, UI.BUTTON_WIDTH, UI.BUTTON_HEIGHT);
    ctx.strokeStyle = UI.COLOR_PRIMARY;
    ctx.lineWidth = 2;
    ctx.strokeRect(optionsX, optionsY, UI.BUTTON_WIDTH, UI.BUTTON_HEIGHT);

    ctx.font = UI.FONT;
    ctx.fillStyle = UI.COLOR_PRIMARY;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      "Options",
      optionsX + UI.BUTTON_WIDTH / 2,
      optionsY + UI.BUTTON_HEIGHT / 2 + 2
    );
  }
}
