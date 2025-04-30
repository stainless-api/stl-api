# Changelog

## [0.2.1](https://github.com/stainless-api/stl-api/compare/stainless-v0.2.0...stainless-v0.2.1) (2025-04-30)


### Bug Fixes

* add summary to create endpoint types ([d82ec17](https://github.com/stainless-api/stl-api/commit/d82ec17e5d69e1a7a1a6a5232f79f8f2f7fa45a5))

## [0.2.0](https://github.com/stainless-api/stl-api/compare/stainless-v0.1.1...stainless-v0.2.0) (2025-04-29)


### Features

* Add route summary ([#92](https://github.com/stainless-api/stl-api/issues/92)) ([0901ac5](https://github.com/stainless-api/stl-api/commit/0901ac57888b8ac33a310f1117a53bf0eb45e698))

## [0.1.1](https://github.com/stainless-api/stl-api/compare/stainless-v0.1.0...stainless-v0.1.1) (2024-09-23)

### Bug Fixes

- **api:** disable includable for now ([ccc8298](https://github.com/stainless-api/stl-api/commit/ccc82981f938f9eee0804ed244ced337f5d86924))

## [0.1.0](https://github.com/stainless-api/stl-api/compare/stainless-v0.0.3...stainless-v0.1.0) (2023-12-06)

### ⚠ BREAKING CHANGES

- **stl:** rename prepareRequest to parseParamsWithContext
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
- the way to define selectable fields has changed slightly
- for recursive schemas with expandable or selectable properties, it's now necessary to declare input and output types for those schemas. Unfortunately, I can't see any way around this.
- remove stl.response; use z.response instead (from `import { z } from 'stainless'`)
- rename the `@stl-api/stl` package to `stainless`

### Features

- add stl.magic function ([eb364e2](https://github.com/stainless-api/stl-api/commit/eb364e26a92b4570313cf56a43e6176abed28829))
- add stl.magic function ([f1f4964](https://github.com/stainless-api/stl-api/commit/f1f4964bd82fe8c88377e94a703bfd85ec3799a9))
- add z.CircularModel helper ([8b09e67](https://github.com/stainless-api/stl-api/commit/8b09e67826ed49061c12797db63810072894022d))
- add z.path, z.query, z.body, z.response ([b67ab2e](https://github.com/stainless-api/stl-api/commit/b67ab2e23f14cc308ebde9c1fb95d2098f4a5f8d))
- better typing ([c9cf3a0](https://github.com/stainless-api/stl-api/commit/c9cf3a0a06f13671e169ac9cf59bf8e48ac37ff6))
- **cli:** allow endpoint handler to be optional ([d3283e9](https://github.com/stainless-api/stl-api/commit/d3283e9918af6f0600c90d022517d7d3a8f198e3))
- complex value schema generation within user folder ([b2beb37](https://github.com/stainless-api/stl-api/commit/b2beb376b335dc395db6c09434be4d0524c73382))
- complex value schema generation within user folder ([a85c704](https://github.com/stainless-api/stl-api/commit/a85c7049fe6596da11250caf2424b84a39156b11))
- implement include and select magic schema generation ([1eace8f](https://github.com/stainless-api/stl-api/commit/1eace8f14d9d56638e0061e7d081dbbc08710115))
- implement include and select magic schema generation ([61cda64](https://github.com/stainless-api/stl-api/commit/61cda64bac99dd9a42a5957f8a61afa951b2eb02))
- implement magic schema generation for selection, pageResponse ([a2416cd](https://github.com/stainless-api/stl-api/commit/a2416cded4cc56a8c2a7af0003dc65fce38335c2))
- implement magic schema generation for selection, pageResponse ([74d9d5a](https://github.com/stainless-api/stl-api/commit/74d9d5ac8261a81c3334b29b84be1acbd8d0ba1e))
- implement stl.types.endpoint support, along with CJS and ESM support. ([1ad5450](https://github.com/stainless-api/stl-api/commit/1ad54508f5dd83815886c26de9920917c96a1923))
- implement stl.types.endpoint support, along with CJS and ESM support. ([fbeb815](https://github.com/stainless-api/stl-api/commit/fbeb815ba4239bee4dd8d00ab04b4f34836cd481))
- initial schema class with validate transform implementation ([9aaf3d5](https://github.com/stainless-api/stl-api/commit/9aaf3d53dbb751e0283a23086d6341dbc3be9732))
- make depth parameter of z.expands/z.selects optional ([7566a02](https://github.com/stainless-api/stl-api/commit/7566a0255be2f18f173928f4a5827315f8b38cab))
- **react-query:** implement useMutation and getQueryKey, add more documentation ([#21](https://github.com/stainless-api/stl-api/issues/21)) ([9663cd8](https://github.com/stainless-api/stl-api/commit/9663cd83e65793ad2dad9c97bd278d2123ec415e))
- rename magic to codegenSchema ([90eb489](https://github.com/stainless-api/stl-api/commit/90eb4893dd3afd1faf4188702ab1e33a00a3248b))
- **stainless:** add stl.prepareRequest method ([c58dc22](https://github.com/stainless-api/stl-api/commit/c58dc22400961902dc6751c01fd5ca13fe932a55))
- **stl:** add parseParams, rename prepareRequest ([e21f8e2](https://github.com/stainless-api/stl-api/commit/e21f8e2abfa8d6c8449005eb92425162feac9a65))
- support authenticated: true config ([7f6112a](https://github.com/stainless-api/stl-api/commit/7f6112a17f79fcf651db23fb39dcb35b46f33ad3))
- support default schema values ([1ddcae3](https://github.com/stainless-api/stl-api/commit/1ddcae3a37e98fd77b82fd9169e16c41d8c40032))
- use all caps instead of lowercased HTTP methods in endpoints ([6c25c78](https://github.com/stainless-api/stl-api/commit/6c25c78e54dd4e0b3008bed22ef235e441d56dca))

### Bug Fixes

- a bunch of issues with include/select ([66fdf7e](https://github.com/stainless-api/stl-api/commit/66fdf7e7c220f61518f1fdac28f00183e3b82aec))
- client query issues and make react-query client wrap base client ([2458151](https://github.com/stainless-api/stl-api/commit/24581512a42101128bb0435768f6232bf617a192))
- **client:** throw error on 4xx/5xx ([585e0c3](https://github.com/stainless-api/stl-api/commit/585e0c3e2024d330e1e8f38d20cfcdb4ee5a6d9a))
- **client:** use GET for retrieve actions ([6049df4](https://github.com/stainless-api/stl-api/commit/6049df4a9d86e0c9a5b1800c24b4ac1ddf83152f))
- **coerceParams:** fix bugs and test ([1f5294f](https://github.com/stainless-api/stl-api/commit/1f5294f5c7882cc2791a95b8ba2b5ea28e7faab1))
- endpoint ident mangling, index generation ([827c75b](https://github.com/stainless-api/stl-api/commit/827c75b9d1391e8a6e1506a17cb8ec38b08a1613))
- error messages and expansion/selection docs ([fd135d8](https://github.com/stainless-api/stl-api/commit/fd135d851f923bc299adeb46abd4d49eb2f5cdf2))
- expand + select bug ([a9d7125](https://github.com/stainless-api/stl-api/commit/a9d71256b599f4ad2167004d6505dcda5b13fa78))
- expand types ([2e3f635](https://github.com/stainless-api/stl-api/commit/2e3f63565b37246c1cc6e656af1659c6436a1be1))
- fix stl.magic and t.input types ([#23](https://github.com/stainless-api/stl-api/issues/23)) ([7b71730](https://github.com/stainless-api/stl-api/commit/7b717301e736aca6b29350d9b6bfb015887bae80))
- fix stl.magic and t.input types ([#23](https://github.com/stainless-api/stl-api/issues/23)) ([4e1c182](https://github.com/stainless-api/stl-api/commit/4e1c1826415671e576d664dbf9186b6d391267d9))
- include transform-refine type conversion ([566ff1e](https://github.com/stainless-api/stl-api/commit/566ff1e7b7df53fcf61d5d33e6347532ee802ac5))
- make Endpoint type non-recursive ([c676b52](https://github.com/stainless-api/stl-api/commit/c676b52b62357843d1d98a7f0a737f9528793daa))
- make openapi generation work with new TypeSchemas ([ad5ef4f](https://github.com/stainless-api/stl-api/commit/ad5ef4f7a91cf44833ae3f32310a3afe47674a38))
- mark expands and selects params ([2869e8c](https://github.com/stainless-api/stl-api/commit/2869e8c496107ca80b462476b67759a127f4a1f2))
- pagination bugs ([0be9aa1](https://github.com/stainless-api/stl-api/commit/0be9aa16e735c2ec9d4e61a54b5a993e380717cb))
- propagate stl metadata in .optional()/.nullable()/.nullish() ([ac7d368](https://github.com/stainless-api/stl-api/commit/ac7d368230209e7659fee721a9f7b79ab2ffb77c))
- **react-query:** fix ESM/CJS issue ([ffc6c52](https://github.com/stainless-api/stl-api/commit/ffc6c526f017e892100a7de4370af2134d83d514))
- remove debugger/print statements ([0f555cc](https://github.com/stainless-api/stl-api/commit/0f555cc9420e74dacd1e0b38820f79cf44c94481))
- remove stray debugger and console.log statements ([0d35c5b](https://github.com/stainless-api/stl-api/commit/0d35c5b141d909f0826924a13be154ed9300e081))
- selectable field strategy ([f6c4633](https://github.com/stainless-api/stl-api/commit/f6c4633394adda79398ce32acf13132b054e656a))
- **stainless:** auto-coerce path and query params ([068df62](https://github.com/stainless-api/stl-api/commit/068df621a1ec2d7483da9ec3f7307d1c4b58b536))
- **stainless:** fix openapi endpoint ([e8767aa](https://github.com/stainless-api/stl-api/commit/e8767aa651eb773717238ef4d7e50650953fb053))
- **stainless:** fix openapi generation ([56133a1](https://github.com/stainless-api/stl-api/commit/56133a1ce40275e669725817c6fc78ec3799a5f0))
- **stainless:** fix toZod and make handler optional ([2dcd256](https://github.com/stainless-api/stl-api/commit/2dcd256e69dbf338897cf7f44d4e19039fda0946))
- **stainless:** fix typo ([370b936](https://github.com/stainless-api/stl-api/commit/370b9367c54dd719004edfb22538ece29c8b0eb7))
- **stainless:** implement more practical param coercion ([ac98106](https://github.com/stainless-api/stl-api/commit/ac98106b3bd3ce29072b37a696a4783a0148c1d4))
- **stainless:** improve coerceParams function ([4859154](https://github.com/stainless-api/stl-api/commit/485915496477dec55793491e698ce1ce5180425a))
- **stainless:** tweak and document param coercion ([5188fd2](https://github.com/stainless-api/stl-api/commit/5188fd26c057491a69f4eb0b93764d4e7f3994a8))
- stl.magic type signature ([b72c569](https://github.com/stainless-api/stl-api/commit/b72c5690dbd88a4b0d0ec41f10b29a7b24aa8882))
- stl.magic type signature ([1bdbc98](https://github.com/stainless-api/stl-api/commit/1bdbc9879a42075023a31e09f4d13afde9dc9459))
- things that are breaking openapi generation ([91e40be](https://github.com/stainless-api/stl-api/commit/91e40be6ced0f680d27ca9ef06b72acc0745d3e3))
- use `import { z } from "stainless"` ([85520c1](https://github.com/stainless-api/stl-api/commit/85520c1859edba2618bc0b89e3627bdd1b58c959))
- use our zod-openapi build for now ([2893287](https://github.com/stainless-api/stl-api/commit/2893287cea46127b2402714316d3a6a1a5c35500))
- various new schema type fixes ([02145d7](https://github.com/stainless-api/stl-api/commit/02145d73243988d829a4bb9e683c5e4737aaf290))

### Code Refactoring

- allow extend context via declaration merging instead of generic ([afba2e7](https://github.com/stainless-api/stl-api/commit/afba2e7156013bdccfb887c6a9f5281b3db9e54d))
- convert Stl instance to a class ([9604c4e](https://github.com/stainless-api/stl-api/commit/9604c4ed9fad41e885ab08c3c5108a5ea227458e))
- improve code organization, rename StainlessMetadata -&gt; StlMetadata ([f423e33](https://github.com/stainless-api/stl-api/commit/f423e337b9ed99529647fc86ffd6da510dec2eab))
- move expand, select and pagination types to extended z ([bd4cb04](https://github.com/stainless-api/stl-api/commit/bd4cb04bfee81b640ccf32c9f9a2af9f75097f4d))
- rename @stl-api/stl to stainless ([bb60f65](https://github.com/stainless-api/stl-api/commit/bb60f6508fa6e1bc4e8acd141a818ee797948a82))
- rename expand to include ([7b35e50](https://github.com/stainless-api/stl-api/commit/7b35e50d36407fde4c128056c9f57bc16fa88022))
- stainless schema metadata ([0e93a50](https://github.com/stainless-api/stl-api/commit/0e93a5002c716f5d232f52e5637c00a7a2c83360))
- **t:** use type parameters more ([a3a84a4](https://github.com/stainless-api/stl-api/commit/a3a84a4363b2e7e0645017ba3ddde252eaa5e396))
- use standalone next route adapter functions ([#6](https://github.com/stainless-api/stl-api/issues/6)) ([cb26747](https://github.com/stainless-api/stl-api/commit/cb26747850ec6dd93e78377b5bf61fc5433d69f7))
