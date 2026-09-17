import { PNG } from 'pngjs';
import fs from 'node:fs';

export const palette = JSON.parse(fs.readFileSync(new URL('../../assets/palette.json', import.meta.url), 'utf8'));
export const rgba = color => {
  const hex = palette[color] ?? color;
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), 255];
};
export class Pixels {
  constructor(width, height) { this.image = new PNG({ width, height }); }
  dot(x, y, color) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.image.width || y >= this.image.height) return;
    this.image.data.set(rgba(color), (y * this.image.width + x) * 4);
  }
  rect(x, y, w, h, color) { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) this.dot(xx, yy, color); }
  line(x, y, xx, yy, color) {
    const steps = Math.max(Math.abs(xx - x), Math.abs(yy - y));
    for (let i = 0; i <= steps; i++) this.dot(x + (xx - x) * i / (steps || 1), y + (yy - y) * i / (steps || 1), color);
  }
  ellipse(cx, cy, rx, ry, color) {
    for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
      if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) this.dot(x, y, color);
    }
  }
  poly(points, color) {
    const min = Math.min(...points.map(p => p[1])), max = Math.max(...points.map(p => p[1]));
    for (let y = min; y <= max; y++) {
      const cuts = [];
      points.forEach(([x1, y1], i) => {
        const [x2, y2] = points[(i + 1) % points.length];
        if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) cuts.push(x1 + (y - y1) * (x2 - x1) / (y2 - y1));
      });
      cuts.sort((a, b) => a - b);
      for (let i = 0; i < cuts.length; i += 2) this.rect(Math.ceil(cuts[i]), y, Math.floor(cuts[i + 1]) - Math.ceil(cuts[i]) + 1, 1, color);
    }
  }
  save(path) { fs.writeFileSync(path, PNG.sync.write(this.image)); }
}
export function random(seed) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
