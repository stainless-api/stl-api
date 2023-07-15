# Changelog

## [0.1.0](https://github.com/stainless-api/stl-api/compare/stainless-v0.0.2...stainless-v0.1.0) (2023-07-15)


### ⚠ BREAKING CHANGES

* the following have been renamed:
    - `z.expands` -> `z.includes`
    - `z.(...).expandable()` -> `z.(...).includable()`
    - `z.ExpandableInput` -> `z.IncludableInput`
    - `z.ExpandableOutput` -> `z.IncludableOutput`
    - `z.ExpandableZodType` -> `z.IncludableZodType`
    - `z.isExpandable` -> `z.isIncludable`
    - `z.expandableSymbol` -> `z.includableSymbol`
* removed UserContext type parameter in favor of using declaration merging to add custom props to StlContext.  Also removed PartialStlContext type.
* `.stlMetadata` has been replaced with `.withMetadata`, `z.WithStlMetadata` has been replaced with `z.ZodMetadata`, and `z.ExtractStlMetadata` has been replaced with `z.extractMetadata`/ `z.extractDeepMetadata`.
* create `stl` instance with `new Stl(...)` instead of `makeStl(...)`
* the following functions have been moved:
    - `stl.next.plugins.appRoute` -> `stlNextAppRoute`
    - `stl.next.plugins.pageRoute` -> `stlNextPageRoute`
    - `stl.next.plugins.appCatchAllRouter` -> `stlNextAppCatchAllRouter`
    - `stl.next.plugins.pageCatchAllRouter` -> `stlNextPageCatchAllRouter`
    All of these functions can be imported from `@stl-api/next`.
* *StainlessMetadata has been renamed to *StlMetadata:
    - WithStainlessMetadata -> WithStlMetadata
    - ExtractStainlessMetadata -> ExtractStlMetadata
    - extractStainlessMetadata -> extractStlMetadata
* the following have been moved from the `stl` instance to `import { z } from 'stainless'`:
    - `stl.expands` -> `z.expands`
    - `stl.selects` -> `z.selects`
    - `stl.PaginationParams` -> `z.PaginationParams`
    - `stl.pageResponse` -> `z.pageResponse`
* the way to define selectable fields has changed slightly
* for recursive schemas with expandable or selectable properties, it's now necessary to declare input and output types for those schemas.  Unfortunately, I can't see any way around this.
* remove stl.response; use z.response instead (from `import { z } from 'stainless'`)
* rename the `@stl-api/stl` package to `stainless`

### Features

