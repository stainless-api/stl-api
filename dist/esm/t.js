export const SchemaSymbol = Symbol("SchemaType");
export class Schema {
}
export const EffectlessSchemaSymbol = Symbol("EffectlessSchema");
export class EffectlessSchema extends Schema {
}
export class Metadata extends EffectlessSchema {
}
export const EffectsSymbol = Symbol("Effects");
export class Effects extends Schema {
}
export const TransformSymbol = Symbol("Transform");
export class Transform extends Effects {
}
export const RefineSymbol = Symbol("Refine");
export class Refine extends Effects {
}
export const SuperRefineSymbol = Symbol("SuperRefine");
export class SuperRefine extends Effects {
}
export const StringSchemaSymbol = Symbol("StringSchema");
export class StringSchema extends EffectlessSchema {
}
export const NumberSchemaSymbol = Symbol("NumberSchema");
export class NumberSchema extends EffectlessSchema {
}
export const BigIntSchemaSymbol = Symbol("BigIntSchema");
export class BigIntSchema extends EffectlessSchema {
}
export const DateSchemaSymbol = Symbol("DateSchema");
export class DateSchema extends EffectlessSchema {
}
export const ObjectSchemaSymbol = Symbol("ObjectSchema");
export class ObjectSchema extends EffectlessSchema {
}
export const ArraySchemaSymbol = Symbol("ArraySchema");
export class ArraySchema extends Schema {
}
export const SetSchemaSymbol = Symbol("SetSchema");
export class SetSchema extends Schema {
}
export const IncludableSymbol = Symbol("Includable");
export class Includable extends Effects {
}
export class Includes extends EffectlessSchema {
}
export const SelectableSymbol = Symbol("Selectable");
export class Selectable extends Effects {
}
export class Selects extends Effects {
}
export class Selection extends EffectlessSchema {
}
const PageResponseSymbol = Symbol("PageResponse");
export class PageResponse extends EffectlessSchema {
}
export class ZodSchema extends Effects {
}
//# sourceMappingURL=t.js.map