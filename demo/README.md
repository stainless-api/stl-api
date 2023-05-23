# Stainless API Framework demo

based on a fullstack twitter clone we found on youtube: https://github.com/AntonioErdeljac/twitter-clone

## TODO

- [x] Change signatures
  - [x] Server: handler({ query, text, etc, pageSize })
  - [x] Client: update(id, { text })
- [x] Infinite scroll / pagination helpers
- [x] Our own routing
- [x] Fix Context typing
- [x] Expand
- [x] Next `app` routing
- [ ] Errors
- [ ] Implement config, use it for auth requirement
- [ ] OpenAPI endpoint
- [ ] Select
- [ ] `create-stl-app`

### Build the monorepo

In the project root:

```
pnpm build
```

### Setup .env file

```
DATABASE_URL=postgresql://postgres:prisma@localhost:5432/stl_demo
NEXTAUTH_JWT_SECRET=
NEXTAUTH_SECRET=
```

### Start the db

```shell
docker compose up -d
```

or

```sh
brew services start postgresql@14 # run the initdb manually if needed
brew services info postgresql@14 # expect loading to be true
```

in `.env`, set it like so:

```sh
DATABASE_URL=postgresql://$USER:prisma@localhost:5432/stl_demo
```

such that this works:

```sh
psql -U $USER -d postgres
```

### Bootstrap prisma

```shell
pnpm prisma migrate dev
```

### Start the app

```shell
pnpm dev
```

## Available commands

Running commands with npm `pnpm [command]`

| command           | description                                                             |
| :---------------- | :---------------------------------------------------------------------- |
| `dev`             | Starts a development instance of the app                                |
| `psql [database]` | Open `psql` postgres command line for db launched with `docker compose` |
