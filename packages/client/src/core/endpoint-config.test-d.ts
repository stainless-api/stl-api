import { Stl, z } from "stainless";
import { describe, expectTypeOf, test } from "vitest";
import { CallableEndpoint, EndpointClient } from "./endpoint-config";
import { FilterPathParts, SplitPathIntoParts } from "./endpoint-string";

const stl = new Stl({ plugins: {} });

const Cat = z.object({
  name: z.string(),
});

const CatPath = z.path({
  catName: z.string(),
});

const CreateCatBody = z.body({
  name: z.string().trim(),
});

const listCats = stl.endpoint({
  endpoint: "GET /api/cats",
  response: Cat.array(),
  handler: async (_params, _context) => {
    return [{ name: "Shiro" }];
  },
});

const createCat = stl.endpoint({
  endpoint: "POST /api/cats",
  body: CreateCatBody,
  response: Cat,
  handler: async (params, _context) => {
    return { name: params.name };
  },
});

const retrieveCat = stl.endpoint({
  endpoint: "GET /api/cats/{catName}",
  path: CatPath,
  response: Cat,
  handler: async (params, _context) => {
    return { name: params.catName };
  },
});

const cats = stl.resource({
  summary: "Orgs",
  actions: {
    list: listCats,
    create: createCat,
    retrieve: retrieveCat,
  },
});

const api = stl.api({
  basePath: "/api",
  resources: {
    cats,
  },
});

type API = typeof api;
type BasePath = API["basePath"];

describe("Endpoing Config", () => {
  test("Can take an endpoint from an stl config and return a callable function chain", () => {
    type CreateEndpoint = API["resources"]["cats"]["actions"]["create"];
    // type CatClient = CallableEndpoint<CreateEndpoint, BasePath>;
    type CatClient = FilterPathParts<
      SplitPathIntoParts<CreateEndpoint["endpoint"]>,
      BasePath
    >;

    expectTypeOf<CatClient>().toEqualTypeOf<
      [
        {
          type: "resource";
          name: "cats";
        }
      ]
    >();
  });

  test("Can take an endpoint from an stl config and return a callable function chain", () => {
    type CreateEndpoint = API["resources"]["cats"]["actions"]["create"];
    // type CatClient = CallableEndpoint<CreateEndpoint, BasePath>;
    type CatClient = FilterPathParts<
      SplitPathIntoParts<CreateEndpoint["endpoint"]>,
      BasePath
    >;
    type f = CreateEndpoint["path"];

    expectTypeOf<CatClient["cats"]>().toBeFunction();
    expectTypeOf<CatClient["cats"]>().toBeCallableWith({ name: "Shiro" });
  });

  test("", async () => {
    type CreateEndpoint = API["resources"]["cats"]["actions"]["create"];
    type CreateCat = EndpointClient<CreateEndpoint, BasePath>;

    expectTypeOf<CreateCat["cats"]>().toBeFunction();
    expectTypeOf<CreateCat["cats"]>().toBeCallableWith({ name: "Shiro" });
    expectTypeOf<CreateCat["cats"]>().returns.toEqualTypeOf({ name: "Shiro" });

    type RetrieveEndpoint = API["resources"]["cats"]["actions"]["retrieve"];
    type RetrieveCat = EndpointClient<RetrieveEndpoint, BasePath>;

    const client = {} as RetrieveCat;
    const response = await client.cats("shiro").verb({ name: "Shiro" });

    expectTypeOf<RetrieveCat["cats"]>().toBeFunction();
    expectTypeOf<RetrieveCat["cats"]>().toBeFunction();
    expectTypeOf<RetrieveCat["cats"]>().toBeCallableWith("Shiro");
    expectTypeOf<
      ReturnType<RetrieveCat["cats"]>["verb"]
    >().returns.toMatchTypeOf({ name: "Shiro" });
  });
});
