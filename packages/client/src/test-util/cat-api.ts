import { Stl, z } from "stainless";

const stl = new Stl({ plugins: {} });

const cat = z.object({
  name: z.string(),
  color: z.string(),
});

const catPath = z.path({
  catName: z.string(),
});

const createCatBody = z.body({
  name: z.string().trim(),
  color: z.string().trim(),
});

const listCats = stl.endpoint({
  endpoint: "GET /api/cats",
  response: cat.array(),
  handler: async (_params, _context) => {
    return [
      { name: "Shiro", color: "black" },
      { name: "baby!", color: "black" },
    ];
  },
});

const createCat = stl.endpoint({
  endpoint: "POST /api/cats",
  body: createCatBody,
  response: cat,
  handler: async (params, _context) => {
    return { name: params.name, color: params.color };
  },
});

const retrieveCat = stl.endpoint({
  endpoint: "GET /api/cats/{catName}",
  path: catPath,
  response: cat,
  handler: async (params, _context) => {
    return { name: params.catName, color: "black" };
  },
});

const updateCat = stl.endpoint({
  endpoint: "PATCH /api/cats/{catName}",
  path: catPath,
  body: createCatBody.partial(),
  response: cat,
  handler: async (params, _context) => {
    return { name: params.catName, color: "black" };
  },
});

const retrieveLitter = stl.endpoint({
  endpoint: "GET /api/cats/{catName}/litter",
  path: catPath,
  response: cat.array(),
  handler: async (_params, _context) => {
    return [{ name: "baby!", color: "black" }];
  },
});

export const cats = stl.resource({
  summary: "Cats",
  actions: {
    list: listCats,
    create: createCat,
    update: updateCat,
    retrieve: retrieveCat,
    retrieveLitter,
  },
});

export const catApi = stl.api({
  basePath: "/api",
  resources: {
    cats,
  },
});
