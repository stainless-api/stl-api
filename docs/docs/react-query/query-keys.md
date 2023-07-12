---
sidebar_position: 6
---

# Query Keys

The Stainless React Query client provides `client.<Resource>.<Action>.getQueryKey([path], [query])`
methods to get the `queryKey` it uses for that resource, action, and parameters.

You can use this for interacting with the cache via `invalidateQueries`, `refetchQueries`, `getQueryData`,
`setQueryData`, etc.

`getQueryKey` accepts partial parameters so that you can create a `queryKey` that matches multiple
queries for a given endpoint. For example, `client.posts.retrieve.getQueryKey()` would return the
"parent" or prefix of the `queryKey` used by `client.posts.retrieve(1)`, `client.posts.retrieve(2)` etc.

:::caution
You should treat the keys from `getQueryKey` as opaque values that are subject to change if needed
as our React Query integration evolves.
:::

## Method Signature

`getQueryKey([path], [query])`

The signature of `getQueryKey` methods varies depending
on whether the endpoint has path and query parameters.

If the method has path parameters one path parameter will be the first argument
(multiple path parameters aren't currently supported).

If the method has query parameters the next argument will be the
query; this argument is optional if all query parameters are optional.
