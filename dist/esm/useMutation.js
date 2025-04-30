export function isMutateOptions(o) {
    return (o != null &&
        typeof o === "object" &&
        (typeof o.onSuccess === "function" ||
            typeof o.onError === "function" ||
            typeof o.onSettled === "function" ||
            (o.query != null && typeof o.query === "object")));
}
//# sourceMappingURL=useMutation.js.map