// Player handles movement and rendering of the main character.
export class Player {
  constructor(x, y, tileSize) {
    this.x = x;
    this.y = y;
    this.tileSize = tileSize;
    this.spriteSize = tileSize * 2;
    this.image = new Image();
    this.image.src = "assets/spritesheets/sprites.png";
    this.imageLoaded = false;
    this.image.onload = () => (this.imageLoaded = true);
    this.targetX = this.x;
    this.targetY = this.y;
    this.speed = 4; // pixels per frame
  }
  moveToTile(tileX, tileY) {
    const px = tileX * this.tileSize + this.tileSize / 2;
    const py = tileY * this.tileSize + this.tileSize / 2;
    this.targetX = px;
    this.targetY = py;
  }
  update() {
    // smooth move toward target
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.hypot(dx, dy);
    // move only if distance is greater than speed
    if (dist > this.speed) {
      this.x += (dx / dist) * this.speed;
      this.y += (dy / dist) * this.speed;
    } else {
      this.x = this.targetX;
      this.y = this.targetY;
    }
  }
  // --- Draw the player sprite centered at (this.x, this.y) ---
  draw(ctx) {
    if (!this.imageLoaded) return;

    const ss = this.spriteSize;
    const drawX = this.x - ss / 2;
    const drawY = this.y - ss / 2;

    ctx.imageSmoothingEnabled = false;

    // Just draw the single sprite (no sx/sy variables)
    ctx.drawImage(this.image, 0, 0, ss, ss, drawX, drawY, ss, ss);
  }
}
