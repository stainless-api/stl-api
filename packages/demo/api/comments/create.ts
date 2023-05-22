import { stl } from "@/libs/stl";
import { NotFoundError } from "@stl-api/stl";
import z from "zod";
import prisma from "@/libs/prismadb";
import { Comment } from "./models";

export const create = stl.endpoint({
  endpoint: "post /api/comments",

  query: z.object({
    postId: z.string(),
  }),
  body: z.object({
    body: z.string(),
  }),
  response: Comment,
  async handler({ postId, body }, ctx) {
    const userId = ctx.currentUser?.id;
    if (!userId) {
      throw new stl.UnauthorizedError({ message: "You are not logged in" });
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
