import { stl } from "../../libs/stl";
import { NotFoundError, z } from "stainless";
import prisma from "../../libs/prismadb";
import { User } from "./models";

export const retrieve = stl.endpoint({
  endpoint: "GET /api/users/{userId}",
  response: User,

  path: z.path({
    userId: z.string(),
  }),
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
