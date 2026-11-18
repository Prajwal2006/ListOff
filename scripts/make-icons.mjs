// Regenerates favicon.ico and apple-icon.png from src/app/icon.svg.
// Usage: node scripts/make-icons.mjs
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const svg = readFileSync("src/app/icon.svg");
const png = (size) => sharp(svg, { density: 384 }).resize(size, size).png().toBuffer();

// favicon.ico: an ICO container holding PNG images (supported by all modern browsers and Windows).
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(png));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(images.length, 4);
const entries = [];
let offset = 6 + 16 * images.length;
images.forEach((img, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(sizes[i] % 256, 0); // width
  e.writeUInt8(sizes[i] % 256, 1); // height
  e.writeUInt8(0, 2); // palette
  e.writeUInt8(0, 3); // reserved
  e.writeUInt16LE(1, 4); // color planes
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(img.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += img.length;
  entries.push(e);
});
writeFileSync("src/app/favicon.ico", Buffer.concat([header, ...entries, ...images]));

// Apple touch icon: iOS adds its own rounded corners, so render on a full-bleed background.
const appleSvg = Buffer.from(
  svg.toString().replace('rx="14"', 'rx="0"'),
);
await sharp(appleSvg, { density: 384 }).resize(180, 180).png().toFile("src/app/apple-icon.png");

console.log("Wrote src/app/favicon.ico (16/32/48) and src/app/apple-icon.png (180)");
