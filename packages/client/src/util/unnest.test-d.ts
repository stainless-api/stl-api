import { describe, expectTypeOf, test } from "vitest";
import type { Utest, Unnest, UnionToIntersection } from "./unnest";

describe.skip("Unnesting Records", () => {
  test("Removes outer level of keys, merges values", () => {
    type NestedMap = {
      outerA: {
        middleA: {
          innerA: "foo";
        };
      };
      outerB: {
        middleB: {
          innerB: "bar";
        };
      };
    };
    type Unnested = Unnest<NestedMap>;

    expectTypeOf<Unnested>().toMatchTypeOf<{
      middleA: {
        innerA: "foo";
      };
      middleB: {
        innerB: "bar";
      };
    }>();

    const c = {} as Unnested;

    expectTypeOf<Unnested["middleA"]["innerA"]>().toMatchTypeOf<"foo">();
    expectTypeOf<Unnested["middleB"]["innerB"]>().toMatchTypeOf<"bar">();
  });

  test("Merges conflicting paths", () => {
    type NestedMap = {
      outerA: {
        middle: {
          namespaceCollision: "foo";
        };
      };
      outerB: {
        middle: {
          namespaceCollision: "bar";
          uniqueName: "baz";
        };
      };
      outerC: {
        uniqueMiddle: {
          inner: "foo";
        };
      };
    };
    type Unnested = Unnest<NestedMap>;

    expectTypeOf<Unnested>().toMatchTypeOf<{
      middle: {
        namespaceCollision: "foo" | "bar";
        uniqueName: "baz";
      };
      uniqueMiddle: {
        inner: "foo";
      };
    }>();

    expectTypeOf<Unnested["middle"]["namespaceCollision"]>().toBeNever();
    expectTypeOf<Unnested["middle"]["uniqueName"]>().toMatchTypeOf<"baz">();
    expectTypeOf<Unnested["uniqueMiddle"]["inner"]>().toMatchTypeOf<"foo">();
  });

  test("Merges conflicting paths", () => {
    type NestedMap = {
      outerA: {
        middle: {
          namespaceCollision: "foo";
        };
      };
      outerB: {
        middle: {
          namespaceCollision: "bar";
          uniqueName: "baz";
        };
      };
      outerC: {
        uniqueMiddle: {
          inner: "foo";
        };
      };
    };
    type Unnested = Utest<NestedMap>;

    expectTypeOf<Unnested>().toMatchTypeOf<{
      middle: {
        namespaceCollision: "foo" | "bar";
        uniqueName: "baz";
      };
      uniqueMiddle: {
        inner: "foo";
      };
    }>();

    const c = {} as Unnested;
    c.middle;

    expectTypeOf<Unnested["middle"]["namespaceCollision"]>().toBeNever();
    expectTypeOf<Unnested["middle"]["uniqueName"]>().toMatchTypeOf<"baz">();
    expectTypeOf<Unnested["uniqueMiddle"]["inner"]>().toMatchTypeOf<"foo">();
  });
});

// ARRAY STYLE
//
// const endpoints = [{
//   resource: {
//     list() {},
//     create(body: {}) {},
//   },
// }, {
//   resource: {
//     subresource: {
//       list() {},
//       create(body: {}) {},
//     }
//   }
// }];

// type ClientA = typeof endpoints[number];
// const ca = {} as ClientA;

// ca.resource.subresource?.create({});
// ca.resource.list?.();

// // UnionToIntersection

// type ClientI = UnionToIntersection<ClientA>;

// const ci = {} as ClientI;

// ci.resource.subresource?.create({});
// ci.resource.list?.();

// // Obj style
// //
// const endpointsObj = {
//   foo: {
//   resource: {
//     list() {},
//     create(body: {}) {},
//   },
// },
// bar: {
//   resource: {
//     subresource: {
//       list() {},
//       create(body: {}) {},
//     }
//   }
// }};

// type Client = typeof endpointsObj[keyof typeof endpointsObj];
// const c = {} as Client;

// c.resource.subresource?.create({});
// c.resource.list?.();

// const values = Object.values({ a: 'foo', b: 'bar' } as const)
