export function configureMethods(config, queryFn, queryKey) {
    return {
        useQuery(bodyOrOptions, options) {
            return config.useQuery(Object.assign(Object.assign({}, (options !== null && options !== void 0 ? options : bodyOrOptions)), { queryFn,
                queryKey }));
        },
        useSuspenseQuery(bodyOrOptions, options) {
            return config.useSuspenseQuery(Object.assign(Object.assign({}, (options !== null && options !== void 0 ? options : bodyOrOptions)), { queryFn,
                queryKey }));
        },
        useMutation(options) {
            return config.useMutation(Object.assign(Object.assign({}, options), { mutationFn: queryFn }));
        },
        getQueryKey() {
            return queryKey;
        },
    };
}
//# sourceMappingURL=react-query.js.map