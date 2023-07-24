import { z, Stl } from "stainless";
import { TestEnumAdditional } from "./additional";
const stl = new Stl({
  plugins: {},
});

export enum EnumTest {
  A,
  B,
  C,
}
import { EnumTest as EnumTestSchema } from "../.stl-codegen/src/index";
import { TestEnumAdditional as TestEnumAdditionalSchema } from "../.stl-codegen/src/additional";

export class X {}

// stl.magic<X>(__class_X);

// stl.magic<ExternalInterface>(__symbol_ExternalInterface);

export class Test {}

// stl.magic<Test>(__class_Test);

type BadType = {
  a: string;
  b: [...string[], number];
};

type Mapped = Partial<{ a: string }>;

// stl.magic<Partial<{a: string}>>(z.object({ a: z.string().optional() }));

type InThisFile = {
  id: string;
};

stl.magic<{ nested: EnumTest; nested2: TestEnumAdditional }>(
  z.object({
    nested: z.lazy(() => EnumTestSchema),
    nested2: z.lazy(() => TestEnumAdditionalSchema),
  })
);

// stl.endpoint({
//   endpoint: "get /users",
//   response: stl.magic<InThisFile>(__symbol_InThisFile),
//   handler: (request, ctx) => {
//     throw new Error("dummy");
//   },
// });
