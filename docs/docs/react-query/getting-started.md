---
sidebar_position: 0
---

# Getting started

:::caution

This is alpha software, and we may make significant changes in the coming months.
But we're eager for you to try it out and let us know what you think!

:::

## Installation

```
npm i --save stainless-api/stl-api#react-query-0.0.2
```

## Create client

Just replace the [base stainless `createClient`](/stl/client/getting-started) with `createReactQueryClient`:

```ts
// ~/api/client.ts
import type { api } from "./api";
import { createReactQueryClient } from "@stl-api/react-query";

export const client = createReactQueryClient<typeof api>("/api");
```

## Use hooks for GET methods

If `posts.retrieve` is a `get /api/posts/{postId}` endpoint, then
`client.posts.useRetrieve(postId, [query], [reactQueryOptions])` will be available
as a wrapper for [`useQuery`](https://tanstack.com/query/v4/docs/react/reference/useQuery):

```ts
// ~/pages/posts/[postId].tsx

import { useRouter } from "next/router";
import { client } from "~/api/client";

const PostView = () => {
  const router = useRouter();
  const { postId } = router.query;

  const { data: fetchedPost, isLoading } = client.posts.useRetrieve(
    typeof postId === "string" ? postId : "",
    { expand: ["user", "comments.user"] },
    { enabled: typeof postId === "string" }
  );

  // ...
};
```

## Use infinite hooks for paginated methods

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
