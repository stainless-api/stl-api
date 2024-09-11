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
import * as ImportedInterfaceTest from "./imported-interface.test";
import * as Common from "./common";
export const TestClass: z.ZodTypeAny = z.instanceof(ImportedInterfaceTest.TestClass);
const T: z.ZodTypeAny = z.object({ firstName: z.string(), lastName: z.string(), address: z.lazy(() => Common.AddressIface).optional(), testMyClass: z.lazy(() => TestClassSchema) });
",
}
`));
