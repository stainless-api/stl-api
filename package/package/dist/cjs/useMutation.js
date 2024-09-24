"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMutateOptions = void 0;
function isMutateOptions(o) {
    return (o != null &&
        typeof o === "object" &&
        (typeof o.onSuccess === "function" ||
            typeof o.onError === "function" ||
            typeof o.onSettled === "function" ||
            (o.query != null && typeof o.query === "object")));
}
exports.isMutateOptions = isMutateOptions;
//# sourceMappingURL=useMutation.js.map