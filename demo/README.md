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

## Available commands

Running commands with npm `pnpm [command]`

| command           | description                                                             |
| :---------------- | :---------------------------------------------------------------------- |
| `dev`             | Starts a development instance of the app                                |
| `psql [database]` | Open `psql` postgres command line for db launched with `docker compose` |
