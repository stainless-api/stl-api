import { z } from "stainless";
import { PostType as __symbol_PostType } from "./retrieve";
import { prisma } from "../../../libs/prismadb";
export const Query: z.ZodTypeAny = z.object({ include: z.includes(z.lazy(() => __symbol_PostType), 3).optional(), select: z.selects(z.lazy(() => __symbol_PostType), 3).optional() });
export const Path: z.ZodTypeAny = z.object({ post: z.string().prismaModelLoader(prisma.post) });
export const PostType: z.ZodTypeAny = z.any();
export const get__api_posts_$post$: any = { query: z.lazy(() => Query), path: z.lazy(() => Path), response: z.lazy(() => __symbol_PostType) };
