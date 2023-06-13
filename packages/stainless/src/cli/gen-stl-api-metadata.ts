#!/usr/bin/env node

import { genApiMetadata } from "../gen/genApiMetadata";
import "ts-node/register/transpile-only";

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

  for (const require of requires) {
    await import(require);
  }

  for (const file of files) {
    await genApiMetadata(file);
  }
}
go();
