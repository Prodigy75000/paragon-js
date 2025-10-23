import { DEBUG } from "../config/debug.js";

// core/TouchManager.js
export class TouchManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.zones = [];
    this._inputLocked = false;

    if (!this.canvas) {
      console.warn("[TouchManager] No canvas provided");
      return;
    }

    // --- Bind methods so we can remove them later ---
    this._boundPointerDown = this._onPointerDown.bind(this);
    this._boundPointerUp = this._onPointerUp.bind(this);
    this._boundPointerMove = this._onPointerMove.bind(this);

    // --- Unified pointer system (no duplicate events) ---
    this.canvas.addEventListener("pointerdown", this._boundPointerDown);
    this.canvas.addEventListener("pointerup", this._boundPointerUp);
    this.canvas.addEventListener("pointermove", this._boundPointerMove);

    if (DEBUG.touch) {
      console.log("[TouchManager] Initialized and listening for pointer events.");
    }
  }

  _log(message, ...args) {
    if (DEBUG.touch) console.log(`[TouchManager] ${message}`, ...args);
  }

  // --- Clean up event listeners ---
  dispose() {
    if (!this.canvas) return;

    this.canvas.removeEventListener("pointerdown", this._boundPointerDown);
    this.canvas.removeEventListener("pointerup", this._boundPointerUp);
    this.canvas.removeEventListener("pointermove", this._boundPointerMove);

    if (DEBUG.touch) {
      console.log("[TouchManager] Disposed pointer listeners.");
    }
  }

  // --- Add and clear touch zones ---
  addZone(name, x, y, w, h, callback) {
    this.zones.push({ name, x, y, w, h, callback });
    if (DEBUG.touch) {
      console.log(`[TouchManager] Added zone "${name}" (${x}, ${y}, ${w}×${h})`);
    }
  }

  clearZones() {
    this.zones = [];
    if (DEBUG.touch) console.log("[TouchManager] Cleared all touch zones.");
  }

  // --- Internal event handlers ---
  _onPointerDown(e) {
    if (this._inputLocked) {
      if (DEBUG.touch) console.log("[TouchManager] Ignored click (input locked)");
      return;
    }
    this._onPointer(e);
  }

  _onPointerUp(e) {
    // reserved for future press/hold logic
  }

  _onPointerMove(e) {
    // reserved for hover/drag logic
  }

  // --- Shared pointer logic ---
  _onPointer(e) {
    if (!this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    const ctx = this.canvas.getContext("2d");
    const transform = ctx.getTransform();
    const scale = transform.a || 1;

    // Adjust coordinates for scale and canvas position
    const x =
      ((e.clientX - rect.left) * (this.canvas.width / rect.width)) / scale;
    const y =
      ((e.clientY - rect.top) * (this.canvas.height / rect.height)) / scale;

    // Check for zone hit
    for (const z of this.zones) {
      if (x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h) {
        if (DEBUG.touch) {
          console.log(
            `[TouchManager] Touch → zone="${z.name}" @ (${x.toFixed(0)}, ${y.toFixed(0)})`
          );
        }
        z.callback?.(x, y, e);
        return;
      }
    }

    if (DEBUG.touch) {
      console.log(`[TouchManager] Miss @ (${x.toFixed(0)}, ${y.toFixed(0)})`);
    }
  }
}