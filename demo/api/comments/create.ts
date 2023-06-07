import { stl } from "~/libs/stl";
import prisma from "~/libs/prismadb";
import { Comment } from "./models";
import { NotFoundError, UnauthorizedError, z } from "stainless";

export const create = stl.endpoint({
  endpoint: "post /api/comments",
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
