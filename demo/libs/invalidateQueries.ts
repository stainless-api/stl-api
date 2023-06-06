import { InvalidateOptions, QueryClient } from "@tanstack/react-query";
import { ClientPromise } from "@stl-api/react-query";

export function invalidateQueries(
  client: QueryClient,
  p: ClientPromise<any>,
  options?: Omit<InvalidateOptions, "queryKey">
): Promise<void> {
  return client.invalidateQueries({
    ...options,
    queryKey: p.queryKey,
  });
}
