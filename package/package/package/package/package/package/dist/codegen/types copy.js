"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.generateOutput = void 0;
const typescript_1 = __importStar(require("typescript"));
const endpoint_1 = require("../core/endpoint");
// create name property
const nameProp = typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("name"), undefined, typescript_1.factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.StringKeyword));
// create age property
const ageProp = typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("age"), undefined, typescript_1.factory.createKeywordTypeNode(typescript_1.default.SyntaxKind.NumberKeyword));
// create User type
const userType = typescript_1.factory.createTypeAliasDeclaration([typescript_1.factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)], typescript_1.factory.createIdentifier("User"), undefined, typescript_1.factory.createTypeLiteralNode([nameProp, ageProp]));
const userProp = typescript_1.factory.createPropertySignature(undefined, typescript_1.factory.createIdentifier("user"), undefined, typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createIdentifier("User"), undefined));
const adminType = typescript_1.factory.createTypeAliasDeclaration([typescript_1.factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)], typescript_1.factory.createIdentifier("Admin"), undefined, typescript_1.factory.createTypeLiteralNode([userProp]));
function getResources(resources, path) {
    return Object.entries(resources).flatMap((_a) => {
        var [resourceName, _b] = _a, { namespacedResources } = _b, resource = __rest(_b, ["namespacedResources"]);
        const resourcePath = path ? [path, resourceName].join(".") : resourceName;
        if (namespacedResources) {
            return [
                { resourceName, resourcePath, resource },
                ...getResources(namespacedResources, resourcePath),
            ];
        }
        return [{ resourceName, resourcePath, resource }];
    });
}
function getEndpoints(resources) {
    return resources.flatMap(({ resourcePath, resource }) => Object.entries(resource.actions).map(([actionName, action]) => {
        return {
            actionName,
            actionPath: [resourcePath, actionName].join("."),
            endpoint: action === null || action === void 0 ? void 0 : action.endpoint,
            pathParts: [
                ...(0, endpoint_1.splitPathIntoParts)(action.endpoint),
                { type: "action", name: actionName },
            ],
            pathParams: action === null || action === void 0 ? void 0 : action.path,
            body: action === null || action === void 0 ? void 0 : action.body,
            query: action === null || action === void 0 ? void 0 : action.query,
            handler: action === null || action === void 0 ? void 0 : action.handler,
            response: action === null || action === void 0 ? void 0 : action.response,
        };
    }));
}
const newApiResource = {
    asResource: {},
    asParam: [],
};
function assertUnreachable(x) {
    throw new Error(`Unhandled switch case: ${JSON.stringify(x)}`);
}
function recursiveSet(obj = {}, items) {
    const [current, ...rest] = items;
    if (!current) {
        return;
    }
    if (current.type === "action") {
        obj[current.name] = "action";
        return;
    }
    if (!obj[current.name]) {
        obj[current.name] = {};
    }
    if (current.type === "resource") {
        if (!obj[current.name].asResource) {
            obj[current.name].asResource = {};
        }
        recursiveSet(obj[current.name].asResource, rest);
        return;
    }
    if (current.type === "param") {
        if (!obj[current.name].asParam) {
            obj[current.name].asParam = [];
        }
        const returnValue = {};
        recursiveSet(returnValue, rest);
        obj[current.name].asParam = [...obj[current.name].asParam, returnValue];
        return;
    }
}
function nestEndpoints(endpoints, basePath = "") {
    const api = {};
    endpoints.forEach((endpoint) => {
        const filterdPathParts = endpoint.pathParts.filter((pathPart) => pathPart.name !== basePath.replace("/", ""));
        recursiveSet(api, filterdPathParts);
    });
    return api;
}
// function makeAction(name: string) {
//   const addFunc = ts.factory.createFunctionDeclaration(
//     /* modifiers */,
//     /* asteriskToken */,
//     /* name */,
//     /* typeParameters */,
//     /* parameters */,
//     /* type */,
//     /* body */
//   )
//   return factory.createPropertySignature(
//     undefined,
//     factory.createIdentifier(name),
//     undefined,
//     factory.createFunctionTypeNode(undefined, [], addFunc)
//   );
// }
// type ApiMap = ReturnType<typeof nestEndpoints>
function makeParameterType(name, output) {
    return typescript_1.default.factory.createFunctionTypeNode(undefined, [
        typescript_1.factory.createParameterDeclaration(undefined, undefined, name, undefined, typescript_1.default.factory.createTypeReferenceNode("string")),
    ], typescript_1.default.factory.createTypeReferenceNode("string"));
}
function makeResourceType(name, value) {
    return typescript_1.default.factory.createInterfaceDeclaration(undefined, name, undefined, undefined, 
    // [ts.factory.createPropertySignature(
    //   undefined,
    //   'hi',
    //   undefined,
    //   ts.factory.createTypeReferenceNode("string")
    // )],
    Object.entries(value).flatMap(([k, v]) => {
        return typescript_1.default.factory.createPropertySignature(undefined, k, undefined, makeType([k, v]));
    }));
}
function makeAction(name) {
    const body = typescript_1.factory.createParameterDeclaration(undefined, undefined, name, undefined, typescript_1.default.factory.createTypeReferenceNode("string"));
    const returnType = typescript_1.default.factory.createTypeReferenceNode("string");
    return typescript_1.default.factory.createFunctionTypeNode(undefined, [body], returnType);
}
function makeType([name, value]) {
    if (value.asParam) {
        return makeParameterType(name);
    }
    if (value.asResource) {
        return makeResourceType(name, value.asResource);
    }
    return makeAction(name);
}
function makeTypes(apiMap) {
    const types = Object.entries(apiMap).flatMap(makeType);
    return types;
}
function generateOutput(api, config) {
    const resources = getResources(api.resources);
    const endpoints = getEndpoints(resources);
    const apiMap = nestEndpoints(endpoints, config.basePath);
    console.log(JSON.stringify(apiMap, null, 4));
    const types = makeTypes(apiMap);
    const nodes = typescript_1.factory.createNodeArray(types);
    const sourceFile = typescript_1.default.createSourceFile("placeholder.ts", "", typescript_1.default.ScriptTarget.ESNext, true, typescript_1.default.ScriptKind.TS);
    const printer = typescript_1.default.createPrinter();
    const outputFile = printer.printList(typescript_1.default.ListFormat.MultiLine, nodes, sourceFile);
    return outputFile;
}
exports.generateOutput = generateOutput;
//# sourceMappingURL=types%20copy.js.map