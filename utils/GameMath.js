export function toTileCoords(x, y, tileSize) {
  return {
    x: Math.floor(x / tileSize),
    y: Math.floor(y / tileSize),
  };
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
