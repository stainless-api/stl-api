import {
  AnyEndpoint,
  StlContext,
  AnyBaseEndpoint,
  MakeStainlessPlugin,
  Params,
  UnauthorizedError,
} from "stainless";
import { IncomingMessage, ServerResponse } from "http";
import { NextServerContext } from "@stl-api/next";
import { AuthOptions, Session, getServerSession } from "next-auth";

/** An authenticated session, with user data available. */
export interface UserSession extends Session {
  user: Session["user"];
}

declare module "stainless" {
  interface StlContext<EC extends AnyBaseEndpoint> {
    /** If a route is authenticated, handlers will always have access to a valid user session.
    Otherwise, a session is provided if a user is logged in. */
    session: EC["config"] extends { authenticated: true }
      ? UserSession
      : UserSession | undefined;
  }

  interface EndpointConfig {
    authenticated?: boolean;
  }
}

function isUserSession(session: Session): session is UserSession {
  return !!session.user;
}

export const makeNextAuthPlugin =
  ({ authOptions }: { authOptions: AuthOptions }): MakeStainlessPlugin<any> =>
  (stl) => ({
    async middleware<EC extends AnyEndpoint>(
      params: Params,
      context: StlContext<EC>
    ) {
      const {
        args: [req, res],
      } = requireNextServerContext(context);

      // TODO catch invalid credentials errors,
      // send appropriate error response,
      // and somehow signal to stl.execute to early
      // exit

      let session: Session | null | undefined;

      if (req instanceof IncomingMessage && res instanceof ServerResponse) {
        session = await getServerSession(req, res, authOptions);
      } else {
        session = await getServerSession(authOptions);
      }

      if (session && isUserSession(session)) context.session = session;

      // If the endpoint requires authentication, but no user is logged in,
      // throw unauthorized
      if (context.endpoint.config?.authenticated) {
        if (!context.session) throw new UnauthorizedError();
      }
    },
  });

function requireNextServerContext(context: StlContext<any>): NextServerContext {
  const { server } = context;
  if (server?.type !== "nextjs") {
    throw new Error("next-auth plugin only works with nextjs server plugin");
  }
  return server as NextServerContext;
}
