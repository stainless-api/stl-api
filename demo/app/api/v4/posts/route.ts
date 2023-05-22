import { stl } from "~/libs/stl";
import { create } from "~/api/posts/create";
import { list } from "~/api/posts/list";

const routerOptions = {
  basePathMap: { "/api/": "/api/v4/" },
};

export const GET = stl.plugins.next.appRoute(list, routerOptions);
export const POST = stl.plugins.next.appRoute(create, routerOptions);
