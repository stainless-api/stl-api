import { AddressIface } from "./common";
import { multiFileTestCase } from "./multiFileTestCase";

export class TestClass {
  a: string = "hello";

  method(): void {
    console.log("lmaoo");
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
      __filename,
    })
  ).toMatchInlineSnapshot(`
{
  "src/__tests__/common.codegen.ts": "import { z } from "zod";
export const AddressIface: z.ZodTypeAny = z.object({ street: z.string(), city: z.string(), state: z.string(), postalCode: z.string() });
",
  "src/__tests__/imported-interface.test.codegen.ts": "import { z } from "zod";
import * as imported_interface_test from "./imported-interface.test";
import * as common from "./common";
export const TestClass: z.ZodTypeAny = z.instanceof(imported_interface_test.TestClass);
const T: z.ZodTypeAny = z.object({ firstName: z.string(), lastName: z.string(), address: z.lazy(() => common.AddressIface).optional(), testMyClass: z.lazy(() => TestClassSchema) });
",
}
`));
