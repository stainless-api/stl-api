---
sidebar_position: 1
---

# Generating Zod schemas from types

We provide two ways of converting schemas to types. The first is `stl.types<>().endpoint()`,
which converts its type parameters to Zod schemas. The second is `stl.codegenSchema<>()`, which our
CLI modifies to inject the Zod schema corresponding to the given type argument. The function
evaluates to this schema value.

[`stl`](/stl/cli) utilizes the Typescript compiler's type-checking API to enable powerful type analysis.
As a result, complex types like discriminated unions are supported.
This is utilized to generate idiomatic Zod schemas, using features
such as `z.enum()` or `z.discriminatedUnion()` for optimal
error-checking and reporting.

:::note
Whenever input types to `stl.types` or `stl.codegenSchema` change, the CLI needs
to be rerun. The CLI provides a watch mode to automate this process.
Schema definitions are generated in a user-configurable folder. By
default, this is in `.stl-codegen`.
:::

## Setup

In order to use `stl.types.endpoint`, you need to add generated
schema generation to your instance of the `Stl` class:

```ts
import { Stl } from "stainless";
import { typeSchemas } from "../.stl-codegen";

export const stl = new Stl({
  plugins: {...},
  typeSchemas,
});
```

## Stainless extensions

Ordinary Typescript types can be extended with types provided by the `stainless` package to add
additional validation and transformation rules. These come in two forms: types that offer access to
Zod's extensive built-in primitive validation rules, and types that enable implementing custom
validation and transform rules.

These types are found within the `t` export from the `stainless` package.

## Built-in validation rules

`stainless` provides the `*Schema` family of types for specifying primitive Zod validation rules
like `z.number().max(5)`. In their most basic form, these types take one type parameter. Fields on
this type define Zod validation rules to apply to the type.

If the validation rule takes no parameters,
like `z.string().nonempty()`, it can be specified either as `StringSchema<{nonempty: true}>` or
`StringSchema<{nonempty: "error message"}>`. Passing a string will set it as a custom error message
if validation of the rule fails.

Otherwise, if the validation rule takes a parameter, like `z.number().max(5)`, its corresponding
type property takes either that parameter value or a tuple of that value and a custom error message.
`NumberSchema<{max: 5}>` and `NumberSchema<{max: [5, "max value is 5"]}>` generate `z.number().max(5)`
and `z.number().max(5, "max value is 5")`, respectively.

