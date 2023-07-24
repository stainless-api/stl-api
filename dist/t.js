"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodSchema = exports.PageResponse = exports.Selection = exports.Selects = exports.Selectable = exports.SelectableSymbol = exports.Includes = exports.Includable = exports.IncludableSymbol = exports.SetSchema = exports.SetSchemaSymbol = exports.ArraySchema = exports.ArraySchemaSymbol = exports.ObjectSchema = exports.ObjectSchemaSymbol = exports.DateSchema = exports.DateSchemaSymbol = exports.BigIntSchema = exports.BigIntSchemaSymbol = exports.NumberSchema = exports.NumberSchemaSymbol = exports.StringSchema = exports.StringSchemaSymbol = exports.SuperRefine = exports.SuperRefineSymbol = exports.Refine = exports.RefineSymbol = exports.Transform = exports.TransformSymbol = exports.Effects = exports.EffectsSymbol = exports.Metadata = exports.EffectlessSchema = exports.EffectlessSchemaSymbol = exports.Schema = exports.SchemaSymbol = void 0;
exports.SchemaSymbol = Symbol("SchemaType");
class Schema {
}
exports.Schema = Schema;
exports.EffectlessSchemaSymbol = Symbol("EffectlessSchema");
class EffectlessSchema extends Schema {
}
exports.EffectlessSchema = EffectlessSchema;
class Metadata extends EffectlessSchema {
}
exports.Metadata = Metadata;
exports.EffectsSymbol = Symbol("Effects");
class Effects extends Schema {
}
exports.Effects = Effects;
exports.TransformSymbol = Symbol("Transform");
class Transform extends Effects {
}
exports.Transform = Transform;
exports.RefineSymbol = Symbol("Refine");
class Refine extends Effects {
}
exports.Refine = Refine;
exports.SuperRefineSymbol = Symbol("SuperRefine");
class SuperRefine extends Effects {
}
exports.SuperRefine = SuperRefine;
exports.StringSchemaSymbol = Symbol("StringSchema");
class StringSchema extends EffectlessSchema {
}
exports.StringSchema = StringSchema;
exports.NumberSchemaSymbol = Symbol("NumberSchema");
class NumberSchema extends EffectlessSchema {
}
exports.NumberSchema = NumberSchema;
exports.BigIntSchemaSymbol = Symbol("BigIntSchema");
class BigIntSchema extends EffectlessSchema {
}
exports.BigIntSchema = BigIntSchema;
exports.DateSchemaSymbol = Symbol("DateSchema");
class DateSchema extends EffectlessSchema {
}
exports.DateSchema = DateSchema;
exports.ObjectSchemaSymbol = Symbol("ObjectSchema");
class ObjectSchema extends EffectlessSchema {
}
exports.ObjectSchema = ObjectSchema;
exports.ArraySchemaSymbol = Symbol("ArraySchema");
class ArraySchema extends Schema {
}
exports.ArraySchema = ArraySchema;
exports.SetSchemaSymbol = Symbol("SetSchema");
class SetSchema extends Schema {
}
exports.SetSchema = SetSchema;
exports.IncludableSymbol = Symbol("Includable");
class Includable extends Effects {
}
exports.Includable = Includable;
class Includes extends EffectlessSchema {
}
exports.Includes = Includes;
exports.SelectableSymbol = Symbol("Selectable");
class Selectable extends Effects {
}
exports.Selectable = Selectable;
class Selects extends Effects {
}
exports.Selects = Selects;
class Selection extends EffectlessSchema {
}
exports.Selection = Selection;
const PageResponseSymbol = Symbol("PageResponse");
class PageResponse extends EffectlessSchema {
}
exports.PageResponse = PageResponse;
class ZodSchema extends Effects {
}
exports.ZodSchema = ZodSchema;
//# sourceMappingURL=t.js.map