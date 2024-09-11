import { assertType, describe, expectTypeOf, test } from "vitest";
import {
  Endpoint,
  ExtractMethod,
  ExtractPath,
  FilterPathParts,
  HttpMethod,
  SplitPathIntoParts,
} from "./endpoint-string";

const wellFormedEndpoint = "GET /foo/bar/{baz}/{foo}/bar/{baz}";
type WellFormedEndpoint = typeof wellFormedEndpoint;

describe("Endpoint string", () => {
  describe("definition", () => {
    test("can check if well formed", () => {
      assertType<Endpoint>(wellFormedEndpoint);

      // @ts-expect-error missing path
      assertType<Endpoint>("GET");
      // @ts-expect-error missing leading slash
      assertType<Endpoint>("GET foo/bar");
      // @ts-expect-error missing method
      assertType<Endpoint>("/foo/bar");
    });
  });

  describe("parsing method and path", () => {
    test("can extract the http method", () => {
      expectTypeOf<
        ExtractMethod<WellFormedEndpoint>
      >().toMatchTypeOf<HttpMethod>();
      expectTypeOf<ExtractMethod<`POST /foo`>>().toEqualTypeOf<"POST">();
      expectTypeOf<ExtractMethod<`GET /foo`>>().toEqualTypeOf<"GET">();
      expectTypeOf<ExtractMethod<`PUT /foo`>>().toEqualTypeOf<"PUT">();
      expectTypeOf<ExtractMethod<`DELETE /foo`>>().toEqualTypeOf<"DELETE">();
      expectTypeOf<ExtractMethod<`HEAD /foo`>>().toEqualTypeOf<"HEAD">();
      expectTypeOf<ExtractMethod<`OPTIONS /foo`>>().toEqualTypeOf<"OPTIONS">();
    });

    test("can extract the path", () => {
      expectTypeOf<
        ExtractPath<WellFormedEndpoint>
      >().toEqualTypeOf<"/foo/bar/{baz}/{foo}/bar/{baz}">();
    });
  });

  describe("splitting path into parts", () => {
    test("can split the path into an ordered list of resources and params", () => {
      type Path = ExtractPath<WellFormedEndpoint>;
      type Parts = SplitPathIntoParts<Path>;

      expectTypeOf<Parts>().toEqualTypeOf<
        [
          {
            type: "resource";
            name: "foo";
          },
          {
            type: "resource";
            name: "bar";
          },
          {
            type: "param";
            name: "baz";
          },
          {
            type: "param";
            name: "foo";
          },
          {
            type: "resource";
            name: "bar";
          },
          {
            type: "param";
            name: "baz";
          },
        ]
      >;
    });

    test("Ignores HTTP verbs", () => {
      expectTypeOf<SplitPathIntoParts<"POST /foo">>().toEqualTypeOf<
        [
          {
            type: "resource";
            name: "foo";
          },
        ]
      >;
    });

    test("can handle a single resource", () => {
      expectTypeOf<SplitPathIntoParts<"/foo">>().toEqualTypeOf<
        [
          {
            type: "resource";
            name: "foo";
          },
        ]
      >;
    });

    test("can handle a single param", () => {
      expectTypeOf<SplitPathIntoParts<"/{foo}">>().toEqualTypeOf<
        [
          {
            type: "param";
            name: "foo";
          },
        ]
      >;
    });

    test("can handle sequential params", () => {
      expectTypeOf<SplitPathIntoParts<"/{foo}/{bar}/{baz}">>().toEqualTypeOf<
        [
          {
            type: "param";
            name: "foo";
          },
          {
            type: "param";
            name: "bar";
          },
          {
            type: "param";
            name: "baz";
          },
        ]
      >;
    });
  });

  describe("Filtering paths", () => {
    test("can filter out path parts", () => {
      type Path = SplitPathIntoParts<"POST /api/foo/bar">;
      type FilteredPath = FilterPathParts<Path, "api">;

      expectTypeOf<FilteredPath>().toEqualTypeOf<
        [
          {
            type: "resource";
            name: "foo";
          },
          {
            type: "resource";
            name: "bar";
          },
        ]
      >;
    });
  });
});
