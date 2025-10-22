import { RenderConfig } from "../config/RenderConfig.js";
/**
 * Stores the current display scale.
 * Consumers (TouchManager, UI Views) must read renderer.scale
 * to align logical coords with CSS-scaled canvas.
 */
export class Renderer {
  constructor(tilePath, spritePath, tileSize = 32, spriteSize = 64) {
    // --- Load tileset and spritesheet ---
    this.tileSheet = new Image();
    this.tileSheet.src = tilePath;
    this.spriteSheet = new Image();
    this.spriteSheet.src = spritePath;

    this.tileLoaded = false;
    this.spriteLoaded = false;

    // Use provided sizes or fallbacks
    this.tileSize = tileSize || RenderConfig.TILE_SIZE;
    this.spriteSize = spriteSize || RenderConfig.SPRITE_SIZE;

    this.scale = 1; // logical scale (stored for reference, not applied)
    this.tileSheet.onload = () => {
      this.tileLoaded = true;
      this.tilesPerRow = Math.floor(this.tileSheet.width / this.tileSize);
    };
    this.spriteSheet.onload = () => (this.spriteLoaded = true);
  }

  // External scale setter (e.g., ResizeManager)
  setScale(scale) {
    this.scale = scale;
  }

  // --- Draw a tile (no internal scale to avoid double-scaling) ---
  drawTile(ctx, tileIndex, x, y) {
    if (!this.tileLoaded) return;

    const tilesPerRow = this.tilesPerRow;
    const sx = (tileIndex % tilesPerRow) * this.tileSize;
    const sy = Math.floor(tileIndex / tilesPerRow) * this.tileSize;

    ctx.drawImage(
      this.tileSheet,
      sx,
      sy,
      this.tileSize,
      this.tileSize,
      x,
      y,
      this.tileSize,
      this.tileSize
    );
  }

  // --- Draw a sprite (character, NPC, etc.) ---
  drawSprite(ctx, spriteIndex, x, y) {
    if (!this.spriteLoaded || this.spriteSheet.width === 0) return;

    const perRow = Math.floor(this.spriteSheet.width / this.spriteSize);
    const sx = (spriteIndex % perRow) * this.spriteSize;
    const sy = Math.floor(spriteIndex / perRow) * this.spriteSize;

    ctx.drawImage(
      this.spriteSheet,
      sx,
      sy,
      this.spriteSize,
      this.spriteSize,
      x,
      y,
      this.spriteSize,
      this.spriteSize
    );
  }

  // --- Clear the logical canvas ---
  clear(ctx, color = "#000") {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}
