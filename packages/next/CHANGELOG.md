# Changelog

## [0.1.1](https://github.com/stainless-api/stl-api/compare/next-v0.1.0...next-v0.1.1) (2024-09-23)

### Bug Fixes

- **deps:** update dependency hono to v4 [security] ([6c8b437](https://github.com/stainless-api/stl-api/commit/6c8b437fb86c9674cbcf6abe6bdd02253d584187))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - stainless bumped from github:stainless-api/stl-api#stainless-0.1.3 to github:stainless-api/stl-api#stainless-0.1.1

## [0.1.0](https://github.com/stainless-api/stl-api/compare/next-v0.0.3...next-v0.1.0) (2023-12-06)

### ⚠ BREAKING CHANGES

- removed UserContext type parameter in favor of using declaration merging to add custom props to StlContext. Also removed PartialStlContext type.
- create `stl` instance with `new Stl(...)` instead of `makeStl(...)`
- the following functions have been moved:
  - `stl.next.plugins.appRoute` -> `stlNextAppRoute`
  - `stl.next.plugins.pageRoute` -> `stlNextPageRoute`
  - `stl.next.plugins.appCatchAllRouter` -> `stlNextAppCatchAllRouter`
  - `stl.next.plugins.pageCatchAllRouter` -> `stlNextPageCatchAllRouter`
    All of these functions can be imported from `@stl-api/next`.
- rename the `@stl-api/stl` package to `stainless`

### Features

- use all caps instead of lowercased HTTP methods in endpoints ([6c25c78](https://github.com/stainless-api/stl-api/commit/6c25c78e54dd4e0b3008bed22ef235e441d56dca))

### Bug Fixes

- make Endpoint type non-recursive ([c676b52](https://github.com/stainless-api/stl-api/commit/c676b52b62357843d1d98a7f0a737f9528793daa))
- **react-query:** fix ESM/CJS issue ([ffc6c52](https://github.com/stainless-api/stl-api/commit/ffc6c526f017e892100a7de4370af2134d83d514))

### Code Refactoring

- allow extend context via declaration merging instead of generic ([afba2e7](https://github.com/stainless-api/stl-api/commit/afba2e7156013bdccfb887c6a9f5281b3db9e54d))
- convert Stl instance to a class ([9604c4e](https://github.com/stainless-api/stl-api/commit/9604c4ed9fad41e885ab08c3c5108a5ea227458e))
- rename @stl-api/stl to stainless ([bb60f65](https://github.com/stainless-api/stl-api/commit/bb60f6508fa6e1bc4e8acd141a818ee797948a82))
- use standalone next route adapter functions ([#6](https://github.com/stainless-api/stl-api/issues/6)) ([cb26747](https://github.com/stainless-api/stl-api/commit/cb26747850ec6dd93e78377b5bf61fc5433d69f7))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - stainless bumped to 0.1.0
