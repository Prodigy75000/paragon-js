import { Renderer } from "../core/Renderer.js";
import { RenderConfig } from "../config/RenderConfig.js";
import { MenuViewBase, UI_METRICS as UI } from "./MenuViewBase.js";
import { DEBUG } from "../config/debug.js";
export default class CharacterSelectView extends MenuViewBase {
  constructor({ manager, canvas, settingsManager, renderer } = {}) {
    super("CharacterSelectView");
    this.manager = manager || null;
    this.canvas = canvas || document.getElementById("screenID");
    this.settingsManager = settingsManager || null;
    this.renderer = renderer || null;
    this.touch = null;
    this.phase = "instinct"; // instinct | character | details | confirm | instinctDetails | transition | exitConfirm
    this.selectedInstinct = null;
    this.selectedIndex = 0;
    this.transitionAlpha = 0;
    this.isTransitioning = false;
    this.transitionDirection = 1;
    this.selectedCharacters = {
      Faith: null,
      Flesh: null,
      Reason: null,
      Insight: null,
    };
    // === Instincts ===
    this.instincts = [
      { name: "Faith", desc: "Only devotion endures." },
      { name: "Flesh", desc: "Only hunger survives." },
      { name: "Reason", desc: "Only knowledge conquers." },
      { name: "Insight", desc: "Only eyes observe" },
    ];
    // === Character data ===
    this.data = {
      Faith: [
        {
          name: "Noam Veyne",
          title: "The Penitent",
          tagline: "Even the dead deserve a sermon.",
          bio: "A necromantic saint who sanctifies death itself, conjuring skeletal choirs. His body carries both faith and rot in equal measure.",
          stats: { HP: 100, STR: 12, DEF: 8, MAG: 16, SPD: 10 },
        },
        {
          name: "Count Viktor Bron",
          title: "The Exorcist",
          tagline: "Faith scorched my flesh—now my hunger burns for it.",
          bio: "Once a holy man, now a cursed vampire. He wields the duality of holy flame and bloodlust, though never both at once.",
          stats: { HP: 110, STR: 14, DEF: 10, MAG: 10, SPD: 9 },
        },
        {
          name: "Sister Mirelda",
          title: "The Abbess",
          tagline: "Pain is the only hymn that reaches heaven.",
          bio: "A blind nun who heals by taking others' wounds into herself. The deeper her agony, the brighter her miracles.",
          stats: { HP: 90, STR: 8, DEF: 10, MAG: 18, SPD: 11 },
        },
      ],
      Flesh: [
        {
          name: "Rauk Graven",
          title: "The Howler",
          tagline: "Better a beast that breathes than a man that prays.",
          bio: "Once a hunter, now part beast. Pain fuels his rage, which in turn fuels his monstrous transformations.",
          stats: { HP: 130, STR: 18, DEF: 12, MAG: 4, SPD: 10 },
        },
        {
          name: "Jobe Kael",
          title: "The Skin-Grafter",
          tagline: "I wear their strength; they wear my sins.",
          bio: "A battlefield surgeon who grafts the flesh of the fallen to his own. Each stitch whispers another’s dying voice.",
          stats: { HP: 120, STR: 14, DEF: 15, MAG: 6, SPD: 8 },
        },
        {
          name: "Karinna Voss",
          title: "The Red Maiden",
          tagline: "I endure until endurance becomes hunger.",
          bio: "A mercenary whose armor is fused to her flesh. When the plates crack, she bleeds freely, fighting until nothing stands.",
          stats: { HP: 110, STR: 16, DEF: 14, MAG: 5, SPD: 9 },
          portraitIndex: 0,
        },
      ],
      Reason: [
        {
          name: "Ephram Calder",
          title: "The Machinist",
          tagline: "Let the machine feel hunger for me.",
          bio: "A hollow-eyed engineer who feeds his grief to the gears he builds. His creations hum with something close to life.",
          stats: { HP: 95, STR: 10, DEF: 10, MAG: 14, SPD: 12 },
        },
        {
          name: "Marrek Dorran",
          title: "The Logician",
          tagline: "Every god is just an equation that hasn’t failed yet.",
          bio: "A scholar-priest who treats miracles as math—his runes reshape reality through divine calculations.",
          stats: { HP: 85, STR: 8, DEF: 8, MAG: 20, SPD: 10 },
        },
        {
          name: "Ilyra Fen",
          title: "The Arcanist",
          tagline: "Perfection is a matter of combustion.",
          bio: "An alchemist whose glowing veins channel logic itself—her formulas burn, heal, or crystallize with each precise cast.",
          stats: { HP: 100, STR: 12, DEF: 9, MAG: 14, SPD: 13 },
        },
      ],
      Insight: [
        {
          name: "Elara Thane",
          title: "The Harbinger",
          tagline: "I do not foresee the end — I announce it.",
          bio: "Elder sister of Aric Thane, blinded by prophecy yet guided by radiant visions of the end. She wanders the ruins ringing a silver bell that only the dying can hear.",
          stats: { HP: 95, STR: 10, DEF: 10, MAG: 14, SPD: 12 },
        },
        {
          name: "Liraen Voss",
          title: "The Seer",
          tagline: "Every thought is an open wound.",
          bio: "Once a visionary, now fractured by sight of too many futures. His mind sees endlessly, but never rests in the present.",
          stats: { HP: 85, STR: 8, DEF: 8, MAG: 20, SPD: 10 },
        },
        {
          name: "Aric Thane",
          title: "The Witness",
          tagline: "I see the ending in every motion.",
          bio: "An ascetic archer who replaced his eyes with lenses of quartz. He sees intent, not flesh, striking with divine precision.",
          stats: { HP: 100, STR: 12, DEF: 9, MAG: 14, SPD: 13 },
        },
      ],
    };
    // === Instinct lore ===
    this.instinctLore = {
      Faith:
        "Those who still pray to the Rot, believing redemption lies through devotion and suffering.",
      Flesh:
        "Those who abandon prayer for appetite, binding sinew and soul to endure the plague.",
      Reason:
        "Those who seek salvation through understanding — dissecting faith to master decay.",
      Insight:
        "Those who follow Insight believe that to see is to suffer. They seek clarity so absolute it pierces sanity itself.",
    };
    this.portraitRenderer = renderer
      ? renderer
      : new Renderer(
          "assets/spritesheets/tileset.png",
          "assets/spritesheets/heroportraits.png",
          RenderConfig.TILE_SIZE,
          RenderConfig.SPRITE_SIZE
        );
    // Assign each character a portrait index (placeholder for now)
    let i = 0;
    for (const group of Object.values(this.data)) {
      group.forEach((char) => {
        if (char.portraitIndex === undefined) {
          char.portraitIndex = i;
        }
        i++;
      });
      
    }
    
    this.statMaxima = this._computeStatMaxima();
    
  }
  async onEnter() {
  super.onEnter?.();

  // ✅ Always reset when re-entering from TitleView
  this.phase = "instinct";
  this.selectedInstinct = null;
  this.selectedIndex = 0;
  this.isTransitioning = false;
  this.transitionAlpha = 0;
  this.transitionDirection = 1;

  // rebuild base zones
  if (this.touch) {
    this.touch.clearZones();
    this.setupTouchZones();
  }

  if (DEBUG.general)
    console.log("[CharacterSelectView] Entered, reset to instinct phase.");
}
  
