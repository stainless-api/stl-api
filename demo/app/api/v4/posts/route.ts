import { create } from "~/api/posts/create";
import { list } from "~/api/posts/list";
import { stlNextAppRoute } from "@stl-api/next";

const routerOptions = {
  basePathMap: { "/api/": "/api/v4/" },
};

export const GET = stlNextAppRoute(list, routerOptions);
export const POST = stlNextAppRoute(create, routerOptions);
