import * as path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const nextProc = spawn("pnpm", ["start"], {
  cwd: path.resolve(fileURLToPath(import.meta.url), "..", "..", "demo"),
  stdio: "inherit",
});
nextProc.on("close", (code, signal) => {
  console.error(
    `next server exited with ${
      code != null
        ? `code ${code}`
        : signal != null
        ? `signal ${signal}`
        : `neither code nor signal`
    }`
  );
  process.exit(1);
});

setTimeout(() => {
  const testProc = spawn("pnpm", ["test"], {
    stdio: "inherit",
  });
  testProc.on("close", (code, signal) => {
    if (code != null) process.exit(code);
    else process.exit(1);
  });
}, 2000);
