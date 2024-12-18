import { Result } from "hono/router";
import { TrieRouter } from "hono/router/trie-router";
import { AnyEndpoint } from "stainless";
export declare function makeRouteMatcher(endpoints: AnyEndpoint[]): TrieRouter<AnyEndpoint>;
export declare function isValidRouteMatch(m: Result<AnyEndpoint>): boolean;
//# sourceMappingURL=routeMatcher.d.ts.map