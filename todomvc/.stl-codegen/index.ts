export const typeSchemas = {
  "GET /items/:item": () =>
    import("./src/index.js").then((mod) => mod.GET__items_$58item),
  "POST /items": () => import("./src/index.js").then((mod) => mod.POST__items),
};
