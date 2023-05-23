import { stl } from "~/libs/stl";
import { NotFoundError } from "stainless";
import z from "zod";
import prisma from "~/libs/prismadb";
import { User } from "./models";

export const retrieve = stl.endpoint({
  endpoint: "get /api/users/{userId}",
  path: z.object({
    userId: z.string(),
  }),
  response: User,
  async handler({ userId }, ctx) {
    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!existingUser) throw new NotFoundError();

    const followersCount = await prisma.user.count({
      where: {
        followingIds: {
          has: userId,
        },
      },
    });

    return { ...existingUser, followersCount };
  },
});
