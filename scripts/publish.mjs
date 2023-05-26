#!/usr/bin/env node
import { execa } from "execa";
import { setDependencyVersions } from "./setDependencyVersions.mjs";
import { gitPublish } from "./gitPublish.mjs";
import * as url from "node:url";
import path from "path";
import fs from "fs/promises";

await setDependencyVersions();

const rootDir = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));

const packagesDir = path.join(rootDir, "packages");
const packageDirs = (await fs.readdir(packagesDir)).map((dir) =>
  path.join(packagesDir, dir)
);

const dryRun = process.argv.includes("--dry-run");

for (const dir of packageDirs) {
  await gitPublish(dir, { dryRun });
}
