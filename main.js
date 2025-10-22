// main.js
import { Paragon } from "./core/Paragon.js";
import { ResizeManager } from "./utils/ResizeManager.js";
import { Renderer } from "./core/Renderer.js";
import { SettingsManager } from "./core/SettingsManager.js";
import { SaveManager } from "./core/SaveManager.js";

// UI Views
import TitleView from "./ui/TitleView.js";
import MapView from "./ui/MapView.js";
import CharacterSelectView from "./ui/CharacterSelectView.js";
import OptionsView from "./ui/OptionsView.js";
import PauseMenuView from "./ui/PauseMenuView.js";

window.addEventListener("load", async () => {
  const TILE_SIZE = 32;
  const WIDTH_TILES = 9;
  const HEIGHT_TILES = 16;
  const LOGICAL_WIDTH = TILE_SIZE * WIDTH_TILES; // 288
  const LOGICAL_HEIGHT = TILE_SIZE * HEIGHT_TILES; // 512

  const canvas = document.getElementById("screenID");
  if (!canvas) {
    console.error("❌ Unable to locate #screenID canvas element");
    return;
  }

  // --- Canvas setup ---
  canvas.width = LOGICAL_WIDTH;
  canvas.height = LOGICAL_HEIGHT;

  // --- Core managers ---
  const settingsManager = new SettingsManager();
  await settingsManager.load();
  console.log("Loaded settings:", settingsManager.settings);

  const saveManager = new SaveManager();
  saveManager.loadGame(); // Preload existing save

  const resizeManager = new ResizeManager(
    canvas,
    LOGICAL_WIDTH,
    LOGICAL_HEIGHT
  );
  const renderer = new Renderer(
    "assets/spritesheets/tileset.png",
    "assets/spritesheets/sprites.png",
    32,
    64
  );

  renderer.setScale(resizeManager.scale);
  resizeManager.onResize = (scale) => renderer.setScale(scale);

  // --- Engine init ---
  const game = new Paragon({ canvasId: "screenID", settingsManager });
  game.viewManager.saveManager = saveManager;
  console.log("Save system attached:", !!game.viewManager.saveManager);

  // === Register view factories ===
  const vm = game.viewManager;

  vm.registerFactory(
    "TitleView",
    () =>
      new TitleView({
        manager: vm,
        canvas,
        settingsManager,
        renderer,
      })
  );

  vm.registerFactory(
    "CharacterSelectView",
    () =>
      new CharacterSelectView({
        manager: vm,
        canvas,
        settingsManager,
      })
  );

  vm.registerFactory(
    "MapView",
    () =>
      new MapView({
        manager: vm,
        renderer,
        canvas,
        resizeManager,
        settingsManager,
      })
  );

  vm.registerFactory(
    "OptionsView",
    () =>
      new OptionsView({
        manager: vm,
        canvas,
        settingsManager,
      })
  );

  vm.registerFactory(
    "PauseMenuView",
    () =>
      new PauseMenuView({
        manager: vm,
        canvas,
        settingsManager,
      })
  );

  // --- Start the game ---
  //await vm.setActiveView("TitleView"); // now async-safe
    await vm.setActiveView("MapView"); // now async-safe
  game.init();
});
