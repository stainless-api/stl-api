---
sidebar_position: 9
---

# Stainless CLI

## Installation

`stainless` is paired with a CLI in order to generate metadata and schema used to
implement `stl.types`, `stl.codegenSchema`, and the Typescript client. To get started, install the CLI:

```bash
npm i --save 'stainless-api/stl-api#cli-0.0.2'
```

## Usage

Once installed, you can run the client by executing `stl` within a `stainless` project.

The CLI operates on npm packages, and operates relative to the current
directory's or first parent directory's `package.json`. The directory
with `package.json` must also have a `tsconfig.json`.

:::note

For correct schema generation, Typescript's `strict` mode must be
enabled.

:::

The CLI looks for invocations of the `types` and `codegenSchema` methods on the `Stl` class. For this to work
correctly, these methods must be called inline for every usage; they cannot be wrapped
in other functions or renamed.

## Generation

The CLI generates files in the `@stl-api/cli` folder within `node_modules`.
Generation should be rerun every time an input type to `stl.types`,
`stl.codegenSchema`, or any type those types depend on, change. The watch flag
automates this process.

## Flags

### `-w, --watch`

Enables watch mode. Listens for file changes, and regenerates metadata and schema
data as appropriate.

### `-d, --directory <path>`

Specifies an explicit project directory to run codegen for instead of using the
current working directory.

### `-o, --outdir <path>`

Specifies the output directory of generated schema files.
