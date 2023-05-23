import { stl } from "~/libs/stl";
import { z } from "stainless";
import prisma from "~/libs/prismadb";
import { User } from "./models";

export const list = stl.endpoint({
  endpoint: "get /api/users",
  response: z.object({ items: z.array(User) }),
  async handler(params, ctx) {
    return {
      items: await prisma.user.findMany({
        orderBy: {
          createdAt: "desc",
        },
      }),
    };
  },
});
