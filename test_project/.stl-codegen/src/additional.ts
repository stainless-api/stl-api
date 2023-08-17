import { z } from "stainless";
import * as additional from "../../src/additional";
export const TestEnumAdditional: z.ZodTypeAny = z.nativeEnum(
  additional.TestEnumAdditional
);
