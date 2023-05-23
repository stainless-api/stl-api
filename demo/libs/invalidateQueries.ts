import { ClientPromise } from "stainless";
import { InvalidateOptions, QueryClient } from "@tanstack/react-query";

export function invalidateQueries(
  client: QueryClient,
  p: ClientPromise<any>,
  options?: Omit<InvalidateOptions, "queryKey">
): Promise<void> {
  return client.invalidateQueries({
    ...options,
    queryKey: [p.cacheKey],
  });
}
