#!/usr/bin/env node

import { genApiRouteMap } from "../gen/genApiRouteMap.js";
import "ts-node/register/transpile-only";
import dedent from "dedent-js";

async function go() {
  const requires = [];
  const files = [];

  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg === "-r" || arg === "--require") {
      i++;
      if (i >= process.argv.length) {
        throw new Error(`missing module path for ${arg} option`);
      }
      requires.push(process.argv[i]);
    } else {
      files.push(process.argv[i]);
    }
  }

  if (!files.length) {
    // eslint-disable-next-line no-console
    console.error(dedent`
      Usage: gen-stl-api-route-map <api files>

      Options:
        -r, --require <path>      require the given path before loading api files
    `);
    process.exit(1);
  }

  for (const require of requires) {
    await import(require);
  }

  for (const file of files) {
    await genApiRouteMap(file);
  }
}
go();
