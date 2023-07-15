import { multiFileTestCase } from "./multiFileTestCase";

import { AddrIface, Enum } from "./common";
import { t } from "stainless";
import pkgUp from "pkg-up";
import path from "path";

type T = {
  datetime: t.StringSchema<{ max: 20; datetime: true, regex: ["[A-Z]", "oops"] }>;
  addresses: AddrIface[];
  enum: Enum;
};

it(`generating in folder`, async () =>
  expect(
  await multiFileTestCase({
    __filename,
    genOptions: {
      genLocation: {
        type: "folder",
        genPath: "stl-api-gen"
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
  "stl-api-gen/src/__tests__/common.ts": "import { z } from "zod";
import { Enum as __enum_Enum } from "../../../src/__tests__/common";
export const AddressIface: z.ZodTypeAny = z.object({ street: z.string(), city: z.string(), state: z.string(), postalCode: z.string() });
export const Enum: z.ZodTypeAny = z.nativeEnum(__enum_Enum);
",
  "stl-api-gen/src/__tests__/generate-in-folder.test.ts": "import { z } from "zod";
import { AddressIface as __symbol_AddrIface, Enum as __enum_Enum } from "./common";
const T: z.ZodTypeAny = z.object({ datetime: z.string().max(20).datetime().regex(new RegExp("[A-Z]"), "oops"), addresses: z.array(z.lazy(() => __symbol_AddrIface)), enum: z.lazy(() => __enum_Enum) });
",
}
`

















));
