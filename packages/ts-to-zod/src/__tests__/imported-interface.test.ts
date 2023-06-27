import { AddressIface } from "./common";
import { multiFileTestCase } from "./multiFileTestCase";

export class TestClass {
  a: string = "hello";

  method(): void {
    console.log("lmaoo")
  }
  
  constructor() {}
}

interface T {
  firstName: string;
  lastName: string;
  address?: AddressIface;
  testMyClass: TestClass;
}

it(`imported interface`, async () =>
  expect(
  await multiFileTestCase({
    __filename
  })
).toMatchInlineSnapshot(`
{
  "src/__tests__/common.codegen.ts": "import { z } from "zod";
export const AddressIface = z.object({ street: z.string(), city: z.string(), state: z.string(), postalCode: z.string() });
",
  "src/__tests__/imported-interface.test.codegen.ts": "import { z } from "zod";
import { AddressIface as __symbol_AddressIface } from "./common.codegen";
import { TestClass as __class_TestClass } from "./imported-interface.test";
const T = z.object({ firstName: z.string(), lastName: z.string(), address: z.lazy(() => __symbol_AddressIface).optional(), testMyClass: z.instanceof(__class_TestClass) });
",
}
`));
