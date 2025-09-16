"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openapiSpec = void 0;
const stl_1 = require("./stl");
const zod_openapi_1 = require("zod-openapi");
const lodash_1 = require("lodash");
function allModels(resource) {
    return Object.assign(Object.assign({}, resource.models), Object.assign({}, ...Object.keys(resource.namespacedResources || {}).map((k) => allModels(resource.namespacedResources[k]))));
}
function openapiSpec(apiDescription) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const models = allModels({
            models: (_a = apiDescription.topLevel) === null || _a === void 0 ? void 0 : _a.models,
            namespacedResources: apiDescription.resources,
        });
        for (const name in models) {
            models[name]["x-stainless-modelName"] = (0, lodash_1.snakeCase)(name);
        }
        const endpoints = (0, stl_1.allEndpoints)({
            actions: (_b = apiDescription.topLevel) === null || _b === void 0 ? void 0 : _b.actions,
            namespacedResources: apiDescription.resources,
        });
        yield Promise.all(endpoints.map((e) => e.stl.loadEndpointTypeSchemas(e)));
        const paths = {};
        for (const route of endpoints) {
            const [httpMethod, path] = route.endpoint.split(" ", 2);
            const lowerMethod = httpMethod.toLowerCase();
            const operation = {
                summary: route.summary,
                description: route.description,
                requestParams: {
                    path: route.path,
                    query: route.query,
                    // TODO
                    // header: route.header,
                },
                requestBody: {
                    content: {
                        "application/json": {
                            schema: route.body,
                        },
                    },
                },
                responses: {
                    200: {
                        description: "success",
                        content: route.response
                            ? {
                                "application/json": {
                                    schema: route.response,
                                },
                            }
                            : {},
                    },
                },
            };
            (_c = paths[path]) !== null && _c !== void 0 ? _c : (paths[path] = {});
            paths[path][lowerMethod] = operation;
        }
        const document = (0, zod_openapi_1.createDocument)({
            openapi: "3.1.0",
            info: {
                version: "1.0.0",
                title: "My API",
            },
            servers: [{ url: "v1" }],
            components: {
                schemas: models,
            },
            paths,
        });
        return document;
    });
}
exports.openapiSpec = openapiSpec;
//# sourceMappingURL=openapiSpec.js.map