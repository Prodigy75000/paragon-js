import { DEFAULT_SETTINGS } from "../core/SettingsManager.js";
import { MenuViewBase, UI_METRICS as UI } from "./MenuViewBase.js";

export default class OptionsView extends MenuViewBase {
  constructor({ manager, canvas, settingsManager } = {}) {
    super("OptionsView");
    this.manager = manager || null;
    this.canvas = canvas || document.getElementById("screenID");
    this.touch = null;
    this.settingsManager = settingsManager || null;
    this.settings = this.#resolveSettings();
    this.layout = null;
  }
  #resolveSettings() {
    if (this.settingsManager?.settings) {
      return { ...DEFAULT_SETTINGS, ...this.settingsManager.settings };
    }
    return { ...DEFAULT_SETTINGS };
  }

  setupTouchZones() {
    this.settings = this.#resolveSettings();
    this.canvas = this.canvas || document.getElementById("screenID");
    if (!this.canvas) return console.warn("[OptionsView] No canvas found");

    const ctx = this.canvas.getContext("2d");
    if (!ctx) return;

    const scale = ctx.getTransform().a || 1;
    const w = ctx.canvas.width / scale;
    const h = ctx.canvas.height / scale;

    this.layout = this.#buildLayout(w, h);

    // Clear previous zones (base onEnter already does, but safe here)
    this.touch?.clearZones();

    // Add all your settings buttons
    this.layout.rows.forEach((row) => {
      row.buttons.forEach((button) => {
        this.touch.addZone(
          `${row.key}_${button.value}`,
          button.x,
          button.y,
          button.width,
          button.height,
          () => this.#handleSelection(row.key, button.value)
        );
      });
    });
    // --- Back button ---
    const back = this.layout.back;
    this.touch.addZone(
      "options_back",
      back.x,
      back.y,
      back.width,
      back.height,
      () => {
        if (this.manager._returnToPause) {
          this.manager.setActiveView("PauseMenuView");
          this.manager._returnToPause = false;
        } else {
          this.manager.setActiveView("TitleView");
        }
      }
    );
  }

  #handleSelection(key, value) {
    if (key === "language") {
      this.settings.language = value;
      this.settingsManager?.set?.(key, value);
    } else {
      this.settings[key] = Boolean(value);
      this.settingsManager?.set?.(key, Boolean(value));
    }
  }

  handleInput(action) {
    if (["BACK", "CANCEL"].includes(action)) {
      this.manager?.setActiveView("TitleView");
    }
  }

  #buildLayout(w, h) {
    const rowHeight = 60;
    const startY = h * 0.3;
    const labelX = w * 0.25;

    const rows = [
      {
        key: "music",
        label: "Music",
        y: startY,
        buttons: [
          { label: "ON", value: true },
          { label: "OFF", value: false },
        ],
      },
      {
        key: "fx",
        label: "FX",
        y: startY + rowHeight,
        buttons: [
          { label: "ON", value: true },
          { label: "OFF", value: false },
        ],
      },
      {
        key: "language",
        label: "Language",
        y: startY + rowHeight * 2,
        buttons: [
          { label: "ENG", value: "ENG" },
          { label: "FR", value: "FR" },
        ],
      },
    ];

    // total width of both buttons + gap between them
    const totalButtonGroupWidth = UI.BUTTON_WIDTH * 2 + UI.SPACING;

    rows.forEach((row) => {
      const centerX = w * 0.6; // where the pair is horizontally aligned (slightly right of label)
      const startX = centerX - totalButtonGroupWidth / 2;

      row.buttons = row.buttons.map((button, i) => ({
        ...button,
        x: startX + i * (UI.BUTTON_WIDTH + UI.SPACING),
        y: row.y - UI.BUTTON_HEIGHT / 2,
        width: UI.BUTTON_WIDTH,
        height: UI.BUTTON_HEIGHT,
      }));
    });

    return {
      labelX,
      rows,
      back: {
        x: w - UI.BUTTON_WIDTH - UI.MARGIN,
        y: h - UI.BUTTON_HEIGHT - UI.MARGIN,
        width: UI.BUTTON_WIDTH,
        height: UI.BUTTON_HEIGHT,
      },
    };
  }

  #isActive(key, value) {
    if (key === "language") return this.settings.language === value;
    return Boolean(this.settings[key]) === Boolean(value);
  }

  draw(ctx) {
    const scale = ctx.getTransform().a || 1;
    const w = ctx.canvas.width / scale;
    const h = ctx.canvas.height / scale;

    if (!this.layout) this.layout = this.#buildLayout(w, h);

    // Background
    ctx.fillStyle = "#000022";
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = "#00FF00";
    ctx.font = "bold 26px monospace";
    ctx.textAlign = "center";
    ctx.fillText("Options", w / 2, h * 0.18);

    // Rows
    ctx.font = "18px monospace";
    ctx.textAlign = "right";
    this.layout.rows.forEach((row) => {
      // Compute button group bounding box
      const firstBtn = row.buttons[0];
      const lastBtn = row.buttons[row.buttons.length - 1];
      const groupCenterY = row.y; // already vertically centered
      const groupLeft = firstBtn.x;

      // --- draw label ---
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#00FF00";
      ctx.fillText(row.label, groupLeft - 12, groupCenterY);

      // --- draw buttons ---
      row.buttons.forEach((button) => {
        const active = this.#isActive(row.key, button.value);
        ctx.fillStyle = active ? "#00FF00" : "#0a3310";
        ctx.fillRect(button.x, button.y, button.width, button.height);

        ctx.strokeStyle = "#00FF00";
        ctx.lineWidth = 2;
        ctx.strokeRect(button.x, button.y, button.width, button.height);

        ctx.fillStyle = active ? "#001" : "#00FF00";
        ctx.font = "16px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          button.label,
          button.x + button.width / 2,
          button.y + button.height / 2 + 2
        );
      });
    });

    // Back button (identical to TitleView)
    const back = this.layout.back;
    ctx.fillStyle = "#0a3310";
    ctx.fillRect(back.x, back.y, back.width, back.height);
    ctx.strokeStyle = "#00FF00";
    ctx.lineWidth = 2;
    ctx.strokeRect(back.x, back.y, back.width, back.height);

    ctx.font = "16px monospace";
    ctx.fillStyle = "#00FF00";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Back", back.x + back.width / 2, back.y + back.height / 2 + 2);
  }
}
