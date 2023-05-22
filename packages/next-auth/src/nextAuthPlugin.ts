import {
  AnyEndpoint,
  PartialStlContext,
  MakeStainlessPlugin,
  Params,
} from "@stl-api/stl";
import { IncomingMessage, ServerResponse } from "http";
import { NextServerContext } from "@stl-api/next";
import { AuthOptions, Session, getServerSession } from "next-auth";

declare module "@stl-api/stl" {
  interface StlContext<EC extends AnyEndpoint> {
    session?: Session | null;
  }
}

export const makeNextAuthPlugin =
  ({ authOptions }: { authOptions: AuthOptions }): MakeStainlessPlugin<any> =>
  (stl) => ({
    async middleware<EC extends AnyEndpoint>(
      endpoint: EC,
      params: Params,
      context: PartialStlContext<any, EC>
    ) {
      const {
        args: [req, res],
      } = requireNextServerContext(context);
      // TODO catch invalid credentials errors,
      // send appropriate error response,
      // and somehow signal to stl.execute to early
      // exit
      if (req instanceof IncomingMessage && res instanceof ServerResponse) {
        context.session = await getServerSession(req, res, authOptions);
      } else {
        context.session = await getServerSession(authOptions);
      }
    },
  });

function requireNextServerContext(
  context: PartialStlContext<any, any>
): NextServerContext {
  context.prisma;
  const { server } = context;
  if (server?.type !== "nextjs") {
    throw new Error("next-auth plugin only works with nextjs server plugin");
  }
  return server as NextServerContext;
}
