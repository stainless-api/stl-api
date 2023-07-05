import * as tm from "ts-morph";
import * as path from "path";

const root = path.resolve(__dirname, "..", "..");

export const testProject = new tm.Project({
  tsConfigFilePath: path.join(root, "tsconfig.json"),
});
