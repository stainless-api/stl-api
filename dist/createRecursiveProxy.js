"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRecursiveProxy = void 0;
function createRecursiveProxy(callback, path) {
    const proxy = new Proxy(() => {
        // dummy no-op function since we don't have any
        // client-side target we want to remap to
    }, {
        get(_obj, key) {
            if (typeof key !== "string")
                return undefined;
            // Recursively compose the full path until a function is invoked
            return createRecursiveProxy(callback, [...path, key]);
        },
        apply(_1, _2, args) {
            // Call the callback function with the entire path we
            // recursively created and forward the arguments
            return callback({
                path,
                args,
            });
        },
    });
    return proxy;
}
exports.createRecursiveProxy = createRecursiveProxy;
//# sourceMappingURL=createRecursiveProxy.js.map