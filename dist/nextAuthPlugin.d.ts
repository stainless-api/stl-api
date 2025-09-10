import { MakeStainlessPlugin } from "stainless";
import { AuthOptions, Session } from "next-auth";
/** An authenticated session, with user data available. */
export interface UserSession extends Session {
    user: Session["user"];
}
declare module "stainless" {
    interface StlContext<EC extends AnyBaseEndpoint> {
        /** If a route is authenticated, handlers will always have access to a valid user session.
        Otherwise, a session is provided if a user is logged in. */
        session: EC["config"] extends {
            authenticated: true;
        } ? UserSession : UserSession | undefined;
    }
    interface EndpointConfig {
        authenticated?: boolean;
    }
}
export declare const makeNextAuthPlugin: ({ authOptions }: {
    authOptions: AuthOptions;
}) => MakeStainlessPlugin<any>;
//# sourceMappingURL=nextAuthPlugin.d.ts.map