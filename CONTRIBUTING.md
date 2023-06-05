# Getting started

## Install deps

- Install `pnpm`
- Install deps with `pnpm i`

## Setup `.env` file in `/demo`:

You can copy `/demo/.env-example` to `/demo/.env`:

```
DATABASE_URL=postgresql://postgres:prisma@localhost:5432/stl_demo
NEXTAUTH_JWT_SECRET=(random string)
NEXTAUTH_SECRET=(random string)
```

## Start the db

### Via `docker compose`:

In `/demo`:

```shell
docker compose up -d
```

### Via `brew`:

```sh
brew services start postgresql@14 # run the initdb manually if needed
brew services info postgresql@14 # expect loading to be true
```

in `/demo/.env`, set it like so:

```sh
DATABASE_URL=postgresql://$USER:prisma@localhost:5432/stl_demo
```

such that this works:

```sh
psql -U $USER -d postgres
```

## Bootstrap prisma

In `/demo`:

```shell
pnpm prisma migrate dev
```

## Start the main build watch process

(In monorepo root directory)

```shell
pnpm watch
```

TypeScript won't be able to resolve packages' references to each other before their
build output is in `packages/*/dist`. The `build:watch` command runs `tsc -b --watch`
on the packages, so that changes in one are quickly available in another.

## Start the demo app

In `/demo`:

```shell
pnpm dev
```

## Run tests

(In monorepo root directory)

```shell
pnpm test
```