  // Called automatically by MenuViewBase.onEnter()

  _computeStatMaxima() {
    const maxima = {};
    for (const group of Object.values(this.data)) {
      group.forEach((char) => {
        Object.entries(char.stats).forEach(([stat, value]) => {
          if (!maxima[stat] || value > maxima[stat]) maxima[stat] = value;
        });
      });
    }
    return maxima;
  }
  setupTouchZones() {
    this._buildZones();
  }

  _drawPortrait(ctx, centerX, centerY, char) {
    const size = RenderConfig.SPRITE_SIZE;
    const half = size / 2;
    const framePadding = 6;
    const frameX = centerX - half - framePadding;
    const frameY = centerY - half - framePadding;
    const frameSize = size + framePadding * 2;

    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#D4AF37";
    ctx.fillStyle = "rgba(12, 10, 5, 0.6)";
    ctx.fillRect(frameX, frameY, frameSize, frameSize);
    ctx.strokeRect(frameX, frameY, frameSize, frameSize);

    if (this.portraitRenderer && this.portraitRenderer.spriteLoaded) {
      this.portraitRenderer.drawSprite(
        ctx,
        char.portraitIndex,
        centerX - half,
        centerY - half
      );
    } else {
      ctx.strokeStyle = "#555";
      ctx.strokeRect(centerX - half, centerY - half, size, size);
    }
    ctx.restore();
  }

