import { Player } from "../world/Player.js";
import { View } from "../core/View.js";
import { RenderConfig } from "../config/RenderConfig.js";
import { MenuViewBase } from "./MenuViewBase.js";
import { DEBUG } from "../config/debug.js";
/**
 * @class MapView
 * Renders maps and manages player movement.
 * Does not use MenuViewBase (this is an active gameplay view).
 */
export default class MapView extends View {
  constructor({ manager, renderer, canvas, resizeManager } = {}) {
    super("MapView");

    this.manager = manager;
    this.renderer = renderer;
    this.canvas = canvas;
    this.resizeManager = resizeManager;

    this.tileSize = RenderConfig.TILE_SIZE;
    this.mapData = [];
    this.width = 0;
    this.height = 0;
    this.spawnX = 0;
    this.spawnY = 0;

    // Player starts at placeholder coordinates; will be repositioned onEnter
    this.player = new Player(0, 0, this.tileSize);

    // Save immediately only if saveManager exists (do not autosave here)
    if (this.manager?.saveManager) {
      this.manager.saveManager.saveGame({
        map: this.currentMapName,
        player: {
          x: this.player.x,
          y: this.player.y,
          instinct: this.player.instinct,
        },
        timestamp: Date.now(),
      });
    }

    // Event handlers will be attached dynamically in onEnter
    this._onCanvasClick = null;
    this._onPauseKey = null;
    this._inputLocked = false;
  }

  /** Convert pixel coordinates to tile coordinates */
  toTileCoords(px, py) {
    return {
      x: Math.floor(px / this.tileSize),
      y: Math.floor(py / this.tileSize),
    };
  }

  /** Convert tile coordinates to pixel center coordinates */
  toPixelCenter(tx, ty) {
    return {
      x: tx * this.tileSize + this.tileSize / 2,
      y: ty * this.tileSize + this.tileSize / 2,
    };
  }

