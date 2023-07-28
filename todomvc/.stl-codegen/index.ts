export const typeSchemas = {
  "GET /items/:item": () =>
    import("./src/index").then((mod) => mod.GET__items_$58item),
  "POST /items": () => import("./src/index").then((mod) => mod.POST__items),
};
