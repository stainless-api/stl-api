# Changelog

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - stainless bumped from github:stainless-api/stl-api#stainless-0.1.3 to github:stainless-api/stl-api#stainless-0.1.1

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * stainless bumped to 0.2.1

## [0.2.0](https://github.com/stainless-api/stl-api/compare/prisma-v0.1.1...prisma-v0.2.0) (2025-04-29)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * stainless bumped from github:stainless-api/stl-api#stainless-0.1.1 to 0.2.0

## [0.1.0](https://github.com/stainless-api/stl-api/compare/prisma-v0.0.3...prisma-v0.1.0) (2023-12-06)

### ⚠ BREAKING CHANGES

- **t:** use type parameters more
- the following have been renamed:
  - `z.expands` -> `z.includes`
  - `z.(...).expandable()` -> `z.(...).includable()`
  - `z.ExpandableInput` -> `z.IncludableInput`
  - `z.ExpandableOutput` -> `z.IncludableOutput`
  - `z.ExpandableZodType` -> `z.IncludableZodType`
  - `z.isExpandable` -> `z.isIncludable`
  - `z.expandableSymbol` -> `z.includableSymbol`
- removed UserContext type parameter in favor of using declaration merging to add custom props to StlContext. Also removed PartialStlContext type.
- `.stlMetadata` has been replaced with `.withMetadata`, `z.WithStlMetadata` has been replaced with `z.ZodMetadata`, and `z.ExtractStlMetadata` has been replaced with `z.extractMetadata`/ `z.extractDeepMetadata`.
- create `stl` instance with `new Stl(...)` instead of `makeStl(...)`
- the following functions have been moved:
  - `stl.next.plugins.appRoute` -> `stlNextAppRoute`
  - `stl.next.plugins.pageRoute` -> `stlNextPageRoute`
  - `stl.next.plugins.appCatchAllRouter` -> `stlNextAppCatchAllRouter`
  - `stl.next.plugins.pageCatchAllRouter` -> `stlNextPageCatchAllRouter`
    All of these functions can be imported from `@stl-api/next`.
- *StainlessMetadata has been renamed to *StlMetadata:
  - WithStainlessMetadata -> WithStlMetadata
  - ExtractStainlessMetadata -> ExtractStlMetadata
  - extractStainlessMetadata -> extractStlMetadata
- the following have been moved from the `stl` instance to `import { z } from 'stainless'`:
  - `stl.expands` -> `z.expands`
  - `stl.selects` -> `z.selects`
  - `stl.PaginationParams` -> `z.PaginationParams`
  - `stl.pageResponse` -> `z.pageResponse`
- remove stl.response; use z.response instead (from `import { z } from 'stainless'`)
- rename the `@stl-api/stl` package to `stainless`
- stl.expandParam has been renamed to stl.expands, stl.selectParam has been renamed to stl.selects

### Features

- add z.path, z.query, z.body, z.response ([b67ab2e](https://github.com/stainless-api/stl-api/commit/b67ab2e23f14cc308ebde9c1fb95d2098f4a5f8d))
- use all caps instead of lowercased HTTP methods in endpoints ([6c25c78](https://github.com/stainless-api/stl-api/commit/6c25c78e54dd4e0b3008bed22ef235e441d56dca))

### Bug Fixes

- a bunch of issues with include/select ([66fdf7e](https://github.com/stainless-api/stl-api/commit/66fdf7e7c220f61518f1fdac28f00183e3b82aec))
- error messages and expansion/selection docs ([fd135d8](https://github.com/stainless-api/stl-api/commit/fd135d851f923bc299adeb46abd4d49eb2f5cdf2))
- make Endpoint type non-recursive ([c676b52](https://github.com/stainless-api/stl-api/commit/c676b52b62357843d1d98a7f0a737f9528793daa))
- pagination bugs ([0be9aa1](https://github.com/stainless-api/stl-api/commit/0be9aa16e735c2ec9d4e61a54b5a993e380717cb))
- **prisma:** fix TS error ([8fa5f68](https://github.com/stainless-api/stl-api/commit/8fa5f688db68fe21f7690e4000147c9398873a20))
- **prisma:** fix typo in includeFromQuery ([02bfac1](https://github.com/stainless-api/stl-api/commit/02bfac16e665262493f04223b5cbe584fc673c47))
- **prismaPlugin:** include top-level fields even if select is given ([6ab0a9c](https://github.com/stainless-api/stl-api/commit/6ab0a9cd4011f8204f0ff2db510912d2298cb254))
- **react-query:** fix ESM/CJS issue ([ffc6c52](https://github.com/stainless-api/stl-api/commit/ffc6c526f017e892100a7de4370af2134d83d514))
- remove debugger/print statements ([0f555cc](https://github.com/stainless-api/stl-api/commit/0f555cc9420e74dacd1e0b38820f79cf44c94481))
- remove stray debugger and console.log statements ([0d35c5b](https://github.com/stainless-api/stl-api/commit/0d35c5b141d909f0826924a13be154ed9300e081))
- things that are breaking openapi generation ([91e40be](https://github.com/stainless-api/stl-api/commit/91e40be6ced0f680d27ca9ef06b72acc0745d3e3))
- use `import { z } from "stainless"` ([85520c1](https://github.com/stainless-api/stl-api/commit/85520c1859edba2618bc0b89e3627bdd1b58c959))

### Code Refactoring

- allow extend context via declaration merging instead of generic ([afba2e7](https://github.com/stainless-api/stl-api/commit/afba2e7156013bdccfb887c6a9f5281b3db9e54d))
- convert Stl instance to a class ([9604c4e](https://github.com/stainless-api/stl-api/commit/9604c4ed9fad41e885ab08c3c5108a5ea227458e))
- improve code organization, rename StainlessMetadata -&gt; StlMetadata ([f423e33](https://github.com/stainless-api/stl-api/commit/f423e337b9ed99529647fc86ffd6da510dec2eab))
- move expand, select and pagination types to extended z ([bd4cb04](https://github.com/stainless-api/stl-api/commit/bd4cb04bfee81b640ccf32c9f9a2af9f75097f4d))
- rename @stl-api/stl to stainless ([bb60f65](https://github.com/stainless-api/stl-api/commit/bb60f6508fa6e1bc4e8acd141a818ee797948a82))
- rename expand to include ([7b35e50](https://github.com/stainless-api/stl-api/commit/7b35e50d36407fde4c128056c9f57bc16fa88022))
- rename expandParam -&gt; expands, selectParam -> selects ([8613965](https://github.com/stainless-api/stl-api/commit/8613965c91e64b29dcadc448a901e9bcc2c42f6c))
- stainless schema metadata ([0e93a50](https://github.com/stainless-api/stl-api/commit/0e93a5002c716f5d232f52e5637c00a7a2c83360))
- **t:** use type parameters more ([a3a84a4](https://github.com/stainless-api/stl-api/commit/a3a84a4363b2e7e0645017ba3ddde252eaa5e396))
- use standalone next route adapter functions ([#6](https://github.com/stainless-api/stl-api/issues/6)) ([cb26747](https://github.com/stainless-api/stl-api/commit/cb26747850ec6dd93e78377b5bf61fc5433d69f7))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - stainless bumped to 0.1.0
