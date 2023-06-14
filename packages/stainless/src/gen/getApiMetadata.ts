import { isEmpty, mapValues } from "lodash";
import {
  APIMetadata,
  ActionMetadata,
  AnyAPIDescription,
  AnyEndpoint,
  parseEndpoint,
} from "../stl";
import { guessRequestEndpoint } from "../client";

export function getApiMetadata({
  basePath,
  topLevel,
  resources,
}: AnyAPIDescription): APIMetadata {
  type ResourceForGetMetadata = {
    actions?: Record<string, AnyEndpoint>;
    namespacedResources?: Record<string, ResourceForGetMetadata>;
  };

  /**
   * Returns true iff the client would guess the correct method and path
   * for the given resource path and action
   */
  function isRegular(
    resourcePath: string[],
    action: string,
    endpoint: AnyEndpoint
  ): boolean {
    const guessed = guessRequestEndpoint(basePath, resourcePath, action);
    return (
      // is guessed exactly
      endpoint.endpoint === guessed ||
      // is guessed + one path param
      (endpoint.endpoint.startsWith(guessed + "/") &&
        /\{[^}/]+\}/.test(endpoint.endpoint.substring(guessed.length + 1)))
    );
  }

  function getResourceMetadata(
    { actions, namespacedResources }: ResourceForGetMetadata,
    path: string[] = []
  ): APIMetadata {
    const result: APIMetadata = {};
    if (actions) {
      for (const action of Object.keys(actions)) {
        const endpoint = actions[action];
        if (isRegular(path, action, endpoint)) continue;
        const resultActions = result.actions || (result.actions = {});
        resultActions[action] = getActionMetadata(endpoint);
      }
    }
    if (namespacedResources) {
      for (const name of Object.keys(namespacedResources)) {
        const resource = namespacedResources[name];
        const metadata = getResourceMetadata(resource, [...path, name]);
        if (isEmpty(metadata)) continue;
        const resultResources =
          result.namespacedResources || (result.namespacedResources = {});
        resultResources[name] = metadata;
      }
    }
    return result;
  }

  function getActionMetadata({ endpoint }: AnyEndpoint): ActionMetadata {
    return { endpoint };
  }

  return getResourceMetadata({
    actions: topLevel.actions,
    namespacedResources: resources,
  });
}
