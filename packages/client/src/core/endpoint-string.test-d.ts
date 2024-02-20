import { assertType, describe, expectTypeOf, test } from "vitest";
import {
  Endpoint,
  ExtractMethod,
  ExtractPath,
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
      expectTypeOf<ExtractMethod<`POST /foo`>>().toMatchTypeOf<"POST">();
      expectTypeOf<ExtractMethod<`GET /foo`>>().toMatchTypeOf<"GET">();
      expectTypeOf<ExtractMethod<`PUT /foo`>>().toMatchTypeOf<"PUT">();
      expectTypeOf<ExtractMethod<`DELETE /foo`>>().toMatchTypeOf<"DELETE">();
      expectTypeOf<ExtractMethod<`HEAD /foo`>>().toMatchTypeOf<"HEAD">();
      expectTypeOf<ExtractMethod<`OPTIONS /foo`>>().toMatchTypeOf<"OPTIONS">();
    });

    test("can extract the path", () => {
      expectTypeOf<
        ExtractPath<WellFormedEndpoint>
      >().toMatchTypeOf<"/foo/bar/{baz}/{foo}/bar/{baz}">();
    });
  });

  describe("splitting path into parts", () => {
    test("can split the path into an ordered list of resources and params", () => {
      type Path = ExtractPath<WellFormedEndpoint>;
      type Parts = SplitPathIntoParts<Path>;

      expectTypeOf<Parts>().toMatchTypeOf<
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
          }
        ]
      >;
    });

    test("can handle a single resource", () => {
      expectTypeOf<SplitPathIntoParts<"/foo">>().toMatchTypeOf<
        [
          {
            type: "resource";
            name: "foo";
          }
        ]
      >;
    });

    test("can handle a single param", () => {
      expectTypeOf<SplitPathIntoParts<"/{foo}">>().toMatchTypeOf<
        [
          {
            type: "param";
            name: "foo";
          }
        ]
      >;
    });

    test("can handle sequential params", () => {
      expectTypeOf<SplitPathIntoParts<"/{foo}/{bar}/{baz}">>().toMatchTypeOf<
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
          }
        ]
      >;
    });
  });
});
