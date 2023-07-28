export const typeSchemas = {
  "GET /api/params/{id}": () =>
    import("./api/params/retrieve.js").then((mod) => mod.GET__api_params_$id$),
  "POST /api/posts": () =>
    import("./api/posts/index.js").then((mod) => mod.POST__api_posts),
  "GET /api/posts/{post}": () =>
    import("./api/posts/index.js").then((mod) => mod.GET__api_posts_$post$),
};
