import { User, UserSelection } from "../users/models";
import { Comment, CommentSelection } from "../comments/models";
import prisma from "~/libs/prismadb";
import { z } from "stainless";

const Post0 = z.response({
  id: z.string().uuid(),
  body: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string().uuid(),
  likedIds: z.array(z.string().uuid()),
  image: z.string().nullable().optional(),
});

type Post1 = z.CircularModel<
  typeof Post0,
  {
    user?: z.ExpandableZodType<typeof User>;
    user_fields?: z.SelectableZodType<typeof User>;
    comments?: z.ExpandableZodType<z.ZodArray<typeof Comment>>;
    comments_fields?: z.SelectableZodType<z.ZodArray<typeof Comment>>;
  }
>;
const Post1: Post1 = Post0.extend({
  user: z.lazy(() => User).expandable(),
  user_fields: z.lazy(() => UserSelection).selectable(),
  comments: z.array(z.lazy(() => Comment)).expandable(),
  comments_fields: z.array(z.lazy(() => CommentSelection)).selectable(),
});

export const Post = Post1.prismaModel(prisma.post);

export const PostSelection = Post.selection();

export const PostPage = z.pageResponse(Post);
