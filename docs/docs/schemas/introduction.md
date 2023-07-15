---
sidebar_position: 0
---

# Introduction

We use a customized version of [Zod](https://zod.dev/) for declaring request and response
schemas. We provide two ways of doing this. The first is to use our [CLI](/stl/cli) for [generating Zod schemas automatically from Typescript types](/stl/schemas/schemas-from-types). 
The second is to define Zod schemas using normal Zod and [Stainless schema methods](/stl/schemas), and 
passing those schemas to 
[endpoint methods](/stl/endpoints).