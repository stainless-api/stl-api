import { isEmpty, mapValues } from "lodash";
import {
  APIDescription,
  APIMetadata,
  ActionMetadata,
  AnyEndpoint,
} from "../stl";

export function getApiMetadata({
  topLevel,
  resources,
}: APIDescription<any, any>): APIMetadata {
  return getResourceMetadata({
    actions: topLevel.actions,
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
    ...(!isEmpty(actions)
      ? { actions: mapValues(actions, getActionMetadata) }
      : null),
    ...(!isEmpty(namespacedResources)
      ? {
          namespacedResources: mapValues(
            namespacedResources,
            getResourceMetadata
          ),
        }
      : null),
  };
}

function getActionMetadata({ endpoint }: AnyEndpoint): ActionMetadata {
  return { endpoint };
}
