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
    // Store bound functions so we can remove them later
    this._boundResize = this.resize.bind(this);
    this._boundOrientation = this.resize.bind(this);
    // Listen for window resize/orientation changes
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
    console.log("[ResizeManager] Disposed and listeners removed.");
  }
  // Current scale factor
  get scale() {
    return this._scale || 1;
  }
  resize() {
    if (!this.canvas) {
      console.warn("[ResizeManager] resize() called before canvas is set");
      return;
    }
    const { innerWidth: w, innerHeight: h } = window;
    // maintain a 9:16 aspect ratio (portrait)
    const targetHeight = h;
    const targetWidth = (h * 9) / 16;
    // compute scale based on logical resolution
    const scaleX = targetWidth / this.baseWidth;
    const scaleY = targetHeight / this.baseHeight;
    const scale = Math.min(scaleX, scaleY);
    // store scale
    this._scale = scale;
    // use CSS to scale, do NOT modify internal canvas resolution
    this.canvas.style.width = `${this.baseWidth * scale}px`;
    this.canvas.style.height = `${this.baseHeight * scale}px`;
    // horizontally center the canvas
    const leftPad = (w - this.baseWidth * scale) / 2;
    this.canvas.style.marginLeft = `${Math.max(0, leftPad)}px`;
    // callback on resize
    if (typeof this.onResize === "function") this.onResize(scale);

    console.log(
      `[ResizeManager] Portrait resize → scale=${scale.toFixed(2)} (${
        this.baseWidth
      }×${this.baseHeight})`
    );
  }
  update() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const aspect = 9 / 16;

  let targetWidth, targetHeight;

  if (w / h > aspect) {
    // Wider than tall → landscape letterbox horizontally
    targetHeight = h;
    targetWidth = h * aspect;
  } else {
    // Taller than wide → portrait letterbox vertically
    targetWidth = w;
    targetHeight = w / aspect;
  }

  const scale = targetWidth / this.baseWidth;
  this.canvas.style.width  = `${targetWidth}px`;
  this.canvas.style.height = `${targetHeight}px`;
  this.canvas.style.marginLeft = `${(w - targetWidth) / 2}px`;
  this.canvas.style.marginTop  = `${(h - targetHeight) / 2}px`;
  this.scale = scale;
  if (this.onResize) this.onResize(scale);
}
}