  _drawStatsPanel(ctx, char, centerX, topY, width) {
    const stats = Object.entries(char.stats);
    const lineHeight = 20;
    const panelPadding = 14;
    const panelHeight = stats.length * lineHeight + panelPadding * 2;
    const x = centerX - width / 2;

    ctx.save();
    ctx.fillStyle = "rgba(10, 10, 25, 0.75)";
    ctx.strokeStyle = "#38405F";
    ctx.lineWidth = 2;
    ctx.fillRect(x, topY, width, panelHeight);
    ctx.strokeRect(x, topY, width, panelHeight);

    const barMaxWidth = width - panelPadding * 2 - 60;
    ctx.translate(x + panelPadding, topY + panelPadding);
    ctx.font = "12px monospace";
    ctx.textBaseline = "middle";

    stats.forEach(([stat, value], index) => {
      const ratio = Math.min(1, value / (this.statMaxima[stat] || value || 1));
      const y = index * lineHeight + lineHeight / 2;

      ctx.fillStyle = "#B7C6FF";
      ctx.textAlign = "left";
      ctx.fillText(stat, 0, y);

      ctx.fillStyle = "#1A2033";
      ctx.fillRect(40, y - 6, barMaxWidth, 12);
      ctx.fillStyle = "#62FF84";
      ctx.fillRect(40, y - 6, barMaxWidth * ratio, 12);

      ctx.textAlign = "right";
      ctx.fillStyle = "#FFFFAA";
      ctx.fillText(value.toString(), 40 + barMaxWidth + 16, y);
    });
    ctx.restore();
    return topY + panelHeight;
  }
  _setPhase(newPhase) {
  // Avoid redundant resets
  if (this.phase === newPhase) return;

  this.phase = newPhase;

  // Stop any lingering transition when changing manually
  this.isTransitioning = false;
  this.transitionAlpha = 0;
  this.transitionDirection = 1;

  if (this.touch) {
    this.touch.clearZones();
    this.setupTouchZones();

    if (DEBUG.general)
      console.log(`[CharacterSelectView] Phase set to ${newPhase}, zones rebuilt.`);
  }
}
  _getLayoutMetrics(ctx) {
    const scale = ctx.getTransform().a || 1;
    const w = ctx.canvas.width / scale;
    const h = ctx.canvas.height / scale;
    return { w, h };
  }
  _buildZones() {
    const canvas = this.canvas;
    if (!canvas || !this.touch) return;
    
    const ctx = canvas.getContext("2d");
    const { w, h } = this._getLayoutMetrics(ctx);
    const add = (...args) => this.touch.addZone(...args);
    // === INSTINCT PHASE ===
    if (this.phase === "instinct") {
      const total = this.instincts.length;
      const spacing = h * 0.12;
      const startY = h / 2 - ((total - 1) * spacing) / 2;
      const rowH = spacing * 0.8;
      // --- Instinct list
      this.instincts.forEach((instinct, i) => {
        const yTop = startY + i * spacing - rowH / 2;
        add(`Instinct_${instinct.name}`, w * 0.15, yTop, w * 0.7, rowH, () => {
          if (this.isTransitioning) return;
          if (this.selectedCharacters[instinct.name]) return;
          if (this.selectedIndex === i) {
            this._beginTransition();
          } else {
            this.selectedIndex = i;
            this.selectedInstinct = instinct.name;
          }
        });
      });
      // --- Info button (bottom-left)
      add(
        "InstinctInfo",
        10,
        h - UI.BUTTON_HEIGHT - 10,
        UI.BUTTON_WIDTH,
        UI.BUTTON_HEIGHT,
        () => {
          if (this.selectedInstinct === null)
            this.selectedInstinct = this.instincts[this.selectedIndex].name;
          this.phase = "instinctDetails";
          if (this.touch) {
            this.touch.clearZones();
            this.setupTouchZones();
          }
        }
      );
      // --- Title button (bottom-right)
      add(
        "GoTitle",
        w - UI.BUTTON_WIDTH - 10,
        h - UI.BUTTON_HEIGHT - 10,
        UI.BUTTON_WIDTH,
        UI.BUTTON_HEIGHT,
        () => {
          if (this.isTransitioning) return;
          this._setPhase("exitConfirm");
        }
      );
      return;
    }
    // === CHARACTER PHASE ===
    if (this.phase === "character" && this.selectedInstinct) {
      const chars = this.data[this.selectedInstinct];
      const total = chars.length;
      const spacing = h * 0.12;
      const startY = h / 2 - ((total - 1) * spacing) / 2;
      const rowH = spacing * 0.8;
      // --- Character list
      chars.forEach((c, i) => {
        const yTop = startY + i * spacing - rowH / 2;
        add(`Char_${c.name}`, w * 0.1, yTop, w * 0.8, rowH, () => {
          if (this.selectedIndex === i) {
  this._setPhase("confirm");
} else {
            this.selectedIndex = i;
          }
        });
      });
      // --- Info button (bottom-left)
      add(
        "Info",
        10,
        h - UI.BUTTON_HEIGHT - 10,
        UI.BUTTON_WIDTH,
        UI.BUTTON_HEIGHT,
        () => {
          this.phase = "profile";
          if (this.touch) {
            this.touch.clearZones();
            this.setupTouchZones();
          }
        }
      );
      // --- Back button  (bottom-right)
      add(
        "BackToInstinct",
        w - UI.BUTTON_WIDTH - 10,
        h - UI.BUTTON_HEIGHT - 10,
        UI.BUTTON_WIDTH,
        UI.BUTTON_HEIGHT,
        () => {
          this.phase = "instinct";
          this.selectedInstinct = null;
          this.selectedIndex = 0;
          if (this.touch) {
            this.touch.clearZones();
            this.setupTouchZones();
          }
        }
      );
      return;
    }
    // === INSTINCT DETAILS PHASE ===
    if (this.phase === "instinctDetails") {
      add(
        "BackFromInstinctDetails",
        w - UI.BUTTON_WIDTH - 10,
        h - UI.BUTTON_HEIGHT - 10,
        UI.BUTTON_WIDTH,
        UI.BUTTON_HEIGHT,
        () => {
          if (DEBUG.general)
            console.log("[TouchManager] tapped BackFromInstinctDetails");
          this.phase = "instinct";
          if (this.touch) {
            this.touch.clearZones();
            this.setupTouchZones();
          }
        }
      );
      return;
    }
    // === PROFILE PHASE ===
    if (this.phase === "profile") {
      add(
        "BackProfile",
        w - UI.BUTTON_WIDTH - 10,
        h - UI.BUTTON_HEIGHT - 10,
        UI.BUTTON_WIDTH,
        UI.BUTTON_HEIGHT,
        () => {
          this.phase = "character";
          if (this.touch) {
            this.touch.clearZones();
            this.setupTouchZones();
          }
        }
      );
      return;
    }
    // === CONFIRM PHASE ===
    if (this.phase === "confirm") {
      if (DEBUG.general)
        console.log(
          "[DEBUG ConfirmPhase] w:",
          w,
          "h:",
          h,
          "UI.CONFIRM_BUTTON_WIDTH:",
          UI.CONFIRM_BUTTON_WIDTH,
          "UI.CONFIRM_BUTTON_HEIGHT:",
          UI.CONFIRM_BUTTON_HEIGHT
        );
      const y = h / 2 + 40;
      // --- Confirm button
      add(
        "ConfirmPick",
        w / 2 - UI.CONFIRM_BUTTON_WIDTH - 10,
        y,
        UI.CONFIRM_BUTTON_WIDTH,
        UI.CONFIRM_BUTTON_HEIGHT,
        () => {
          const sel = this.data[this.selectedInstinct][this.selectedIndex];
          this.selectedCharacters[this.selectedInstinct] = sel.name;
          // all classes chosen → MapView
          if (Object.values(this.selectedCharacters).every((v) => v))
            this.manager.setActiveView("MapView");
          else {
            this.phase = "instinct";
            this.selectedInstinct = null;
            this.selectedIndex = 0;
            if (this.touch) {
              this.touch.clearZones();
              this.setupTouchZones();
            }
          }
        }
      );
      // --- Cancel button
      add(
        "CancelPick",
        w / 2 + 10,
        y,
        UI.CONFIRM_BUTTON_WIDTH,
        UI.CONFIRM_BUTTON_HEIGHT,
        () => {
          this.phase = "character";
          if (this.touch) {
            this.touch.clearZones();
            this.setupTouchZones();
          }
        }
      );
      return;
    }
    // === EXIT CONFIRM PHASE ===
    if (this.phase === "exitConfirm") {
      const y = h / 2 + 40;
      // Confirm exit to title
      add(
        "ExitConfirm",
        w / 2 - UI.CONFIRM_BUTTON_WIDTH - 10,
        y,
        UI.CONFIRM_BUTTON_WIDTH,
        UI.CONFIRM_BUTTON_HEIGHT,
        () => {
          this.manager.setActiveView("TitleView");
        }
      );
      add(
        "ExitCancel",
        w / 2 + 10,
        y,
        UI.CONFIRM_BUTTON_WIDTH,
        UI.CONFIRM_BUTTON_HEIGHT,
        () => {
          this._setPhase("instinct");
        }
      );
    }
  }
  _btnMetrics(ctx) {
    const w = ctx.canvas.width,
      h = ctx.canvas.height;
    return {
      pad: 8,
      w: Math.max(64, Math.floor(w * 0.22)),
      h: 24,
      leftX: 8,
      rightX: w - 8 - Math.max(64, Math.floor(w * 0.22)),
      y: h - 8 - 24,
    };
  }
  _drawButton(ctx, x, y, w, h, label) {
    ctx.fillStyle = "#00FF00";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#001";
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + w / 2, y + h / 2);
  }
  update(dt) {
    if (this.isTransitioning) {
      this.transitionAlpha += this.transitionDirection * dt * 2;
      this.transitionAlpha = Math.max(0, Math.min(1, this.transitionAlpha));
      if (this.transitionDirection === 1 && this.transitionAlpha >= 1) {
        this.phase = "character";
        this.transitionDirection = -1;
        if (this.touch) {
          this.touch.clearZones();
          this.setupTouchZones();
        }
      } else if (this.transitionDirection === -1 && this.transitionAlpha <= 0) {
        this.isTransitioning = false;
      }
    }
  }
  // Draw the view
  draw(ctx) {
    const scale = ctx.getTransform().a || 1; // current scale applied by ResizeManager
    const w = ctx.canvas.width / scale; // logical width (base coordinates)
    const h = ctx.canvas.height / scale;
    ctx.fillStyle = "#001";
    ctx.fillRect(0, 0, w, h);
    ctx.textAlign = "center";

    // === PROFILE PHASE (FULL BIO + STATS) ===
    if (this.phase === "profile") {
      const char = this.data[this.selectedInstinct][this.selectedIndex];
      const portraitY = h * 0.32;

      ctx.save();
      ctx.font = "18px monospace";
      ctx.fillStyle = "#FFFFCC";
      ctx.fillText(`${char.name} — ${char.title}`, w / 2, 44);
      ctx.restore();

      this._wrapText(
        ctx,
        char.tagline,
        70,
        14,
        w * 0.75,
        "12px monospace",
        "#62FF84"
      );

      this._drawPortrait(ctx, w / 2, portraitY, char);

      const bioStartY = portraitY + RenderConfig.SPRITE_SIZE / 2 + 56;
      this._wrapText(
        ctx,
        char.bio,
        bioStartY,
        14,
        w * 0.82,
        "12px monospace",
        "#00FFAA"
      );

      const statsLines = Object.keys(char.stats).length;
      const statsHeight = statsLines * 20 + 28;
      const buttonTop = h - UI.BUTTON_HEIGHT - 10;
      const statsTop = Math.min(
        h * 0.64,
        Math.max(120, buttonTop - statsHeight - 16)
      );
      this._drawStatsPanel(ctx, char, w / 2, statsTop, w * 0.55);
    }
    const m = this._btnMetrics(ctx);
    // === INSTINCT PHASE ===
    if (this.phase === "instinct") {
      ctx.font = "18px monospace";
      ctx.fillStyle = "#00FF00";
      ctx.fillText("Choose your instinct", w / 2, h * 0.2);
      const total = this.instincts.length;
      const spacing = h * 0.12;
      const startY = h / 2 - ((total - 1) * spacing) / 2;
      ctx.font = "14px monospace";
      this.instincts.forEach((instinct, i) => {
        const y = startY + i * spacing;
        const isSelected = i === this.selectedIndex;
        const locked = this.selectedCharacters[instinct.name];
        ctx.fillStyle = locked ? "#6666FF" : isSelected ? "#FFFF00" : "#00FF00";
        ctx.fillText(`${isSelected ? "> " : ""}${instinct.name}`, w / 2, y);
      });
      // Info bottom-left
      ctx.fillStyle = "#00FF00";
      ctx.fillRect(
        10,
        h - UI.BUTTON_HEIGHT - 10,
        UI.BUTTON_WIDTH,
        UI.BUTTON_HEIGHT
      );
      ctx.fillStyle = "#001";
      ctx.fillText(
        "Info",
        10 + UI.BUTTON_WIDTH / 2,
        h - UI.BUTTON_HEIGHT / 2 - 10
      );
      // Title bottom-right
      ctx.fillStyle = "#00FF00";
      ctx.fillRect(
        w - UI.BUTTON_WIDTH - 10,
        h - UI.BUTTON_HEIGHT - 10,
        UI.BUTTON_WIDTH,
        UI.BUTTON_HEIGHT
      );
      ctx.fillStyle = "#001";
      ctx.fillText(
        "Title",
        w - UI.BUTTON_WIDTH / 2 - 10,
        h - UI.BUTTON_HEIGHT / 2 - 10
      );
    }
    // === CHARACTER PHASE ===
    if (this.phase === "character") {
      ctx.font = "18px monospace";
      ctx.fillStyle = "#00FF00";
      ctx.fillText(`Instinct: ${this.selectedInstinct}`, w / 2, h * 0.2);
      // --- Character List ---
      const chars = this.data[this.selectedInstinct];
      const total = chars.length;
      const spacing = h * 0.12;
      const startY = h / 2 - ((total - 1) * spacing) / 2;
      ctx.font = "14px monospace";
      chars.forEach((c, i) => {
        const y = startY + i * spacing;
        const isSelected = i === this.selectedIndex;
        const color =
          this.selectedCharacters[this.selectedInstinct] === c.name
            ? "#8888FF"
            : isSelected
            ? "#FFFF00"
            : "#00FF00";
        ctx.fillStyle = color;
        ctx.fillText(
          `${isSelected ? "> " : ""}${c.name} — ${c.title}`,
          w / 2,
          y
        );
      });

      const selectedChar = chars[this.selectedIndex];
      if (selectedChar) {
        const buttonTop = h - UI.BUTTON_HEIGHT - 10;
        const panelHeight = 80;
        let panelY = buttonTop - panelHeight - 12;
        if (panelY < h * 0.55) panelY = h * 0.55;
        const panelWidth = w * 0.82;
        const panelX = (w - panelWidth) / 2;

        ctx.save();
        ctx.fillStyle = "rgba(8, 12, 20, 0.85)";
        ctx.strokeStyle = "#2E3A4F";
        ctx.lineWidth = 2;
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

        const taglineY = panelY + panelHeight / 2;
        this._wrapText(
          ctx,
          `"${selectedChar.tagline}"`,
          taglineY,
          14,
          panelWidth - 24,
          "12px monospace",
          "#C3D5FF"
        );
      }
    }
    // === CHARACTER DETAILS ===
    else if (this.phase === "details") {
      const char = this.data[this.selectedInstinct][this.selectedIndex];
      ctx.fillStyle = "#FFFF00";
      ctx.font = "18px monospace";
      ctx.fillText(`${char.name} — ${char.title}`, w / 2, 60);
      this._wrapText(
        ctx,
        char.tagline,
        100,
        14,
        w * 0.8,
        "12px monospace",
        "#00FF00"
      );
      this._wrapText(
        ctx,
        "Press CONFIRM to choose, BACK to return",
        h - 40,
        12,
        w * 0.8,
        "10px monospace",
        "#AAA"
      );
    }
    // === INSTINCT DETAILS ===
    else if (this.phase === "instinctDetails") {
      const inst = this.instincts[this.selectedIndex];
      ctx.fillStyle = "#FFFF00";
      ctx.font = "18px monospace";
      ctx.fillText(inst.name, w / 2, 60);
      this._wrapText(
        ctx,
        this.instinctLore[inst.name],
        100,
        14,
        w * 0.9,
        "12px monospace",
        "#00FF00"
      );
      ctx.fillStyle = "#00FF00";
      ctx.fillRect(
        w - UI.BUTTON_WIDTH - 10,
        h - UI.BUTTON_HEIGHT - 10,
        UI.BUTTON_WIDTH,
        UI.BUTTON_HEIGHT
      );
      ctx.fillStyle = "#001";
      ctx.font = "12px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        "Back",
        w - UI.BUTTON_WIDTH / 2 - 10,
        h - UI.BUTTON_HEIGHT / 2 - 10
      );
    }
    // === CONFIRM ===
    else if (this.phase === "confirm") {
      ctx.font = "16px monospace";
      ctx.fillStyle = "#FFFF00";
      ctx.fillText("Confirm Selection", w / 2, h / 2 - 50);
      // --- Character Name and Title ---
      const char = this.data[this.selectedInstinct][this.selectedIndex];
      ctx.font = "14px monospace";
      ctx.fillStyle = "#00FF00";
      ctx.fillText(`${char.name} — ${char.title}`, w / 2, h / 2 - 20);
      // --- Warning Text ---
      ctx.font = "10px monospace";
      ctx.fillStyle = "#AAA";
      ctx.fillText(
        "Tap Confirm to accept or Cancel to go back",
        w / 2,
        h / 2 + 5
      );
      // --- Buttons ---

      const y = h / 2 + 40;
      // Confirm
      ctx.fillStyle = "#00FF00";
      ctx.fillRect(
        w / 2 - UI.CONFIRM_BUTTON_WIDTH - 10,
        y,
        UI.CONFIRM_BUTTON_WIDTH,
        UI.CONFIRM_BUTTON_HEIGHT
      );
      ctx.fillStyle = "#000";
      ctx.fillText(
        "Confirm",
        w / 2 - UI.CONFIRM_BUTTON_WIDTH / 2 - 10,
        y + UI.CONFIRM_BUTTON_HEIGHT / 2 + 4
      );
      // Cancel
      ctx.fillStyle = "#FF3333";
      ctx.fillRect(
        w / 2 + 10,
        y,
        UI.CONFIRM_BUTTON_WIDTH,
        UI.CONFIRM_BUTTON_HEIGHT
      );
      ctx.fillStyle = "#000";
      ctx.fillText(
        "Cancel",
        w / 2 + UI.CONFIRM_BUTTON_WIDTH / 2 + 10,
        y + UI.CONFIRM_BUTTON_HEIGHT / 2 + 4
      );
    }
    // === EXIT CONFIRM ===
    else if (this.phase === "exitConfirm") {
      ctx.font = "16px monospace";
      ctx.fillStyle = "#FFFF00";
      ctx.fillText("Return to Title Screen?", w / 2, h / 2 - 50);
      // --- Warning Text ---
      ctx.font = "10px monospace";
      ctx.fillStyle = "#AAA";
      ctx.fillText("Tap Confirm to leave or Cancel to stay", w / 2, h / 2 - 20);
      // --- Buttons ---
      const y = h / 2 + 40;
      // Confirm
      ctx.fillStyle = "#00FF00";
      ctx.fillRect(
        w / 2 - UI.CONFIRM_BUTTON_WIDTH - 10,
        y,
        UI.CONFIRM_BUTTON_WIDTH,
        UI.CONFIRM_BUTTON_HEIGHT
      );
      ctx.fillStyle = "#000";
      ctx.fillText(
        "Confirm",
        w / 2 - UI.CONFIRM_BUTTON_WIDTH / 2 - 10,
        y + UI.CONFIRM_BUTTON_HEIGHT / 2 + 4
      );
      // Cancel
      ctx.fillStyle = "#FF3333";
      ctx.fillRect(
        w / 2 + 10,
        y,
        UI.CONFIRM_BUTTON_WIDTH,
        UI.CONFIRM_BUTTON_HEIGHT
      );
      ctx.fillStyle = "#000";
      ctx.fillText(
        "Cancel",
        w / 2 + UI.CONFIRM_BUTTON_WIDTH / 2 + 10,
        y + UI.CONFIRM_BUTTON_HEIGHT / 2 + 4
      );
    }
    if (this.isTransitioning) {
      ctx.fillStyle = `rgba(0,0,0,${this.transitionAlpha})`;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // --- Bottom buttons ---
    if (this.phase === "character") {
      // Info button (bottom-left)
      ctx.fillStyle = "#00FF00";
      ctx.fillRect(
        10,
        h - UI.BUTTON_HEIGHT - 10,
        UI.BUTTON_WIDTH,
        UI.BUTTON_HEIGHT
      );
      ctx.fillStyle = "#001";
      ctx.fillText(
        "Info",
        10 + UI.BUTTON_WIDTH / 2,
        h - UI.BUTTON_HEIGHT / 2 - 10
      );

      // Back button (bottom-right)
      ctx.fillStyle = "#00FF00";
      ctx.fillRect(
        w - UI.BUTTON_WIDTH - 10,
        h - UI.BUTTON_HEIGHT - 10,
        UI.BUTTON_WIDTH,
        UI.BUTTON_HEIGHT
      );
      ctx.fillStyle = "#001";
      ctx.fillText(
        "Back",
        w - UI.BUTTON_WIDTH / 2 - 10,
        h - UI.BUTTON_HEIGHT / 2 - 10
      );
    }
    // --- Profile phase ---
    if (this.phase === "profile") {
      // Back button for character info
      ctx.fillStyle = "#00FF00";
      ctx.fillRect(
        w - UI.BUTTON_WIDTH - 10,
        h - UI.BUTTON_HEIGHT - 10,
        UI.BUTTON_WIDTH,
        UI.BUTTON_HEIGHT
      );
      ctx.fillStyle = "#001";
      ctx.fillText(
        "Back",
        w - UI.BUTTON_WIDTH / 2 - 10,
        h - UI.BUTTON_HEIGHT / 2 - 10
      );
    }
  }

  // === INPUT ===
  handleInput(action) {
    const list = this._getCurrentList();
    switch (this.phase) {
      case "instinct":
        if (["UP", "DOWN"].includes(action)) this._cycle(action); // invert fix
        if (action === "DETAILS") this.phase = "instinctDetails";
        if (["CONFIRM", "OK"].includes(action)) {
          const inst = this.instincts[this.selectedIndex].name;
          if (!this.selectedCharacters[inst]) this._beginTransition();
        }
        if (["BACK", "CANCEL"].includes(action)) this.phase = "exitConfirm";
        break;

      case "character":
        if (["UP", "DOWN"].includes(action)) this._cycle(action);
        if (action === "DETAILS") this.phase = "profile"; // new profile phase
        if (["CONFIRM", "OK"].includes(action)) this.phase = "confirm";
        if (["BACK", "CANCEL"].includes(action)) {
          this.phase = "instinct";
          this.selectedInstinct = null;
          this.selectedIndex = 0;
        }
        break;
      case "profile":
        if (["BACK", "CANCEL"].includes(action)) this.phase = "character";
        break;

      case "details":
        if (["CONFIRM", "OK"].includes(action)) this.phase = "confirm";
        if (["BACK", "CANCEL"].includes(action)) this.phase = "character";
        break;

      case "instinctDetails":
        if (["BACK", "CANCEL"].includes(action)) this.phase = "instinct";
        break;

      case "confirm":
        if (["CONFIRM", "OK"].includes(action)) {
          const sel = this.data[this.selectedInstinct][this.selectedIndex];
          this.selectedCharacters[this.selectedInstinct] = sel.name;
          if (Object.values(this.selectedCharacters).every((v) => v))
            this.manager.setActiveView("MapView");
          else {
            this.phase = "instinct";
            this.selectedInstinct = null;
            this.selectedIndex = 0;
          }
        }
        if (["BACK", "CANCEL"].includes(action)) this.phase = "character";
        break;

      case "exitConfirm":
        if (["CONFIRM", "OK"].includes(action))
          this.manager.setActiveView("TitleView");
        if (["BACK", "CANCEL"].includes(action)) this.phase = "instinct";
        break;
    }
  }

  _cycle(action) {
    const list = this._getCurrentList();
    const len = list.length;
    this.selectedIndex =
      action === "UP"
        ? (this.selectedIndex - 1 + len) % len
        : (this.selectedIndex + 1) % len;
  }

  _beginTransition() {
    if (!this.selectedInstinct)
      this.selectedInstinct = this.instincts[this.selectedIndex].name;

    const selected = this.instincts[this.selectedIndex];
    this.selectedInstinct = selected.name;
    this.phase = "transition";
    this.isTransitioning = true;
    this.transitionAlpha = 0;
    this.transitionDirection = 1;
  }

  _getCurrentList() {
    return this.phase === "instinct"
      ? this.instincts
      : this.data[this.selectedInstinct];
  }
  // --- Helper: Wrapped text function ---
  _wrapText(
    ctx,
    text,
    y,
    lineHeight = 14,
    maxWidth = null,
    font = "12px monospace",
    color = "#AAA"
  ) {
    if (!ctx || !text) return;

    const scale = ctx.getTransform().a || 1;
    const w = ctx.canvas.width / scale;
    const actualMaxWidth = maxWidth || w * 0.85;

    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = "center";

    const words = text.split(" ");
    let line = "";
    let yy = y;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + " ";
      if (ctx.measureText(testLine).width > actualMaxWidth && i > 0) {
        ctx.fillText(line, w / 2, yy);
        line = words[i] + " ";
        yy += lineHeight;
      } else {
        line = testLine;
      }
    }

    ctx.fillText(line, w / 2, yy);
  }
}
