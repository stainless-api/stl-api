---
sidebar_position: 1
---

# Generating Zod schemas from types

We provide two ways of converting schemas to types. The first is `stl.types<>().endpoint()`,
which converts its type parameters to Zod schemas. The second is `stl.magic<>()`, which the 
CLI modifies to inject the Zod schema corresponding to the given type argument. The function
evaluates to this schema value.

[`stl`](/stl/cli) utilizes the Typescript compiler's type-checking API to enable powerful type analysis.
As a result, complex types are usually supported, including index, mapped, conditional, intersection, union, and aliased types.
This is utilized to generate idiomatic Zod schemas, using features
such as `z.enum()` or `z.discriminatedUnion()` for optimal 
error-checking and reporting.

:::note
Whenever input types to `stl.types` or `stl.magic` change, the CLI needs
to be rerun. The CLI provides a watch mode to automate this process.
Schema definitions are generated in the `@stl-api/gen` folder in 
`node_modules`.
:::

Ordinary Typescript types can be extended with types provided by the `stainless` package to add 
additional validation and transformation rules. These come in two forms: types that offer access to 
Zod's extensive built-in primitive validation rules, and types that enable implementing custom 
validation and transform rules.

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
these takes properties corresponding [Zod primitive validation rules](https://zod.dev/). However, some
of these types and properties deviate from the patterns shown above.
These are documented below. 

### `StringSchema<Props>`

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

The `regex` property allows a string to be tested against a regular expression. Unlike the Zod `.regex()` property, this accepts a string 
that is passed to the `RegExp` constructor at runtime.

### `DateSchema<Props>`

#### [`min`, `max`](https://zod.dev/?id=dates)

`min` and `max` take string values, which are passed through the 
`Date` constructor at runtime to yield the minimum and maximum `Date`
values.

### `ObjectSchema<T, Props>`

`ObjectSchema` takes an additional type parameter `T` of object type 
that is used as the base type for schema generation. For example,
`ObjectSchema<{id: string}, {strict: true}>` yields the schema 
`z.object({id: z.string()}).strict()`.

#### `catchall`

The `catchall` property takes an arbitrary type as a parameter. This 
type is used to generate a schema to validate any properties not 
explicitly a part of `T`. 

Note that index types are also supported 
natively, but they serve a slightly different role. 

#### `passthrough`, `strict`

These properties are offered with usual Zod semantics. Other object properties are not provided, 
but properties like `merge`, `partial`, and `required` have Typescript
analogs like `Partial` and `Required` that should be used instead. 

### `ArraySchema<T, Props>, SetSchema<T, Props>`

These two types take an additional type parameter `T` that defines
the schema type of their elements.  

## Custom validation and transform rules

When using Typescript types to generate Zod schemas, it's possible to use the `Refine`, `SuperRefine`, and `Transform` classes to add custom
validation and parsing rules.

These types always take in an `I` type parameter, which is the type of
the input schema at the start of parsing. `I` is not necessarily the 
type of the input received by the class: for example, it might be that
of a `Transform` instance. In order to support this more flexible usage, have `I` extend `TypeSchema<T>`, where `T` is the type you 
want to accept as input. 

### `Refine<I, RO>`

In order to implement a custom validation, or refinement, rule, 
create a class that extends the `Refine<I, RO>` class.

#### Simple validation

Let's say we want to validate that an array matches the Typescript type
`[...string[], number]`. This functionality is not available in Zod out
of the box, so we can use the `Refine` class to implement this:

```ts
class RefineTuple<I extends TypeSchema<any[]>> extends Refine<I> {
  refine(value: output<I>): boolean {
    for (let i = 0; i < value.length - 1; i++) {
      if (typeof value[i] !== "string") return false;
    }
    return typeof value[value.length - 1] === "number";
  }
}
``` 

Note that `refine` can be async and/or return a promise.

#### Adding a custom message

Defining the `message` property on an implementor class allows 
defining a custom error message. This can either be an error string,
a Zod `CustomErrorParams` object, or a function that receives the 
schema input and returns an instance of `CustomErrorParams`.


#### Type refinement 

We can expand the example above to reflect the gained type information
at the type level using the optional `RO` type parameter, which allows
an implementing class of `Refine` to declare that if validation succeeds, the type of the value being refined is of type `RO`. 
We'll also supply a custom error message.
We can use it as such: 

```ts
class RefineTuple<I extends TypeSchema<any[]>> extends Refine<I, [...string[], number]> {
  message = "expected a tuple of type [...string[], number]";
  refine(value: output<I>): value is [...string[], number] {
    // ...
  }
}
``` 

### SuperRefine<I, RO>

Allows generating custom error messages on validation failure.
Functions similarly to the Zod [`.superRefine`](https://zod.dev/?id=superrefine) method, where the `superRefine` method accepts `output<I>` and a context as input. Adding an issue on the context
causes validation to fail; otherwise it succeeds.


### Transform<I, O>

Allows transforming an input value to an output value of 
type `O`, while optionally validating it with the context parameter
similarly to `superRefine`. As an example, take this transform 
implementation that converts any value to a string via coercion:

```ts
class ToString<I extends TypeSchema<any>> extends Transform<I, string> {
  transform(value: output<I>): string {
    return String(value);
  }
}
```

`transform` can be async and/or return a promise.

## Stainless Zod extension types

:::caution 

Custom Stainless Zod functionality is not yet available when using 
type-to-schema conversion. We aim to close this gap soon. 

:::
