import {
  AnyEndpoint,
  MakeStainlessPlugin,
  Params,
  PartialStlContext,
} from "stainless";
import { StlUserContext } from "./stl";
import { User } from ".prisma/client";

export const makeCurrentUserPlugin =
  (): MakeStainlessPlugin<StlUserContext> => (stl) => ({
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

      context.currentUser = session?.user as any;
    },
  });