export class View {
  constructor(name = "UnnamedView") {
    this.name = name;
  }
  update() {
    // placeholder: logic per frame
  }
  // Draw the view
  draw(ctx) {
    if (!ctx) return;
    ctx.fillStyle = "#003";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "#0f0";
    ctx.font = "16px monospace";
    ctx.fillText(`View: ${this.name}`, 10, 24);
  }
  getCanvasMetrics() {
    const ctx = this.canvas.getContext("2d");
    const scale = ctx.getTransform().a || 1;
    return {
      ctx,
      w: ctx.canvas.width / scale,
      h: ctx.canvas.height / scale,
    };
  }
}
