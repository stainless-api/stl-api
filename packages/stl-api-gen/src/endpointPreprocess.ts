import * as tm from "ts-morph";

import { isSymbolStlMethod } from "./utils";
import { getPropertyDeclaration } from "ts-to-zod/dist/convertType";

export type NodeType = [tm.Node, tm.Type];

export interface EndpointTypeInstance {
  endpointPath: string;
  callExpression: tm.Node,
  query?: NodeType,
  path?: NodeType,
  body?: NodeType,
  response?: NodeType,
}

// call expression is the expression (...endpoint())
export function handleEndpoint(callExpression: tm.CallExpression): EndpointTypeInstance | undefined {
  // lhs is the value on which .endpoint is being called
  const lhs = callExpression.getExpression();
  const endpointArgs = callExpression.getArguments();
  if (endpointArgs.length !== 1) return;
  const [endpointArg] = endpointArgs;
  const endpointType = endpointArg.getType();

  const endpointProperty = endpointType.getProperty("endpoint");
  if (!endpointProperty) return;
  const endpointPropertyType =
    endpointProperty.getTypeAtLocation(callExpression);
  const endpointPath = endpointPropertyType.getLiteralValue();
  if (typeof endpointPath !== "string") return;

  if (lhs instanceof tm.PropertyAccessExpression) {
    const typesExpr = lhs.getExpression();
    // we want .endpoint to be called on stl.types<{...}>()
    if (typesExpr instanceof tm.CallExpression) {
      const typesReceiver = typesExpr.getExpression();
      const symbol = typesReceiver.getSymbol();
      if (!symbol || !isSymbolStlMethod(symbol)) return;

      if (symbol.getEscapedName() !== "types") return;

      // types() cannot be called with arguments
      if (typesExpr.getArguments().length) return;

      const typeArguments = typesExpr.getTypeArguments();
      if (typeArguments.length !== 1) return;
      const [typeRef] = typeArguments;
      const schemaTypes = typeRef.getType();

      if (!schemaTypes.isObject()) return;

      let queryNodeType;
      let pathNodeType;
      let bodyNodeType;
      let responseNodeType;
      
      for (const property of schemaTypes.getProperties()) {
        const name = property.getName();
        switch (name) {
          case "query":
            queryNodeType = propertyToNodeType(property, typesExpr);
            break;
          case "path":
            pathNodeType = propertyToNodeType(property, typesExpr);
            break;
          case "body":
            bodyNodeType = propertyToNodeType(property, typesExpr);
            break;
          case "response":
            responseNodeType = propertyToNodeType(property, typesExpr);
            break;
          default:
            // TODO: add diagnostic for ignored field
            continue;
        }
      }
      
      return {
        endpointPath,
        callExpression,
        query: queryNodeType,
        path: pathNodeType,
        body: bodyNodeType,
        response: responseNodeType,
      }
    }
  }
}

function propertyToNodeType(property: tm.Symbol, location: tm.Node): NodeType {
  const node = getPropertyDeclaration(property);
  if (!node) throw new Error("internal error: invalid property encountered");
  return [node, property.getTypeAtLocation(location)];
}
