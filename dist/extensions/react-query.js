"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureMethods = void 0;
function configureMethods(config, queryFn, queryKey) {
    return {
        useQuery(bodyOrOptions, options) {
            var _a;
            const _b = (_a = options !== null && options !== void 0 ? options : bodyOrOptions) !== null && _a !== void 0 ? _a : {}, { query } = _b, reactQueryOptions = __rest(_b, ["query"]);
            return config.useQuery(Object.assign(Object.assign({}, reactQueryOptions), { queryFn,
                queryKey }));
        },
        useSuspenseQuery(bodyOrOptions, options) {
            var _a;
            const _b = (_a = options !== null && options !== void 0 ? options : bodyOrOptions) !== null && _a !== void 0 ? _a : {}, { query } = _b, reactQueryOptions = __rest(_b, ["query"]);
            return config.useSuspenseQuery(Object.assign(Object.assign({}, reactQueryOptions), { queryFn,
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