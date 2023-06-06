---
sidebar_position: 2
---

# Infinite Queries

If `posts.list` is a `get /api/posts` endpoint that returns [`z.PageData`](/stl/pagination#zpagedatai), then
`client.posts.useInfiniteList([query], [reactQueryOptions])` will be available
as a wrapper for [`useInfiniteQuery`](https://tanstack.com/query/v4/docs/react/reference/useInfiniteQuery):

```ts
// ~/components/posts/InfinitePostFeed.tsx

import * as React from "react";
import PostItem from "./PostItem";
import { client } from "~/api/client";
import InfiniteScroll, { LoadingProps, ErrorProps } from "../InfiniteScroll";

interface PostFeedProps {
  userId?: string;
}

const InfinitePostFeed: React.FC<PostFeedProps> = ({ userId }) => {
  const { itemAndPlaceholderCount, useItem } = client.posts.useInfiniteList({
    userId,
    expand: ["items.user", "items.comments"],
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

## Additional return properties

`useInfinite*` methods return the same properties as React Query's `useInfiniteQuery`
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
