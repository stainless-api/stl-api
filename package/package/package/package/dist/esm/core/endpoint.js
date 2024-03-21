export function splitPathIntoParts(path) {
    const [_method, url] = path.split(" ");
    return url
        .split("/")
        .filter((p) => p !== "")
        .map((p) => p.startsWith("{") && p.endsWith("}")
        ? {
            type: "param",
            name: p.replace("{", "").replace("}", ""),
        }
        : {
            type: "resource",
            name: p,
        });
}
//# sourceMappingURL=endpoint.js.map