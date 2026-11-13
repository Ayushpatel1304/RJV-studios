import { cp, mkdir, readFile, readdir, rm, writeFile, access } from "node:fs/promises";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import sharp from "sharp";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = join(root, "dist");
const imageCache = join(root, "node_modules/.cache/rjv-media");
const manifest = {};
const widths = [480, 960, 1920];
sharp.concurrency(2);

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const path = join(directory, entry.name);
    files.push(...(entry.isDirectory() ? await filesIn(path) : [path]));
  }
  return files;
}
const webPath = path => path.split(sep).join("/");

// Preserve uploaded originals; only public site files are published.
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const entry of ["index.html", "gallery.html", "assets", "images"]) {
  await cp(join(root, entry), join(output, entry), {
    recursive: true,
    filter: source => !basename(source).startsWith(".")
  });
}
await mkdir(imageCache, { recursive: true });
await mkdir(join(output, "assets/media"), { recursive: true });

for (const source of await filesIn(join(root, "images"))) {
  if (!/\.(jpe?g|png|webp)$/i.test(source)) continue;
  const info = await sharp(source).metadata();
  const rotated = [5, 6, 7, 8].includes(info.orientation);
  const width = rotated ? info.height : info.width;
  const height = rotated ? info.width : info.height;
  const hash = createHash("sha256")
    .update("webp-q82-rotate-v1")
    .update(await readFile(source))
    .digest("hex").slice(0, 16);
  const variants = [];
  for (const size of new Set(widths.map(value => Math.min(value, width)))) {
    const filename = `${hash}-${size}.webp`;
    const cached = join(imageCache, filename);
    try {
      await access(cached);
    } catch {
      await sharp(source).rotate().resize({ width: size, withoutEnlargement: true })
        .webp({ quality: 82 }).toFile(cached);
    }
    const dimensions = await sharp(cached).metadata();
    const src = `assets/media/${filename}`;
    await cp(cached, join(output, src));
    variants.push({ src, width: dimensions.width, height: dimensions.height });
  }
  manifest[webPath(relative(root, source))] = { width, height, variants };
}

// Covers use the same compact assets as gallery previews.
for (const source of await filesIn(join(root, "assets/css"))) {
  if (!source.endsWith(".css")) continue;
  const destination = join(output, relative(root, source));
  const css = (await readFile(source, "utf8")).replace(/url\(["']?([^"')]+)["']?\)/g, (match, url) => {
    const image = manifest[webPath(relative(root, resolve(dirname(source), url)))];
    if (!image) return match;
    const variant = image.variants.find(item => item.width >= 960) || image.variants.at(-1);
    const path = webPath(relative(dirname(destination), join(output, variant.src)));
    return `url("${path}")`;
  });
  await writeFile(destination, css);
}
await writeFile(join(output, "assets/js/media-manifest.js"), `window.RJV_MEDIA = ${JSON.stringify(manifest)};\n`);
console.log(`Static website ready in dist/ with responsive previews for ${Object.keys(manifest).length} images.`);
