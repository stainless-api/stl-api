export const typeSchemas = {
  "post /api/posts": () =>
    import("./api/posts/create.js").then((mod) => mod.post__api_posts),
  "get /api/posts/{post}": () =>
    import("./api/posts/retrieve.js").then((mod) => mod.get__api_posts_$post$),
};