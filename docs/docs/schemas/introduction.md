---
sidebar_position: 0
---

# Introduction

We use a customized version of [Zod](https://zod.dev/) for declaring request and response
schemas. We provide two ways of doing this. The first is to use our [CLI](/stl/cli) for [generating Zod schemas automatically from Typescript types](/stl/schemas/schemas-from-types).
The second is to define Zod schemas using normal Zod and [Stainless schema methods](/stl/schemas/runtime-zod-schemas), and
passing those schemas to
[endpoint methods](/stl/endpoints).

Throughout the docs, both options are documented. Automatically
generating schemas from types is documented under the "Codegen schemas"
title, and using Zod schemas directly is documented under "Zod schemas".
