import { Stl } from "stainless";
import { cats } from "../test-util/cat-api";
import { dogs } from "../test-util/dog-api";
import * as LongBasePath from "../test-util/long-base-path-api";
import { users } from "../test-util/user-api";
import { dogTreats } from "../test-util/dog-treat-api";

export async function mockFetchImplementation(
  input: string | URL | Request,
  options?: RequestInit
) {
  const mockCat = { name: "Shiro", color: "black" };
  let payload;
  let update;

  switch (`${options?.method} ${input}`) {
    case "GET /api/cats":
      payload = [mockCat];
      break;
    case "PATCH /api/cats/shiro":
      update = options?.body ? JSON.parse(options.body as any) : {};
      payload = {
        ...mockCat,
        ...update,
      };
      break;
    case "GET /api/dogs/fido/dogTreats":
    case "GET /api/dogs/fido/dog-treats":
      payload = [{ yummy: true }];
      break;
    case "GET /api/camelCase/kebab-case/v2/dogs":
      payload = [{ name: "Fido", color: "red" }];
      break;
    case "GET /api/dogs":
      throw new Error("Expected to throw");
    case "PATCH /api/dogs/fido/dog-treats/treatId":
      update = options?.body ? JSON.parse(options.body as any) : {};
      payload = { ...update };
      break;
    case "GET /api/dogs/fido/dog-treats/treatId":
    case "GET /api/dogs/fido/dogTreats/treatId":
      payload = { yummy: true };
      break;

    default:
      throw new Error(`Unmocked endpoint: ${options?.method} ${input}`);
  }

  return new Response(JSON.stringify(payload));
}

const stl = new Stl({ plugins: {} });
export const api = stl.api({
  basePath: "/api",
  resources: {
    cats,
    dogs,
    dogTreats,
    users,
  },
});

export const nestedApi = stl.api({
  basePath: "/api",
  resources: {
    cats,
    dogs: {
      ...dogs,
      namespacedResources: {
        dogTreats,
      },
    },
  },
});

export const customBasePathApi = stl.api({
  basePath: LongBasePath.complicatedBasePath,
  resources: {
    dogs: LongBasePath.dogs,
  },
});

export type APIWithCustomBasePathAPI = typeof customBasePathApi;
export type APIWithCustomBasePathConfig = {
  basePath: APIWithCustomBasePathAPI["basePath"];
};

export type API = typeof api;
export const config = { basePath: "/api" } as const;
export type Config = typeof config;
