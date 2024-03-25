"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateApiClient = exports.makeClientWithExplicitTypes = exports.makeClient = void 0;
var api_client_1 = require("./core/api-client");
Object.defineProperty(exports, "makeClient", { enumerable: true, get: function () { return api_client_1.makeClientWithInferredTypes; } });
Object.defineProperty(exports, "makeClientWithExplicitTypes", { enumerable: true, get: function () { return api_client_1.makeClientWithExplicitTypes; } });
var generate_types_1 = require("./codegen/generate-types");
Object.defineProperty(exports, "generateApiClient", { enumerable: true, get: function () { return generate_types_1.generateOutput; } });
//# sourceMappingURL=index.js.map