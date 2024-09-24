import { Stl, z } from "stainless";

export const complicatedBasePath = "/api/camelCase/kebab-case/v2" as const;

const stl = new Stl({ plugins: {} });

const dog = z.object({
  name: z.string(),
  color: z.string(),
});

const listDogs = stl.endpoint({
  endpoint: `GET ${complicatedBasePath}/dogs`,
  response: dog.array(),
  handler: async (_params, _context) => {
    return [
      { name: "Shiro", color: "black" },
      { name: "baby!", color: "black" },
    ];
  },
});

export const dogs = stl.resource({
  summary: "Dogs",
  actions: {
    list: listDogs,
  },
});
