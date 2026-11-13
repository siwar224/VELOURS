// Counts the frames in public/frames/<set> and writes src/data/frames.json.
// Runs automatically before `dev` and `build` so the frame count is never hard-coded.
// A future portrait set (public/frames/mobile) is picked up here when it exists.
import { readdirSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const framesDir = join(root, "public", "frames");
const outFile = join(root, "src", "data", "frames.json");
const PAD = 4;
const FRAME_RE = /^f_(\d+)\.webp$/;

function describeSet(name) {
  const dir = join(framesDir, name);
  if (!existsSync(dir)) return null;

  const numbers = readdirSync(dir)
    .map((file) => FRAME_RE.exec(file))
    .filter(Boolean)
    .map((match) => Number(match[1]))
    .sort((a, b) => a - b);

  if (numbers.length === 0) return null;

  // The renderer assumes f_0001 … f_N with no gaps; fail loudly if that is not true.
  numbers.forEach((n, i) => {
    if (n !== i + 1) {
      throw new Error(`[gen-manifest] ${name}: expected f_${String(i + 1).padStart(PAD, "0")}.webp, found f_${String(n).padStart(PAD, "0")}.webp`);
    }
  });

  return { count: numbers.length, pattern: `/frames/${name}/f_{n}.webp`, pad: PAD };
}

const desktop = describeSet("desktop");
if (!desktop) {
  throw new Error("[gen-manifest] No frames found in public/frames/desktop");
}
const mobile = describeSet("mobile");

const manifest = { ...desktop, ...(mobile ? { mobile } : {}) };

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify(manifest, null, 2) + "\n");
console.log(`[gen-manifest] desktop: ${desktop.count} frames${mobile ? `, mobile: ${mobile.count} frames` : ""}`);
