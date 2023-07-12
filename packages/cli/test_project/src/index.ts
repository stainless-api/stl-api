import { z, Stl } from "stainless";
import { ExternalInterface, TestEnumAdditional } from "./additional";
import { ExternalInterface as __symbol_ExternalInterface, InThisFile as __symbol_InThisFile } from "../stl-api-gen/src/index";
import { Test as __class_Test, EnumTest as __enum_EnumTest } from "../stl-api-gen/src/index";
import { TestEnumAdditional as __enum_TestEnumAdditional } from "../stl-api-gen/src/additional";
const stl = new Stl({
  plugins: {},
});


export enum EnumTest {
    A,
    B,
    C,
}
// stl.magic<EnumTest>(__enum_EnumTest);

export class X {}

// stl.magic<X>(__class_X);

stl.magic<ExternalInterface>(__symbol_ExternalInterface);

export class Test {}

stl.magic<Test>(__class_Test);

type BadType = {
  a: string,
  b: [...string[], number],
}

type Mapped = Partial<{a: string}>;

stl.magic<Partial<{a: string}>>(z.object({ a: z.string().optional() }));

type InThisFile = {
    id: string,
}

stl.magic<{nested: EnumTest, nested2: TestEnumAdditional}>(z.object({ nested: z.lazy(() => __enum_EnumTest), nested2: z.lazy(() => __enum_TestEnumAdditional) }));

stl.endpoint({
  endpoint: "get /users",
  response: stl.magic<InThisFile>(__symbol_InThisFile),
  handler: (request, ctx) => {
    throw new Error("dummy");
  },
});
