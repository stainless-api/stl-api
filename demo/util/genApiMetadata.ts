import { genApiMetadata } from "stainless/genApiMetadata";
import path from "path";

async function go() {
  await genApiMetadata(path.resolve(path.dirname(__filename), "../api/api.ts"));
}

go();