In total, `stainless` offers the `StringSchema`, `NumberSchema`, `BigIntSchema`, `DateSchema`,
`ObjectSchema`, `ArraySchema`, and `SetSchema` types. Each one of
these takes properties corresponding to [Zod primitive validation rules](https://zod.dev/). However, some
of these types and properties deviate from the patterns shown above.
These are documented below.

### `t.StringSchema<Props>`

#### [`datetime`](https://zod.dev/?id=iso-datetimes)

The `datetime` property takes either `true` to enable the default
validation rules, a `string` to add a custom error message, or
an object with the optional `precision`, `offset`, and `message`
properties. `message` is the error message used on validation failure.

#### [`ip`](https://zod.dev/?id=iso-datetimes)

The `ip` property takes either `true` to enable the default
validation rules, a `string` to add a custom error message, or
an object with the optional `version` and `message`
properties. `message` is the error message used on validation failure.

#### `regex`

The `regex` property allows a string to be validated against a regular expression. Unlike the Zod `.regex()` property, this accepts a string
that is passed to the `RegExp` constructor at runtime.

### `t.DateSchema<Props>`

#### [`min`, `max`](https://zod.dev/?id=dates)

`min` and `max` take string values, which are passed through the
`Date` constructor at runtime to yield the minimum and maximum `Date`
values.

### `t.ObjectSchema<T, Props>`

`ObjectSchema` takes an additional type parameter `T` of object type
that is used as the base type for schema generation. For example,
`ObjectSchema<{id: string}, {strict: true}>` yields the schema
`z.object({id: z.string()}).strict()`.

#### `catchall`

The `catchall` property takes an arbitrary type as a parameter. This
type is used to generate a schema to validate the values of properties not
explicitly a part of `T`.

Note that Typescript index types are also supported
natively, but they serve a slightly different role.

#### `passthrough`, `strict`

These properties are offered with usual Zod semantics. Other object schema modifiers are not provided,
but modifiers like `merge`, `partial`, and `required` have Typescript
analogs like `Partial` and `Required` that should be used instead.

### `t.ArraySchema<T, Props>, SetSchema<T, Props>`

These two types take an additional type parameter `T` that defines
the schema type of their elements. For example, `ArraySchema<number, {nonempty: true}>`
yields the schema `z.array(z.number()).nonempty()`.

## Custom validation and transform rules

When using Typescript types to generate Zod schemas, it's possible to subclass the `Refine`, `SuperRefine`, and `Transform` classes to add custom
validation and parsing rules.

Subclassing these types always requires declaring an input type via `declare input: I`, which is the type of
the input schema at the start of parsing. `I` is not necessarily the
type of the input received by the class: for example, it might be that
of a `Transform` subclass. In order to support this more flexible usage, have `I` extend `t.SchemaInput<T>`, where `T` is the schema type you
want your refine or transform utility to accept as input.

Note that when using subclasses of these types within schema types,
the subclasses need to be exported from their modules.

### `t.Refine`

In order to implement a custom validation, or refinement, rule,
create a class that extends the `Refine` class.

#### Simple validation

Let's say we want to validate that an array matches the Typescript type
`[...string[], number]`. This functionality is not available in Zod out
of the box, so we can use the `Refine` class to implement this:

```ts
export class RefineTuple<I extends t.SchemaInput<any[]>> extends t.Refine {
  declare input: I;

  refine(value: any[]): boolean {
    for (let i = 0; i < value.length - 1; i++) {
      if (typeof value[i] !== "string") return false;
    }
    return typeof value.at(-1) === "number";
  }
}
```

`declare input: I` declares that the subclass of `t.Refine` refines values of type `I`.

Note that `refine` can be async and/or return a promise.

#### Adding a custom message

Defining the `message` property on an implementor class allows
defining a custom error message. This can either be an error string,
a Zod `CustomErrorParams` object, or a function that receives the
schema input and returns an instance of `CustomErrorParams`.
See the next section for an example.

#### Type refinement

We can expand the example above to reflect the gained type information
at the type level using the `is RO` syntax, which allows
an implementing class of `Refine` to declare that if validation succeeds, the value being refined is of type `RO`.
We'll also supply a custom error message.
We can use it as such:

```ts
export class RefineTuple<I extends t.SchemaInput<any[]>> extends t.Refine {
  declare input: I;

  message = "expected a tuple of type [...string[], number]";
  refine(value: any[]): value is [...string[], number] {
    // ...
  }
}
```

### `t.SuperRefine`

Allows generating custom error messages on validation failure.
Functions similarly to the Zod [`.superRefine`](https://zod.dev/?id=superrefine) method, where the `superRefine` method accepts a value for refinement and a context as input. Adding an issue on the context
causes validation to fail; otherwise it succeeds.

### `t.Transform`

Allows transforming an input value to an output value of
potentially different type, while optionally validating it with the context parameter
similarly to `superRefine`. As an example, take this transform
implementation that converts any value to a string via coercion:

```ts
class ToString<I extends t.SchemaInput<any>> extends t.Transform {
  declare input: I;

  transform(value: any): string {
    return String(value);
  }
}
```

`transform` can be async and/or return a promise.

## Stainless Zod extension types

### `PrismaModel`

:::info
This is only available if using the [`@stl-api/prisma`](/stl/prisma/getting-started) plugin.
:::

Allows you to declare the Prisma model associated with a response schema. In an endpoint whose
response schema has a Prisma model declared, [special conveniences](/stl/prisma/getting-started#perform-crud-operations-on-response-prismamodel) will be available.

```ts
import prisma from "~/libs/prismadb";
import { PrismaModel } from "@stl-api/PrismaModel";

export class User extends PrismaModel {
  declare input: {
    id: string;
    name?: string;
    // ...
  };

  model = prisma.user;
}
```

`input` specifies the response schema. `model` is the Prisma model to associate with the schema.

Note that subclasses of `PrismaModel` must be exported from their modules in order to be used within schemas.

### `Includable<T>`

Marks an object property as being [includable](/stl/inclusion) via an `include` query parameter.
This is only useful when applied on an object or array of object types.

### `Selectable<T>`

Marks an object property as being [selectable](/stl/selection) via a `select` query parameter.
This is only useful when applied on an object or array of object types.

### `Selection<T>`

Use this to declare the schema for a `Selectable<>` field value:

```ts
user_fields: Selectable<Selection<User>>;
```

### `PageResponse<I>`

Represents a page response with the given item type `I`.

## Example

```ts
interface UserBase {
  id: StringSchema<{ uuid: true }>;
  name?: string;
}

interface IncludableUser extends UserBase {
  posts: Includable<Post[]>;
}

interface PostBase {
  id: StringSchema<{ uuid: true }>;
  body: string;
}

interface IncludablePost extends PostBase {
  user?: Includable<User>;
}

// the `stl` CLI will generate a schema for `IncludablePost`
// into the `typeSchemas` object passed to `stl`'s constructor
// call
stl.types<{ response: IncludablePost }>().endpoint({
  endpoint: "GET /api/post/{id}",
  // ...
});
```

## Mixing codegen schemas with classic Zod schemas

We recommend using codegen schemas for combining the best of both
worlds: offering the ability to use rich Typescript types while
automatically generating idiomatic Zod schema validators and transformers.

However, you may want to use classic Zod schemas in some places,
whether due to migrating existing schemas or due to advanced Zod usage we
do not currently support. For this, we offer the `ZodSchema` class to inject
classic Zod schemas into generated schemas. `ZodSchema` takes a Zod schema
by passing its type via `typeof schema`. This `typeof` clause must be inline.

```ts
const schema = z.object({a: z.string(), b: z.string()});

type TypedSchema = {
  zodSchema: ZodSchema<{model: typeof schema}>,
  ...
}
```

If you want to use generated schemas within existing Zod schemas, the
`stl.codegenSchema` function yields a Zod schema value for an input type.

```ts
type User = {
  name: string;
  email: string;
  ...
};

const ZodSchema = stl.codegenSchema<User>(/* schema value injected by CLI */);
```

`stl.codegenSchema` will, as necessary, generate imports in the file it's called
in order to import generated schema constants from the configured codegen folder.
These constants always end in `Schema`. You should not modify the
contents of these imports: they will be generated on CLI run. However,
you can freely move their position within the same file.
