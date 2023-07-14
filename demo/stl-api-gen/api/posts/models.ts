import { z } from "stainless";
import * as __ from "../../../api/posts/models";
import * as __u46u46$u46u46$u46u46$libs$prismadbu46ts from "../../../libs/prismadb";
export const PostType: z.ZodTypeAny = z.object({ id: z.string().uuid(), body: z.string(), createdAt: z.date(), updatedAt: z.date(), userId: z.string().uuid(), likedIds: z.array(z.string().uuid()), image: z.string().nullable().optional(), user: z.lazy(() => __.IncludableUserSchema), user_fields: z.lazy(() => __.SelectableUserSchema), comments: z.lazy(() => __.IncludableCommentsSchema), comments_field: z.lazy(() => __.IncludableCommentsFieldSchema) }).prismaModel(__u46u46$u46u46$u46u46$libs$prismadbu46ts.prisma.post);
