import { Endpoint, SplitPathIntoParts } from "./endpoint-string";

export function splitPathIntoParts<P extends Endpoint>(path: P) {
  const [_method, url] = path.split(" ");
  return url
    .split("/")
    .filter((p) => p !== "")
    .map((p) =>
      p.startsWith("{") && p.endsWith("}")
        ? {
            type: "param",
            name: p.replace("{", "").replace("}", ""),
          }
        : {
            type: "resource",
            name: p,
          },
    ) as SplitPathIntoParts<P>;
}