* add z.CircularModel helper ([8b09e67](https://github.com/stainless-api/stl-api/commit/8b09e67826ed49061c12797db63810072894022d))
* add z.path, z.query, z.body, z.response ([b67ab2e](https://github.com/stainless-api/stl-api/commit/b67ab2e23f14cc308ebde9c1fb95d2098f4a5f8d))
* make depth parameter of z.expands/z.selects optional ([7566a02](https://github.com/stainless-api/stl-api/commit/7566a0255be2f18f173928f4a5827315f8b38cab))
* **react-query:** implement useMutation and getQueryKey, add more documentation ([#21](https://github.com/stainless-api/stl-api/issues/21)) ([9663cd8](https://github.com/stainless-api/stl-api/commit/9663cd83e65793ad2dad9c97bd278d2123ec415e))
* support authenticated: true config ([7f6112a](https://github.com/stainless-api/stl-api/commit/7f6112a17f79fcf651db23fb39dcb35b46f33ad3))


### Bug Fixes

* client query issues and make react-query client wrap base client ([2458151](https://github.com/stainless-api/stl-api/commit/24581512a42101128bb0435768f6232bf617a192))
* **client:** throw error on 4xx/5xx ([585e0c3](https://github.com/stainless-api/stl-api/commit/585e0c3e2024d330e1e8f38d20cfcdb4ee5a6d9a))
* **client:** use GET for retrieve actions ([6049df4](https://github.com/stainless-api/stl-api/commit/6049df4a9d86e0c9a5b1800c24b4ac1ddf83152f))
* error messages and expansion/selection docs ([fd135d8](https://github.com/stainless-api/stl-api/commit/fd135d851f923bc299adeb46abd4d49eb2f5cdf2))
* expand + select bug ([a9d7125](https://github.com/stainless-api/stl-api/commit/a9d71256b599f4ad2167004d6505dcda5b13fa78))
* expand types ([2e3f635](https://github.com/stainless-api/stl-api/commit/2e3f63565b37246c1cc6e656af1659c6436a1be1))
* make Endpoint type non-recursive ([c676b52](https://github.com/stainless-api/stl-api/commit/c676b52b62357843d1d98a7f0a737f9528793daa))
* mark expands and selects params ([2869e8c](https://github.com/stainless-api/stl-api/commit/2869e8c496107ca80b462476b67759a127f4a1f2))
* pagination bugs ([0be9aa1](https://github.com/stainless-api/stl-api/commit/0be9aa16e735c2ec9d4e61a54b5a993e380717cb))
* propagate stl metadata in .optional()/.nullable()/.nullish() ([ac7d368](https://github.com/stainless-api/stl-api/commit/ac7d368230209e7659fee721a9f7b79ab2ffb77c))
* **react-query:** fix ESM/CJS issue ([ffc6c52](https://github.com/stainless-api/stl-api/commit/ffc6c526f017e892100a7de4370af2134d83d514))
* remove stray debugger and console.log statements ([0d35c5b](https://github.com/stainless-api/stl-api/commit/0d35c5b141d909f0826924a13be154ed9300e081))
* selectable field strategy ([f6c4633](https://github.com/stainless-api/stl-api/commit/f6c4633394adda79398ce32acf13132b054e656a))
* things that are breaking openapi generation ([91e40be](https://github.com/stainless-api/stl-api/commit/91e40be6ced0f680d27ca9ef06b72acc0745d3e3))
* use `import { z } from "stainless"` ([85520c1](https://github.com/stainless-api/stl-api/commit/85520c1859edba2618bc0b89e3627bdd1b58c959))
* use our zod-openapi build for now ([2893287](https://github.com/stainless-api/stl-api/commit/2893287cea46127b2402714316d3a6a1a5c35500))


### Code Refactoring

* allow extend context via declaration merging instead of generic ([afba2e7](https://github.com/stainless-api/stl-api/commit/afba2e7156013bdccfb887c6a9f5281b3db9e54d))
* convert Stl instance to a class ([9604c4e](https://github.com/stainless-api/stl-api/commit/9604c4ed9fad41e885ab08c3c5108a5ea227458e))
* improve code organization, rename StainlessMetadata -&gt; StlMetadata ([f423e33](https://github.com/stainless-api/stl-api/commit/f423e337b9ed99529647fc86ffd6da510dec2eab))
* move expand, select and pagination types to extended z ([bd4cb04](https://github.com/stainless-api/stl-api/commit/bd4cb04bfee81b640ccf32c9f9a2af9f75097f4d))
* rename @stl-api/stl to stainless ([bb60f65](https://github.com/stainless-api/stl-api/commit/bb60f6508fa6e1bc4e8acd141a818ee797948a82))
* rename expand to include ([7b35e50](https://github.com/stainless-api/stl-api/commit/7b35e50d36407fde4c128056c9f57bc16fa88022))
* stainless schema metadata ([0e93a50](https://github.com/stainless-api/stl-api/commit/0e93a5002c716f5d232f52e5637c00a7a2c83360))
* use standalone next route adapter functions ([#6](https://github.com/stainless-api/stl-api/issues/6)) ([cb26747](https://github.com/stainless-api/stl-api/commit/cb26747850ec6dd93e78377b5bf61fc5433d69f7))
