import { SettingsManager } from "./SettingsManager.js";
import { Renderer } from "./Renderer.js";
import { DEBUG } from "../config/debug.js";

export class ViewManager {
  constructor({ settingsManager = null, renderer = null, canvas = null } = {}) {
    this.settingsManager = settingsManager ?? new SettingsManager();
    this.renderer =
      renderer ??
      new Renderer(
        "assets/spritesheets/tileset.png",
        "assets/spritesheets/sprites.png",
        32,
        64
      );

    this.canvas = canvas || document.getElementById("screenID");
    this.views = {}; // holds instantiated views
    this.viewFactories = {}; // holds lazy factory functions
    this.activeView = null;
  }

  /**
   * Register a view or a factory function for deferred creation
   * Example:
   * manager.registerFactory("MapView", () => new MapView({ manager }));
   */
  registerFactory(name, factoryFn) {
    if (typeof factoryFn !== "function") {
      console.warn(`[ViewManager] Invalid factory for ${name}`);
      return;
    }
    this.viewFactories[name] = factoryFn;
  }

  /** Register a persistent instance */
  registerView(name, instance) {
    instance.manager = this;
    instance.settingsManager = this.settingsManager;
    instance.canvas = instance.canvas || this.canvas;
    this.views[name] = instance;
  }

  /** Switch to another view (supports factories) */
  async setActiveView(name) {
    if (this.activeView) {
      if (DEBUG.general)
        console.log(
          `[ViewManager] Exiting ${this.activeView.constructor.name}`
        );
      await this.activeView.onExit?.();
    }

    // Reuse if already created
    let nextView = this.views[name];

    // Lazily build if needed
    if (!nextView && this.viewFactories[name]) {
      nextView = this.viewFactories[name]();
      this.views[name] = nextView;
    }

    if (!nextView) {
      console.error(`[ViewManager] No view or factory registered for ${name}`);
      return;
    }

    nextView.manager = this;
    nextView.settingsManager = this.settingsManager;
    nextView.canvas = nextView.canvas || this.canvas;

    this.activeView = nextView;
    await this.activeView.onEnter();
    if (DEBUG.general) console.log(`[ViewManager] Active view: ${name}`);
  }

  update(dt) {
    this.activeView?.update?.(dt);
  }
  draw(ctx) {
    this.activeView?.draw?.(ctx);
  }
  handleInput(action) {
    this.activeView?.handleInput?.(action);
  }
  /** === Save / Resume Interface === */

  // used by PauseMenuView / MapView
  resumeFromSave() {
    this._isResuming = true;
  }
  finishResume() {
    this._isResuming = false;
  }
  isResuming() {
    return !!this._isResuming;
  }

  // safe wrappers for save/load
  saveState(data) {
    this.saveManager?.saveGame(data);
  }
  loadState() {
    return this.saveManager?.loadGame();
  }
  hasSave() {
    return this.saveManager?.hasSave?.() ?? false;
  }
  clearSave() {
    this.saveManager?.clearSave?.();
  }
}
