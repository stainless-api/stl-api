# Pagination

Stainless provides helpers for easily implementing pagination that follows the pristine
convention.

## Pristine convention

### Request query parameters

- `pageAfter` (optional string) - if given, this should be the `endCursor`
  of the previous page. The API will fetch items immediately
  after this cursor.
- `pageBefore` (optional string) - if given, this should be the `startCursor`
  of the next page. The API will fetch items immediately
  before this cursor.
- `pageSize` (optional number) - the number of items to
  include in the result
- `sortBy` (optional string) - an enum constant indicating
  the field(s) to sort by
- `sortDirection` (optional, `"asc"` or `"desc"`) - the sort direction

[`z.PaginationParams`](#zpaginationparams) provides a Zod schema for these parameters.

### Response fields

- `items` (array) - up to `pageSize` items
- `startCursor` (string or null) - the cursor of the first item in
  `items`, or `null` if `items` is empty
- `endCursor` (string or null) - the cursor of the last item in
  `items`, or `null` if `items` is empty
- `hasNextPage` (optional boolean) - whether there are more items after this page.
  May be omitted when paginating backward with `pageBefore`.
- `hasPreviousPage` (optional boolean) - whether there are more items before this page.
  May be omitted when paginating backward with `pageBefore`.

[`z.pageResponse`](#zpageresponseitem) provides a Zod schema for these response fields.

### Forward and backward pagination

Paginating backwards does not change the sort order; in other words,
if we have page `A`, and we get page `B = pageAfter: A.endCursor`,
then get page `C = pageBefore: B.startCursor`, `C` should be deep
equal to `A` as long as no underlying data has changed.

# Pagination schema types

`stainless` exports the following schemas and functions from
`import { z } from 'stainless'`:

## `z.PaginationParams`

A Zod schema for the base [request query parameters](#request-query-parameters). You may call `z.PaginationParams.extend({...})` to override defaults or add parameters to it.

## `z.pageResponse(item)`

Creates a Zod schema for a page response with the given `item` type
schema.

## `z.PageData<I>`

The output type of `z.pageResponse(item: I)`.

## `z.PageItemType<D extends z.PageData<any>>`

Extracts the item type from the page data type `D`.

## `z.AnyPageData`

A Zod schema for a page response whose items are any type.

## `z.SortDirection`

A Zod schema for `sortDirection` (`"asc" | "desc"`).

# Prisma integration

The `@stl-api/prisma` plugin makes it easy to implement [paginated
list endpoints from Prisma schemas](/packages/prisma/docs/pagination.md).
