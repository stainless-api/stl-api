#!/usr/bin/env node
import { execa } from "execa";
import fs from "fs/promises";
import path from "path";
import { rimraf } from "rimraf";
import { URL } from "url";
import { isMainModule } from "./isMainModule.mjs";
import { once } from "lodash";

/**
 * Publishes a subpackages in packages/ to a branch in the git repo.
 */

if (isMainModule(import.meta)) {
  function booleanArg(name) {
    const index = process.argv.indexOf(name);
    if (index > 0) {
      process.argv.splice(index, 1);
      return true;
    }
    return false;
  }

  const dryRun = booleanArg("--dry-run");

  const packageDir = path.resolve(process.argv[2] || process.cwd());
  await gitPublish(packageDir, { dryRun });
}

const setupGitIdentity = once(async () => {
  if (process.env.CI) {
    await execa(
      "git",
      ["config", "--global", "user.email", "dev@stainlessapi.com"],
      {
        stdio: "inherit",
      }
    );
    await execa("git", ["config", "--global", "user.name", "Stainless Bot"], {
      stdio: "inherit",
    });
  }
});

const rootDir = path.dirname(path.dirname(new URL(import.meta.url).pathname));

export async function gitPublish(packageDir, options) {
  const dryRun = options?.dryRun;
  process.chdir(packageDir);

  const packageJson = JSON.parse(await fs.readFile("package.json", "utf8"));

  if (packageJson.private) {
    throw new Error(
      `package ${packageJson.name} marked private, refusing to publish`
    );
  }

  const pack = execa("npm", ["pack"], { stdio: "pipe", encoding: "utf8" });
  pack.stderr.pipe(process.stderr);
  pack.stdout.pipe(process.stdout);
  const tarball = (await pack).stdout.trim();
  const branch = tarball.replace(/^stl-api-/, "").replace(/\.tgz$/, "");

  await rimraf("package");
  await execa("tar", ["xzf", tarball], { stdio: "inherit" });

  process.chdir(path.join(packageDir, "package"));

  await execa("git", ["init"], { stdio: "inherit" });
  const origin = (
    await execa("git", ["remote", "get-url", "origin"], {
      cwd: rootDir,
      stdio: "pipe",
      encoding: "utf8",
    })
  ).stdout.trim();
  await execa("git", ["remote", "add", "origin", origin], { stdio: "inherit" });
  await execa("git", ["checkout", "--orphan", branch], { stdio: "inherit" });
  await execa("git", ["add", "."], { stdio: "inherit" });
  await setupGitIdentity();
  await execa("git", ["commit", "-m", `chore: release ${tarball} [ci skip]`], {
    stdio: "inherit",
  });

  if (dryRun) {
    console.error(
      `dry run; would git push --set-upstream ${origin} ${branch} -f`
    );
  } else {
    await execa("git", ["push", "--set-upstream", origin, branch, "-f"], {
      stdio: "inherit",
    });
  }
}
