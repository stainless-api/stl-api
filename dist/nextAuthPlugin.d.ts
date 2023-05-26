import { MakeStainlessPlugin } from "stainless";
import { AuthOptions, Session } from "next-auth";
declare module "stainless" {
    interface StlContext<EC extends AnyEndpoint> {
        session?: Session | null;
    }
}
export declare const makeNextAuthPlugin: ({ authOptions }: {
    authOptions: AuthOptions;
}) => MakeStainlessPlugin<any>;
//# sourceMappingURL=nextAuthPlugin.d.ts.map