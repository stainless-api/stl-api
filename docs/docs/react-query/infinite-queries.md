---
sidebar_position: 3
---

# Infinite Queries

For every paginated endpoint in your API, there will be a `useInfinite<Action>()` method on the Stainless
React Query client that wraps [`useInfiniteQuery`](https://tanstack.com/query/v4/docs/react/reference/useInfiniteQuery)

For example, if `posts.list` is a `get /api/posts` endpoint that returns [`z.PageData`](/stl/pagination#zpagedatai), then
`client.posts.useInfiniteList([query], [reactQueryOptions])` will be available:

```ts
// ~/components/posts/InfinitePostFeed.tsx

import * as React from "react";
import PostItem from "./PostItem";
import { useClient } from "~/api/useClient";
import InfiniteScroll, { LoadingProps, ErrorProps } from "../InfiniteScroll";

interface PostFeedProps {
  userId?: string;
}

const InfinitePostFeed: React.FC<PostFeedProps> = ({ userId }) => {
  const client = useClient();
  const { itemAndPlaceholderCount, useItem } = client.posts.useInfiniteList({
    userId,
    include: ["items.user", "items.comments"],
  });

  return (
    <div className="flex-auto">
      <InfiniteScroll
        itemCount={itemAndPlaceholderCount}
        useItem={useItem}
        minItemSize={100}
        Item={PostItem}
        Loading={LoadingItem}
        Error={ErrorItem}
      />
    </div>
  );
};

export default InfinitePostFeed;
```

## Method signature

`useInfinite<Action>([path], [query], [reactQueryOptions])`

The signature of `useInfinite<Action>` methods varies depending
on whether the endpoint has path and query parameters.

If the method has path parameters one path parameter will be the first argument
(multiple path parameters aren't currently supported).

If the method has query parameters the next argument will be the
query; this argument is optional if all query parameters are optional.

The last argument is the `useInfiniteQuery` options (except for
`queryKey`, `queryFn`, `getNextPageParam` and `getPreviousPageParam`, which are managed by the Stainless React Query client).

## Additional return properties

`useInfinite<Action>` methods return the same properties as React Query's `useInfiniteQuery`
plus additional helpful properties for implementing infinite scroll views with
`react-window` or similar:

### `items`

A flattened array of items from `data.pages`.

### `itemCount`

Just `items.length`.

### `itemAndPlaceholderCount`

The number of rows (columns) to display in an infinite scroll, including a loading placeholder
at the end.

### `useItem`

A React custom hook that takes the `index` and returns `UseItemResult<Item>`:

```ts
export type UseItemResult<Item> =
  | { status: "loading" }
  | { status: "loaded"; data: Item }
  | { status: "error"; error: Error }
  | undefined;
```
