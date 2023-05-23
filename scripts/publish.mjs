#!/usr/bin/env node
import { execa } from "execa";

const outputs = JSON.parse(process.argv[2]);
const dryRun = process.argv.includes("--dry-run");

if (dryRun) {
  console.log("outputs", outputs);
}

for (let key in outputs) {
  let value = outputs[key];
  const workspace = key.match(/^(.*\/.*)--release_created$/)?.[1];
  if (dryRun) console.log({ key, value, workspace });
  if (!workspace || !value) continue;
  await execa(
    "pnpm",
    [
      "publish",
      workspace,
      "--access",
      "public",
      ...(dryRun ? ["--dry-run"] : []),
    ],
    {
      stdio: "inherit",
    }
  );
}
