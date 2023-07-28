import { stl } from "../../libs/stl";
import { User, UserSelection } from "../users/index";
import { Post, PostSelection } from "../posts/index";
import { NotFoundError, UnauthorizedError, z } from "stainless";
import prisma from "../../libs/prismadb";

const Comment0 = z.response({
  id: z.string().uuid(),

  body: z.string(),

  createdAt: z.date(),
  updatedAt: z.date(),

  userId: z.string().uuid(),
  postId: z.string().uuid(),
});

type Comment1 = z.CircularModel<
  typeof Comment0,
  {
    user?: z.IncludableZodType<typeof User>;
    user_fields?: z.SelectableZodType<typeof User>;
    post?: z.IncludableZodType<typeof Post>;
    post_fields?: z.SelectableZodType<typeof Post>;
  }
>;

const Comment1: Comment1 = Comment0.extend({
  user: z.lazy(() => User).includable(),
  user_fields: z.lazy(() => UserSelection).selectable(),
  post: z.lazy(() => Post).includable(),
  post_fields: z.lazy(() => PostSelection).selectable(),
});

export const Comment = Comment1.prismaModel(prisma.comment);

export const CommentSelection = Comment.selection();

export const create = stl.endpoint({
  endpoint: "POST /api/comments",
  response: Comment,

  query: z.query({
    postId: z.string(),
  }),
  body: z.body({
    body: z.string(),
  }),

  async handler({ postId, body }, ctx) {
    const userId = ctx.currentUser?.id;
    if (!userId) {
      throw new UnauthorizedError({ message: "You are not logged in" });
    }

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });
    if (!post) throw new NotFoundError({ message: "post not found" });

    const comment = await prisma.comment.create({
      data: {
        body,
        userId,
        postId,
      },
    });

    if (post.userId) {
      await prisma.notification.create({
        data: {
          body: "Someone replied on your tweet!",
          userId: post.userId,
        },
      });

      await prisma.user.update({
        where: {
          id: post.userId,
        },
        data: {
          hasNotification: true,
        },
      });
    }

    return comment;
  },
});

export const comments = stl.resource({
  summary: "comments",
  internal: false,
  models: {
    Comment,
    CommentSelection,
  },
  actions: {
    create,
  },
});
