import { stl } from "../../libs/stl";

type PathParams = {
  id: number;
};

type QueryParams = {
  boolean?: boolean;
  number?: number;
  string?: string;
  date?: Date;
};

type Response = PathParams & QueryParams;

export const retrieve = stl
  .types<{ path: PathParams; query: QueryParams; response: Response }>()
  .endpoint({
    endpoint: "GET /api/params/{id}",
    async handler(params, ctx) {
      return params;
    },
  });
