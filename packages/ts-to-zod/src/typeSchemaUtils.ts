export const numberSchemaProperties = new Set([
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
]);

export const stringSchemaProperties = new Set([
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
]);

export const bigIntSchemaProperties = new Set([
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
]);

export const dateSchemaProperties = new Set(["min", "max"]);

export const objectSchemaProperties = new Set([
  "passthrough",
  "strict",
  "catchall",
]);

export const arraySetSchemaProperties = new Set([
  "nonempty",
  "min",
  "max",
  "length",
]);
