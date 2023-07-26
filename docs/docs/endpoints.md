---
sidebar_position: 4
---

# Endpoints

A Stainless API endpoint declares a method and URL, request and response parameter schemas, and
a handler function that handles the request. Endpoints are grouped into [resources](/stl/resources),
which are in turn grouped into an entire API definition. Here's a basic example:

```ts
// ~/api/users/retrieve.ts

import { stl } from "~/libs/stl";
import { NotFoundError, z } from "stainless";
import prisma from "~/libs/prismadb";
import { User } from "./models";

export const retrieve = stl
  .types<{ path: { userId: string }; response: typeof User }>()
  .endpoint({
    endpoint: "GET /api/users/{userId}",
    async handler({ userId }, ctx) {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      if (!user) throw new NotFoundError();
      return user;
    },
  });
```

## Properties

The `endpoint` method takes properties to customize the behavior of the endpoint.

### `endpoint`

A string declaring the HTTP method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`, `HEAD`) and
URL for this endpoint.

### `handler(params, context)`

The function that handles requests to this `endpoint`. It will be called with a `params` object consisting
of the parsed `path`, `query`, and `body` parameters squashed together, a `context` object, and should return
or resolve to a raw response to be parsed by the `response` schema.

The `params`, `context` and return types will be automatically mapped from the request and response types.

Note that the handler field is optional: this is useful for declaring
the shape of an API through endpoints, but not serving requests using
`stainless`.

## Types

`stl.types` is a helper that enables generating rich, validating schemas for the parameter and
response types of the endpoint. After running the `@stl-api` CLI, these type definitions are
converted into Zod schemas, which are used to validate endpoint parameters. If parameters
fail to validate against the generated schema, the endpoint responds with a detailed error message.
For more information about the CLI, visit its [dedicated page](/stl/cli).

`stl.types` accepts one type parameter, which is used to specify the types of the parameters accepted by the endpoint,
as well as the type of its response. In order to provide these parameters, these fields can be passed as
properties of the type parameter:

### `response`

The type of the HTTP response.

### `path`

The type for the path parameters.

### `query`

The type for the query (search) parameters.

### `body`

The type for the request body parameters.

## Error handling

You can throw certain exceptions within the `handler` to return 4xx or 5xx HTTP error responses to the user, with well-formatted bodies.

`stainless` provides some exception types to streamline this. Each will cause the endpoint to respond with an HTTP status code.
Each exception's constructor also accepts an optional record
parameter, which is included in the body of the response JSON.

### `StlError`

Takes an HTTP status code as a constructor argument. Responds with
that status code. Best used to create custom subclasses if you need HTTP status codes we don't yet provide out of the box.

### `BadRequestError`

Responds with HTTP status code 400.

### `UnauthorizedError`

Responds with HTTP status code 401.

### `ForbiddenError`

Responds with HTTP status code 403.

### `NotFoundError`

Responds with HTTP status code 404.

## Manually providing Zod schemas

Typed endpoints can also be created through manually specifying
zod schemas, and passing them to the standalone `endpoint` method.
This method takes the same properties as the `endpoint` method available when using `stl.types`,
as well as these additional properties for providing schema values:

### `response`

The [schema](/stl/schemas) for the HTTP response.

### `path`

The [schema](/stl/schemas) for the path parameters.

### `query`

The [schema](/stl/schemas) for the query (search) parameters.

### `body`

The [schema](/stl/schemas) for the request body parameters.
