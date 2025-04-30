# Changelog

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - ts-to-zod bumped from github:stainless-api/stl-api#ts-to-zod-0.0.4 to github:stainless-api/stl-api#ts-to-zod-0.0.5

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * ts-to-zod bumped to 0.2.1

## [0.2.0](https://github.com/stainless-api/stl-api/compare/cli-v0.1.1...cli-v0.2.0) (2025-04-29)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * ts-to-zod bumped from github:stainless-api/stl-api#ts-to-zod-0.0.5 to 0.2.0

## [0.1.0](https://github.com/stainless-api/stl-api/compare/cli-v0.0.3...cli-v0.1.0) (2023-12-06)

### ⚠ BREAKING CHANGES

- **cli:** renamed package

### Features

- **cli:** allow custom generation directory ([f4178d0](https://github.com/stainless-api/stl-api/commit/f4178d09af423574bdac46c6004ec1edffd0acf7))
- complex value schema generation within user folder ([b2beb37](https://github.com/stainless-api/stl-api/commit/b2beb376b335dc395db6c09434be4d0524c73382))
- complex value schema generation within user folder ([a85c704](https://github.com/stainless-api/stl-api/commit/a85c7049fe6596da11250caf2424b84a39156b11))
- generate prettified code, ignore generated code in watch mode ([7887d5d](https://github.com/stainless-api/stl-api/commit/7887d5dbb8cc3027d87d19b95ba1564af655054f))
- implement include and select magic schema generation ([1eace8f](https://github.com/stainless-api/stl-api/commit/1eace8f14d9d56638e0061e7d081dbbc08710115))
- implement include and select magic schema generation ([61cda64](https://github.com/stainless-api/stl-api/commit/61cda64bac99dd9a42a5957f8a61afa951b2eb02))
- rename magic to codegenSchema ([90eb489](https://github.com/stainless-api/stl-api/commit/90eb4893dd3afd1faf4188702ab1e33a00a3248b))
- support inlining Zod schemas into magic schemas ([c7f179a](https://github.com/stainless-api/stl-api/commit/c7f179a74475ade23efefa63ac08f251cbef7a90))
- support inlining Zod schemas into magic schemas ([bd9911a](https://github.com/stainless-api/stl-api/commit/bd9911ab7a970d4443fa839dae8882cbf6ac5f23))
- use all caps instead of lowercased HTTP methods in endpoints ([6c25c78](https://github.com/stainless-api/stl-api/commit/6c25c78e54dd4e0b3008bed22ef235e441d56dca))

### Bug Fixes

- **cli:** don't rewrite when any files are dirty ([e08657e](https://github.com/stainless-api/stl-api/commit/e08657edcb950383434b14e648f59d9e62e204c9))
- **cli:** fix bug with gitignored paths not getting ignored ([b0cd963](https://github.com/stainless-api/stl-api/commit/b0cd963eef83c1dd8d46af9d1b947d3c5a373487))
- **cli:** fix potential issues with using prettier ([5275f47](https://github.com/stainless-api/stl-api/commit/5275f4738519b00e56a8feb19dbf45b88d45c81f))
- **cli:** import handling improvements ([6f3aa66](https://github.com/stainless-api/stl-api/commit/6f3aa661ce795389118f5fef207e2cbb2f0b0d67))
- **cli:** improve watch mode ([f8c0e6e](https://github.com/stainless-api/stl-api/commit/f8c0e6ec87e7ceb6b5ef9cf7b5b302985f90d015))
- **cli:** module generation fixes ([bef0ebb](https://github.com/stainless-api/stl-api/commit/bef0ebbba7e6a06c16655754d8fb7e160d1912d3))
- **cli:** preserve import positions for already imported codegen modules ([cbd9d04](https://github.com/stainless-api/stl-api/commit/cbd9d04d438776f556491bb127993c214fe08632))
- **cli:** recover if prettier formatting fails ([da838d0](https://github.com/stainless-api/stl-api/commit/da838d01d1400ee59e82887b14f45e60292bbbc6))
- **cli:** tweak formatting a bit more ([60557c5](https://github.com/stainless-api/stl-api/commit/60557c52f857b9b7756fdee816e1cda91a78406b))
- emit error when encountering Zod schema type ([cc53600](https://github.com/stainless-api/stl-api/commit/cc536009cb522a08109defaefd4fb773e796909e))
- emit error when encountering Zod schema type ([6991dad](https://github.com/stainless-api/stl-api/commit/6991dad03d22172f515280f6cfabcecabb7dd61b))
- endpoint ident mangling, index generation ([827c75b](https://github.com/stainless-api/stl-api/commit/827c75b9d1391e8a6e1506a17cb8ec38b08a1613))

### Code Refactoring

- **cli:** rename from @stl-api/gen to @stl-api/cli ([1640ecd](https://github.com/stainless-api/stl-api/commit/1640ecd6897e01b9d1d473d865d3cf9b59cc0a36))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - ts-to-zod bumped to 0.0.4
