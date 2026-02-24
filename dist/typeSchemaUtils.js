"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arraySetSchemaProperties = exports.objectSchemaProperties = exports.dateSchemaProperties = exports.bigIntSchemaProperties = exports.stringSchemaProperties = exports.numberSchemaProperties = void 0;
exports.numberSchemaProperties = new Set([
    "gt",
    "gte",
    "min",
    "lt",
    "lte",
    "max",
    "multipleOf",
    "step",
    "int",
    "positive",
    "nonnegative",
    "negative",
    "nonpositive",
    "finite",
    "safe",
    "default",
]);
exports.stringSchemaProperties = new Set([
    "max",
    "min",
    "length",
    "email",
    "url",
    "emoji",
    "uuid",
    "cuid",
    "cuid2",
    "ulid",
    "regex",
    "startsWith",
    "endsWith",
    "datetime",
    "ip",
    "trim",
    "toLowerCase",
    "toUpperCase",
    "default",
]);
exports.bigIntSchemaProperties = new Set([
    "gt",
    "gte",
    "min",
    "lt",
    "lte",
    "max",
    "multipleOf",
    "positive",
    "nonnegative",
    "negative",
    "nonpositive",
    "default",
]);
exports.dateSchemaProperties = new Set(["min", "max"]);
exports.objectSchemaProperties = new Set([
    "passthrough",
    "strict",
    "catchall",
]);
exports.arraySetSchemaProperties = new Set([
    "nonempty",
    "min",
    "max",
    "length",
]);
//# sourceMappingURL=typeSchemaUtils.js.map