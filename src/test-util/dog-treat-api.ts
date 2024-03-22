import { Stl, z } from "stainless";

const stl = new Stl({ plugins: {} });

const dogPath = z.path({
  dogName: z.string(),
});

const dogTreat = z.object({
  yummy: z.boolean(),
});

const listDogTreat = stl.endpoint({
  endpoint: "GET /api/dogs/{dogName}/dog-treats",
  path: dogPath,
  response: dogTreat.array(),
  handler: async (_params, _context) => {
    return [{ yummy: true }];
  },
});

const treatPath = z.path({
  dogName: z.string(),
  treatId: z.string(),
});

const updateTreatBody = z.body({
  yummy: z.boolean(),
});

const retrieveDogTreat = stl.endpoint({
  endpoint: "GET /api/dogs/{dogName}/dog-treats/{treatId}",
  path: treatPath,
  response: dogTreat,
  handler: async (_params, _context) => {
    return { yummy: true };
  },
});

const updateDogTreat = stl.endpoint({
  endpoint: "PATCH /api/dogs/{dogName}/dog-treats/{treatId}",
  path: treatPath,
  body: updateTreatBody,
  response: dogTreat,
  handler: async (params, _context) => {
    return { yummy: params.yummy };
  },
});

export const dogTreats = stl.resource({
  summary: "Dog Treats",
  actions: {
    list: listDogTreat,
    retrieveTreat: retrieveDogTreat,
    update: updateDogTreat,
  },
});
