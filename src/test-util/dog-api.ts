import { Stl, z } from "stainless";

const stl = new Stl({ plugins: {} });

const dog = z.object({
  name: z.string(),
  color: z.string(),
});

const dogPath = z.path({
  dogName: z.string(),
});

const createDogBody = z.body({
  name: z.string().trim(),
  color: z.string().trim(),
});

const listDogs = stl.endpoint({
  endpoint: "GET /api/dogs",
  response: dog.array(),
  handler: async (_params, _context) => {
    return [
      { name: "Shiro", color: "black" },
      { name: "baby!", color: "black" },
    ];
  },
});

const createDog = stl.endpoint({
  endpoint: "POST /api/dogs",
  body: createDogBody,
  response: dog,
  handler: async (params, _context) => {
    return { name: params.name, color: params.color };
  },
});

const retrieveDog = stl.endpoint({
  endpoint: "GET /api/dogs/{dogName}",
  path: dogPath,
  response: dog,
  handler: async (params, _context) => {
    return { name: params.dogName, color: "black" };
  },
});

const updateDog = stl.endpoint({
  endpoint: "PATCH /api/dogs/{dogName}",
  path: dogPath,
  body: createDogBody.partial(),
  response: dog,
  handler: async (params, _context) => {
    return { name: params.dogName, color: "black" };
  },
});

const retrieveLitter = stl.endpoint({
  endpoint: "GET /api/dogs/{dogName}/litter",
  path: dogPath,
  response: dog.array(),
  handler: async (_params, _context) => {
    return [{ name: "baby!", color: "black" }];
  },
});

export const dogs = stl.resource({
  summary: "Dogs",
  actions: {
    list: listDogs,
    create: createDog,
    retrieve: retrieveDog,
    update: updateDog,
    retrieveLitter,
  },
});
