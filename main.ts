/* Leonida Trophy Guide — entry program (Node 22, standard library only).
 *
 * Hands the guide in: copies app/ and screenshots/ from this repository to
 * the output directory (MAKEFUN_OUTPUT_DIR, or /output in the grader) and
 * writes /output/dossier.json with buildDossier from the kit's library,
 * vendor/makefun-frontend.ts. The program runs twice and both runs must
 * write the same bytes, so the copy is deterministic: files in sorted
 * order, no timestamps in the output.
 */

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)));
const OUTPUT_DIR = resolve(process.env.MAKEFUN_OUTPUT_DIR || "/output");

const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

/** Copy a directory tree into the output directory, fresh each run. */
function copyTree(name) {
  const from = join(REPO_ROOT, name);
  const to = join(OUTPUT_DIR, name);
  if (!existsSync(from)) throw new Error("Missing " + name + "/ in the repository.");
  rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
}

/** Count every file under a directory, recursively, for the run summary. */
function countFiles(dir) {
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    total += entry.isDirectory() ? countFiles(path) : 1;
  }
  return total;
}

/** Hand the entry in: copy the guide and its screenshots, then write the dossier. */
function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  copyTree("app");
  copyTree("screenshots");
  const dossier = buildDossier(OUTPUT_DIR, CAPS);
  writeFileSync(join(OUTPUT_DIR, "dossier.json"), dossier);
  const appFiles = countFiles(join(OUTPUT_DIR, "app"));
  const shots = readdirSync(join(OUTPUT_DIR, "screenshots")).length;
  console.log(
    "Wrote dossier.json (" + dossier.length + " bytes): " +
    appFiles + " app files, " + shots + " screenshots, to " + OUTPUT_DIR,
  );
}

main();
