"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureMethods = void 0;
function configureMethods(config, queryFn, queryKey) {
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
exports.configureMethods = configureMethods;
//# sourceMappingURL=react-query.js.map