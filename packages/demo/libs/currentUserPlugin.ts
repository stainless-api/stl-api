import {
  AnyEndpoint,
  MakeStainlessPlugin,
  Params,
  PartialStlContext,
} from "@stl-api/stl";
import prisma from "./prismadb";
import { StlUserContext } from "./stl";
import { User } from ".prisma/client";

export const makeCurrentUserPlugin =
  (cfg: {}): MakeStainlessPlugin<StlUserContext> =>
  (stl) => ({
    async middleware<EC extends AnyEndpoint>(
      endpoint: EC,
      params: Params,
      context: PartialStlContext<StlUserContext, EC>
    ) {
      const { session } = context;

      context.requireCurrentUser = (): User => {
        const { currentUser } = context;
        if (!currentUser) {
          throw new stl.UnauthorizedError({ naughty: "you aint logged in!" });
        }
        return currentUser;
      };

      const email = session?.user?.email;
      if (!email) {
        context.currentUser = undefined;
        return;
      }
      const user = await prisma.user.findUnique({
        where: { email },
      });

      context.currentUser = user ?? undefined;
    },
  });
