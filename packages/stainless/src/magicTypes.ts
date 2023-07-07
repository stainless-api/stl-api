import { SchemaType, TypeSchema, input, output } from "ts-to-zod";
import {
  IncludableInput,
  IncludableOutput,
  SelectableInput,
  SelectableOutput,
} from "./z";
import { IncludablePaths } from "./includes";
import { SelectTree } from "./parseSelect";

export class Includable<T extends TypeSchema<any>> extends SchemaType<
  IncludableInput<input<T>>,
  IncludableOutput<output<T>>
> {}

type IncludesIO<T, Depth extends 0 | 1 | 2 | 3 | 4 | 5> = IncludablePaths<output<T>, Depth>[];

export class Includes<
  T extends TypeSchema<any>,
  Depth extends 0 | 1 | 2 | 3 | 4 | 5 = 3
> extends SchemaType<IncludesIO<T, Depth>, IncludesIO<T, Depth>> {}

export class Selectable<T extends TypeSchema<any>> extends SchemaType<
  SelectableInput<input<T>>,
  SelectableOutput<output<T>>
> {}

export class Selects<
  T extends TypeSchema<object>,
  Depth extends 0 | 1 | 2 | 3 | 4 | 5 = 3
> extends SchemaType<string, SelectTree | null | undefined> {}
