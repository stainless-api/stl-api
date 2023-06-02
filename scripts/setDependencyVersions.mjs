#!/usr/bin/env node
import { execa } from "execa";
import fs from "fs/promises";
import path from "path";
import { rimraf } from "rimraf";
import { URL } from "url";
import _ from "lodash";
import { isMainModule } from "./isMainModule.mjs";

/**
 * This updates monorepo packages like "@stl-api/next": "workspace:*" to
 * "@stl-api/next": "github:stainless-api/stl-api#next-0.0.2". Once we're
 * ready to publish to npm, we can get rid of this and use `pnpm publish`
 * instead.
 */

const rootDir = path.dirname(path.dirname(new URL(import.meta.url).pathname));

if (isMainModule(import.meta)) await setDependencyVersions();

export async function setDependencyVersions() {
  const packagesDir = path.join(rootDir, "packages");

  const packageDirs = (await fs.readdir(packagesDir)).map((d) =>
    path.join(packagesDir, d)
  );

  const packageJsons = Object.fromEntries(
    await Promise.all(
      packageDirs.map(async (dir) => [
        dir,
        JSON.parse(await fs.readFile(path.join(dir, "package.json"), "utf8")),
      ])
    )
  );
  const packageJsonsByName = _.keyBy(Object.values(packageJsons), "name");

  const owner = "stainless-api";
  const repo = "stl-api";

  for (const [dir, packageJson] of Object.entries(packageJsons)) {
    const { dependencies } = packageJson;
    if (!dependencies) continue;
    let changed = false;
    for (const pkg in dependencies) {
      const depPackageJson = packageJsonsByName[pkg];
      if (depPackageJson) {
        dependencies[pkg] = `github:${owner}/${repo}#${pkg.replace(
          /^@stl-api\//,
          ""
        )}-${depPackageJson.version}`;
        changed = true;
      }
    }
    if (changed) {
      const file = path.join(dir, "package.json");
      await fs.writeFile(
        file,
        JSON.stringify(packageJson, null, 2) + "\n",
        "utf8"
      );
      console.error(`wrote ${file}`);
    }
  }
}
