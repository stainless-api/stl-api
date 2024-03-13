import { Stl, z } from "stainless";

const stl = new Stl({ plugins: {} });

const dogPath = z.path({
  dogName: z.string(),
});

const dogTreat = z.object({
  yummy: z.boolean(),
});

const getDogTreat = stl.endpoint({
  endpoint: "GET /api/dogs/{dogName}/dog-treats",
  path: dogPath,
  response: dogTreat,
  handler: async (_params, _context) => {
    return { yummy: true };
  },
});

export const dogTreats = stl.resource({
  summary: "Dog Treats",
  actions: {
    get: getDogTreat,
  },
});
