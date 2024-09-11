import { z, Stl } from "stainless";
import { TestEnumAdditional } from "./additional";
const stl = new Stl({
  plugins: {},
});
import { EnumTest as EnumTestSchema } from "../.stl-codegen/src/index";
import { TestEnumAdditional as TestEnumAdditionalSchema } from "../.stl-codegen/src/additional";

export enum EnumTest {
  A,
  B,
  C,
}

export class X {}

// stl.codegenSchema<X>(__class_X);

// stl.codegenSchema<ExternalInterface>(__symbol_ExternalInterface);

export class Test {}

// stl.codegenSchema<Test>(__class_Test);

type BadType = {
  a: string;
  b: [...string[], number];
};

type Mapped = Partial<{ a: string }>;

// stl.codegenSchema<Partial<{a: string}>>(z.object({ a: z.string().optional() }));

type InThisFile = {
  id: string;
};

stl.codegenSchema<{ nested: EnumTest; nested2: TestEnumAdditional }>(
  z.object({
    nested: z.lazy(() => EnumTestSchema),
    nested2: z.lazy(() => TestEnumAdditionalSchema),
  }),
);

// stl.endpoint({
//   endpoint: "GET /users",
//   response: stl.codegenSchema<InThisFile>(__symbol_InThisFile),
//   handler: (request, ctx) => {
//     throw new Error("dummy");
//   },
// });
