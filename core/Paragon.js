import { Input } from "./Input.js";
import { ViewManager } from "./ViewManager.js";
// Main Paragon engine class
export class Paragon {
  constructor({
    canvasId = "screenID",
    settingsManager = null,
    debug = false,
  } = {}) {
    this.canvasId = canvasId;
    /** @type {HTMLCanvasElement|null} */
    this.canvas = null;
    /** @type {CanvasRenderingContext2D|null} */
    this.ctx = null;
    this.isRunning = false;
    /** @type {ViewManager} */
    // Initialize ViewManager
    this.viewManager = new ViewManager({ settingsManager });
    this.settingsManager = settingsManager;
    this.input = new Input();
    this.input.onAction = (action) => this.handleAction(action);
    this.lastFrameTime = performance.now();
    this.debug = debug;
  }
  // Initialize the Paragon engine
  init() {
    const canvas = document.getElementById(this.canvasId);
    if (!canvas) {
      throw new Error(`[Paragon] Canvas element #${this.canvasId} not found`);
    }
    // store canvas and context
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    if (!this.ctx) {
      throw new Error("[Paragon] Unable to get 2D rendering context");
    }
    // disable image smoothing for pixel art
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.imageSmoothingQuality = "low";
    // ensure ViewManager is ready
    if (!this.viewManager) {
      throw new Error("[Paragon] ViewManager not initialized");
    }

    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.loop();
  }
  // Main game loop
  loop() {
    if (!this.ctx || !this.viewManager || !this.isRunning) return;
    if (this.debug) console.log("[Loop] Frame tick");
    const now = performance.now();
    const dt = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;
    // Update and draw active view
    if (this.viewManager) {
      this.viewManager.update(dt);
      if (this.ctx) {
        this.viewManager.draw(this.ctx);
      }
    }
    requestAnimationFrame(() => this.loop());
  }
  handleAction(action) {
    if (!action) return;
    this.viewManager.handleInput(action);
  }
}
