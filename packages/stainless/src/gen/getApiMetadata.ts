import { mapValues } from "lodash";
import {
  APIDescription,
  APIMetadata,
  ActionMetadata,
  AnyEndpoint,
} from "../stl";

export function getApiMetadata({
  openapi,
  topLevel,
  resources,
}: APIDescription<any, any>): APIMetadata {
  return getResourceMetadata({
    actions: {
      ...topLevel?.actions,
      ...(openapi?.endpoint !== false
        ? {
            getOpenapi: {
              endpoint:
                typeof openapi.endpoint === "string"
                  ? openapi.endpoint
                  : "get /TODO",
            },
          }
        : null),
    },
    namespacedResources: resources,
  });
}

type ResourceForGetMetadata = {
  actions?: Record<string, AnyEndpoint>;
  namespacedResources?: Record<string, ResourceForGetMetadata>;
};

export function getResourceMetadata({
  actions,
  namespacedResources,
}: ResourceForGetMetadata): APIMetadata {
  return {
    actions: actions ? mapValues(actions, getActionMetadata) : undefined,
    namespacedResources: namespacedResources
      ? mapValues(namespacedResources, getResourceMetadata)
      : undefined,
  };
}

function getActionMetadata({ endpoint }: AnyEndpoint): ActionMetadata {
  return { endpoint };
}
