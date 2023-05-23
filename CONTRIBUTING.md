# Getting started

- Install deps with `pnpm i`
- Run `pnpm build:watch`

TypeScript won't be able to resolve packages' references to each other before their
build output is in `packages/*/dist`. The `build:watch` command runs `tsc -b --watch`
on the packages, so that changes in one are quickly available in another.
