import { multiFileTestCase } from "./multiFileTestCase";

import { AddrIface, Enum } from "./common";
import { StringSchema } from "../types";
import pkgUp from "pkg-up";
import path from "path";

type T = {
  datetime: StringSchema<{ max: 20; datetime: true }>;
  addresses: AddrIface[];
  enum: Enum;
};

it(`generating in node_modules`, async () =>
  expect(
  await multiFileTestCase({
    __filename,
    genOptions: {
      genLocation: {
        type: "node_modules",
        genPath: "zodgen/"
      },
      rootPath: await (async () => {
        const rootPackageJson = await pkgUp({
          cwd: __dirname
        });
        if (!rootPackageJson) {
          throw new Error("test must run within npm package");
        }
        return path.dirname(rootPackageJson);
      })()
    }
  })
).toMatchInlineSnapshot(`
{
  "node_modules/zodgen/src/__tests__/common.ts": "import { z } from "zod";
import { Enum as __enum_Enum } from "../../../../src/__tests__/common.ts";
export const AddressIface = z.object({ street: z.string(), city: z.string(), state: z.string(), postalCode: z.string() });
export const Enum = z.nativeEnum(__enum_Enum);
",
  "node_modules/zodgen/src/__tests__/generate-in-node-modules.test.ts": "import { z } from "zod";
import { AddressIface as AddrIface, Enum } from "./common.ts";
const T = z.object({ datetime: z.string().max(20).datetime(), addresses: z.array(z.lazy(() => AddrIface)), enum: z.lazy(() => Enum) });
",
}
`));