  /** Called when this view becomes active */
  async onEnter() {
    if (DEBUG.general) console.log("[MapView] Entering...");
    // 1️⃣  Ensure TouchManager exists
    if (!this.touch && this.canvas) {
      const { TouchManager } = await import("../core/TouchManager.js");
      this.touch = new TouchManager(this.canvas);
      if (DEBUG.general) console.log("[MapView] TouchManager initialized.");
    }
    // 2️⃣  Immediately lock input for 300 ms
    if (this.touch) {
      if (DEBUG.general) console.log("[LockInput] Input locked for 300ms");
      this.touch._inputLocked = true;
      setTimeout(() => {
        this.touch._inputLocked = false;
        if (DEBUG.general) console.log("[LockInput] Input unlocked");
      }, 300);
    }
    // 2️⃣  Attach your event listeners here if not already done
    const saveManager = this.manager?.saveManager;
    try {
      // === 1️⃣ Load the map first (always awaited)
      if (!this.manager._isResuming) {
        console.log("[MapView] Loading map...");
        await this.loadMap("map_tutorial");
        console.log("[MapView] Map loaded:", this.mapName);

        // === 2️⃣ Then load player position from save (if exists)
        const save = saveManager?.loadGame();

        if (save?.player) {
          if (DEBUG.general) console.log("[MapView] Save found:", save);

          // ✅ FIX: saved coordinates are already in pixels
          this.player.x = save.player.x;
          this.player.y = save.player.y;

          if (DEBUG.general)
            console.log(
              "[MapView] Player position loaded (pixels):",
              this.player.x,
              this.player.y
            );
        } else {
          if (DEBUG.general)
            console.log(
              "[MapView] No save found, using spawn point:",
              this.spawnX,
              this.spawnY
            );
          this.player.x = this.spawnX;
          this.player.y = this.spawnY;
        }

        // Sync movement targets
        this.player.targetX = this.player.x;
        this.player.targetY = this.player.y;

        // Optional sanity check
        if (
          this.player.x > this.width * this.tileSize ||
          this.player.y > this.height * this.tileSize
        ) {
          console.warn(
            "[MapView] ⚠️ Player out of map bounds after load!",
            "x:",
            this.player.x,
            "y:",
            this.player.y
          );
        }
      } else {
        if (DEBUG.general)
          console.log(
            "[MapView] Resuming existing session — skipping map load"
          );
      }

      // Reset temporary flags
      this.manager._isResuming = false;
      this.manager._loadedFromSave = false;

      // === 3️⃣ Bind inputs after everything is ready ===
      if (!this._onCanvasClick) {
        this._onCanvasClick = (e) => {
          // Use shared input lock instead of local flag
          if (this.touch?._inputLocked) {
            if (DEBUG.general)
              console.log("[MapView] Ignored click (input locked)");
            return;
          }

          const rect = this.canvas.getBoundingClientRect();
          const clickX = (e.clientX - rect.left) / this.resizeManager.scale;
          const clickY = (e.clientY - rect.top) / this.resizeManager.scale;
          const tile = this.toTileCoords(clickX, clickY);
          this.player.moveToTile(tile.x, tile.y);
        };

        this.canvas.addEventListener("click", this._onCanvasClick);
      }

      // Pause key
      if (!this._onPauseKey) {
        this._onPauseKey = (e) => {
          if (e.key === "Escape" || e.key.toLowerCase() === "p") {
            if (DEBUG.general) console.log("[MapView] Paused");
            this.manager.setActiveView("PauseMenuView");
          }
        };

        document.addEventListener("keydown", this._onPauseKey);
      }

      this.canvas.addEventListener("click", this._onCanvasClick);
      document.addEventListener("keydown", this._onPauseKey);

      if (DEBUG.general)
        console.log(
          "[MapView] Fully initialized. Player ready at:",
          this.player.x,
          this.player.y
        );
    } catch (err) {
      console.error("[MapView] Error during onEnter:", err);
    }
  }
  /** Called when leaving this view */
  onExit() {
    if (DEBUG.general) console.log("[MapView] Exiting, autosaving...");

    // --- 1️⃣ Clear any pending unlock timer ---
    if (this._unlockTimer) {
      clearTimeout(this._unlockTimer);
      this._unlockTimer = null;
    }

    // --- 2️⃣ Detach event listeners (if any) ---
    if (this._onCanvasClick) {
      this.canvas.removeEventListener("click", this._onCanvasClick);
      this._onCanvasClick = null;
    }

    if (this._onPauseKey) {
      document.removeEventListener("keydown", this._onPauseKey);
      this._onPauseKey = null;
    }

    if (DEBUG.general) console.log("[MapView] Listeners removed successfully");

    // --- 3️⃣ Autosave player state ---
    try {
      this.manager.saveManager.saveGame({
        map: this.currentMapName,
        player: {
          x: this.player.x,
          y: this.player.y,
          instinct: this.player.instinct,
        },
        timestamp: Date.now(),
      });
      if (DEBUG.general) "[MapView] Autosave complete";
    } catch (err) {
      console.warn("[MapView] Autosave failed:", err);
    }

    // --- 4️⃣ Reset input lock flags ---
    if (this.touch) this.touch._inputLocked = false;
    this._inputLocked = false;

    console.log("[MapView] Exited cleanly — state reset and listeners cleared");
  }
  /** Load and parse Tiled map JSON */
  async loadMap(mapName) {
    try {
      const res = await fetch(`assets/maps/${mapName}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${mapName}`);

      const data = await res.json();
      this.mapName = mapName;
      this.width = data.width;
      this.height = data.height;
      this.tileSize = data.tilewidth || RenderConfig.TILE_SIZE;

      // --- Tile layer ---
      const tileLayer = data.layers?.find((l) => l.type === "tilelayer");
      if (!tileLayer) throw new Error("No valid tile layer found");

      const arr = tileLayer.data.map((v) =>
        typeof v === "number" ? v - 1 : -1
      );

      this.mapData = [];
      for (let y = 0; y < this.height; y++) {
        this.mapData.push(arr.slice(y * this.width, (y + 1) * this.width));
      }

      // --- Spawn point ---
      const spawnLayer = data.layers.find((l) => l.name === "spawn");
      if (spawnLayer?.objects?.length) {
        const spawnObj = spawnLayer.objects[0];
        this.spawnX = spawnObj.x;
        this.spawnY = spawnObj.y;
        if (DEBUG.general)
          console.log(
            `[MapView] Found spawn at (${this.spawnX}, ${this.spawnY})`
          );
      } else {
        console.warn("[MapView] No spawn layer found — using (0,0)");
        this.spawnX = 0;
        this.spawnY = 0;
      }

      if (DEBUG.general)
        console.log(
          `[MapView] Loaded map '${mapName}' (${this.width}×${this.height})`
        );
    } catch (err) {
      console.error("[MapView] Map load error:", err.message);
      this.mapData = [];
    }
  }

  /** Main render loop */
  draw(ctx) {
    if (!this.renderer || !this.mapData?.length) return;

    const tileSize = this.tileSize;

    // Draw tiles
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tileIndex = this.mapData[y][x];
        if (tileIndex >= 0) {
          this.renderer.drawTile(ctx, tileIndex, x * tileSize, y * tileSize);
        }
      }
    }

    // Draw player
    this.player.update();
    this.player.draw(ctx);
  }
}
