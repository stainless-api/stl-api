import * as ReactQuery from "./react-query";
function configureMethods(config, queryFn, queryKey) {
    return {
        reactQuery: ReactQuery.configureMethods(config["reactQuery"], queryFn, queryKey),
    };
}
export function getExtensionHandler(config, action, queryFn, queryKey) {
    for (const extension in config) {
        const extensionMethods = configureMethods(config, queryFn, queryKey)[extension];
        if (action in extensionMethods) {
            return extensionMethods[action];
        }
    }
}
//# sourceMappingURL=index.js.map