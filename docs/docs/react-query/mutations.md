---
sidebar_position: 4
---

# Mutations

For every `post`/`put`/`patch`/`delete` endpoint in your API,
there will be a `use<Action>()` method on the Stainless React
Query client that wraps [`useMutation`](https://tanstack.com/query/v4/docs/react/reference/useMutation).

For example, if `comments.create` is a `post /api/comments`
endpoint, then `client.comments.useCreate([reactQueryOptions])` will be available:

```ts
// ~/components/posts/CreateCommentForm.tsx

import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { useClient } from "~/api/client";

const CreateCommentForm: React.FC<{ postId: number }> = ({ postId }) => {
  const router = useRouter();
  const { postId } = router.query;

  const client = useClient();
  const [content, setContent] = useState("");

  const createComment = client.comments.useCreate({
    onSuccess: () => {
      setContent("");
    },
  });

  const handleSubmit = () => createComment.mutate(postId, { content });

  return (
    <div>
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
      />
      <button onClick={handleSubmit} disabled={createComment.isLoading} />
    </div>
  );
};
```

## mutate/mutateAsync method signature

`mutate([path], [body], [{ query, ...reactQueryOptions }])`

The signature of `mutate` methods varies depending on whether the
endpoint has path, body, and query parameters.

If the method has path parameters one path parameter will be the first argument
(multiple path parameters aren't currently supported).

If the method has body parameters the next argument will be the
body.

The last argument is the `mutate` options.
If the method has query parameters the `query` will be a property of these options.
