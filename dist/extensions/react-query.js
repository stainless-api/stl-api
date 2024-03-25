"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureMethods = void 0;
function configureMethods(config, queryFn, queryKey) {
    return {
        useQuery(bodyOrQueryOrOptions, queryOrOptions, options) {
            var _a;
            return config.useQuery(Object.assign(Object.assign({}, ((_a = options !== null && options !== void 0 ? options : queryOrOptions) !== null && _a !== void 0 ? _a : bodyOrQueryOrOptions)), { queryFn,
                queryKey }));
        },
        useSuspenseQuery(bodyOrQueryOrOptions, queryOrOptions, options) {
            var _a;
            return config.useSuspenseQuery(Object.assign(Object.assign({}, ((_a = options !== null && options !== void 0 ? options : queryOrOptions) !== null && _a !== void 0 ? _a : bodyOrQueryOrOptions)), { queryFn,
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