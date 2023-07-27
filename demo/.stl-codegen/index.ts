export const typeSchemas = {
  "POST /api/posts": () =>
    import("./api/posts/create.js").then((mod) => mod.POST__api_posts),
  "GET /api/posts/{post}": () =>
    import("./api/posts/retrieve.js").then((mod) => mod.GET__api_posts_$post$),
};
