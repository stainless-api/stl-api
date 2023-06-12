import {
  AnyEndpoint,
  MakeStainlessPlugin,
  Params,
  StlContext,
  UnauthorizedError,
} from "stainless";
import { User } from ".prisma/client";

export const makeCurrentUserPlugin = (): MakeStainlessPlugin => (stl) => ({
  async middleware<EC extends AnyEndpoint>(
    params: Params,
    context: StlContext<EC>
  ) {
    const { session } = context;

    context.requireCurrentUser = (): User => {
      const { currentUser } = context;
      if (!currentUser) {
        throw new UnauthorizedError({ naughty: "you aint logged in!" });
      }
      return currentUser;
    };

    context.currentUser = session?.user as any;
  },
});
