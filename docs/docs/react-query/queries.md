---
sidebar_position: 2
---

# Queries

For every `get` endpoint in your API, there will be a `use<Action>()` method on the Stainless
React Query client that wraps [`useQuery`](https://tanstack.com/query/v4/docs/react/reference/useQuery).

For example, if `posts.retrieve` is a `get /api/posts/{postId}` endpoint, then
`client.posts.useRetrieve(postId, [query], [reactQueryOptions])` will be available:

```ts
// ~/pages/posts/[postId].tsx

import { useRouter } from "next/router";
import { useClient } from "~/api/useClient";

const PostView = () => {
  const router = useRouter();
  const { postId } = router.query;

  const client = useClient();
  const { isLoading, data: post } = client.posts.useRetrieve(
    postId,
    { include: ["user", "comments.user"] },
  );

  ...
}
```

## Method signature

`use<Action>([path], [query], [reactQueryOptions])`

The signature of `use<Action>` methods varies depending
on whether the endpoint has path and query parameters.

If the method has path parameters one path parameter will be the first argument
(multiple path parameters aren't currently supported).

If the method has query parameters the next argument will be the
query; this argument is optional if all query parameters are optional.

The last argument is the `useQuery` options (except for
`queryKey`, `queryFn`, `getNextPageParam` and `getPreviousPageParam`, which are managed by the Stainless React Query client).
