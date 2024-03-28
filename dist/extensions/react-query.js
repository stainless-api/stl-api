"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureMethods = void 0;
function configureMethods(config, queryFn, queryKey) {
    return {
        useQuery(options) {
            return config.useQuery(Object.assign(Object.assign({}, options), { queryFn,
                queryKey }));
        },
        useSuspenseQuery(options) {
            return config.useSuspenseQuery(Object.assign(Object.assign({}, options), { queryFn,
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
exports.configureMethods = configureMethods;
//# sourceMappingURL=react-query.js.map