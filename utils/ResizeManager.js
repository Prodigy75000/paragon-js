// src/utils/ResizeManager.js
export class ResizeManager {
  /**
   * Handles responsive scaling for a fixed logical-resolution canvas.
   * The canvas keeps its internal (logical) pixel size constant (e.g., 512×512),
   * but CSS transforms scale it to fit the screen while preserving aspect ratio.
   */
  constructor(canvas, baseWidth = 512, baseHeight = 512) {
    this.canvas = canvas;
    this.baseWidth = baseWidth;
    this.baseHeight = baseHeight;
    this._scale = 1;
    this.onResize = null;
    this.debug = false; // disable noisy logs in production

    // Bind for event listeners
    this._boundResize = this.resize.bind(this);
    this._boundOrientation = this.resize.bind(this);

    window.addEventListener("resize", this._boundResize);
    window.addEventListener("orientationchange", this._boundOrientation);

    // Initial resize
    this.resize();

    if (!canvas) {
      console.warn("[ResizeManager] No canvas provided to ResizeManager.");
    }
  }

  dispose() {
    window.removeEventListener("resize", this._boundResize);
    window.removeEventListener("orientationchange", this._boundOrientation);
    if (this.debug) console.log("[ResizeManager] Disposed and listeners removed.");
  }

  // Current scale factor
  get scale() {
    return this._scale || 1;
  }

  /**
   * Unified resize handler (merges old resize() + update()).
   * Maintains a 9:16 portrait aspect ratio while centering the canvas.
   */
  resize() {
    if (!this.canvas) {
      console.warn("[ResizeManager] resize() called before canvas is set");
      return;
    }

    const { innerWidth: w, innerHeight: h } = window;
    const aspect = 9 / 16;

    let targetWidth, targetHeight;

    if (w / h > aspect) {
      // Window is wider than target → letterbox horizontally
      targetHeight = h;
      targetWidth = h * aspect;
    } else {
      // Window is taller than target → letterbox vertically
      targetWidth = w;
      targetHeight = w / aspect;
    }

    // Compute scale relative to logical resolution
    const scaleX = targetWidth / this.baseWidth;
    const scaleY = targetHeight / this.baseHeight;
    const scale = Math.min(scaleX, scaleY);
    this._scale = scale;

    // Apply CSS (do not alter internal canvas resolution)
    const canvas = this.canvas;
    canvas.style.width = `${this.baseWidth * scale}px`;
    canvas.style.height = `${this.baseHeight * scale}px`;

    // Center canvas
    const marginLeft = (w - this.baseWidth * scale) / 2;
    const marginTop = (h - this.baseHeight * scale) / 2;
    canvas.style.marginLeft = `${Math.max(0, marginLeft)}px`;
    canvas.style.marginTop = `${Math.max(0, marginTop)}px`;

    // Callback hook
    if (typeof this.onResize === "function") {
      this.onResize(scale);
    }

    if (this.debug) {
      console.log(
        `[ResizeManager] resize() → ${Math.round(w)}×${Math.round(h)} | scale=${scale.toFixed(2)}`
      );
    }
  }

  /**
   * Alias for backward compatibility with old code calling update()
   */
  update() {
    this.resize();
  }
}