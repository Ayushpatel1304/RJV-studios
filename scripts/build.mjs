import { cp, mkdir, rm } from "node:fs/promises";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = join(root, "dist");

// Publish only website files, keeping tests, docs and local settings out of Vercel's output.
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const entry of ["index.html", "gallery.html", "assets", "images"]) {
  await cp(join(root, entry), join(output, entry), {
    recursive: true,
    filter: source => !basename(source).startsWith(".")
  });
}
console.log("Static website ready in dist/");
