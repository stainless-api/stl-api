export const endpointToSchema = {
  "post /api/posts": import("./api/posts/create").then(
    (mod) => mod.post__api_posts
  ),
  "get /api/posts/{post}": import("./api/posts/retrieve").then(
    (mod) => mod.get__api_posts_$post$
  ),
};
