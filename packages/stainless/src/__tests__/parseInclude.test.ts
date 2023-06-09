import { parseInclude } from "../expands";
import { assertEqual } from "./util";

describe("parseInclude", () => {
  const input0: [] = [];
  const expected0 = { include: {} };

  it(`${JSON.stringify(input0)} -> ${JSON.stringify(expected0)}`, () => {
    expect(parseInclude(input0)).toEqual(expected0);
    assertEqual<parseInclude<typeof input0>, typeof expected0>(true);
  });

  const input1 = [
    "items.user.posts" as const,
    "items.user.comments" as const,
    "items.comments" as const,
  ];
  const expected1 = {
    include: {
      items: {
        include: {
          user: {
            include: {
              posts: {},
              comments: {},
            },
          },
          comments: {},
        },
      },
    },
  };

  it(`${JSON.stringify(input1)} -> ${JSON.stringify(expected1)}`, () => {
    expect(parseInclude(input1)).toEqual(expected1);
    assertEqual<parseInclude<typeof input1>, typeof expected1>(true);
  });

  const invalid0 = [".user.posts" as const];

  it(`${JSON.stringify(invalid0)} -> (error)`, () => {
    assertEqual<
      parseInclude<typeof invalid0>,
      { ERROR: `invalid include: ${(typeof invalid0)[0]}` }
    >(true);
    expect(() => parseInclude(invalid0)).toThrow(
      `invalid include: ${invalid0[0]}`
    );
  });

  const invalid1 = ["user.posts." as const];

  it(`${JSON.stringify(invalid1)} -> (error)`, () => {
    assertEqual<
      parseInclude<typeof invalid1>,
      { ERROR: `invalid include: ${(typeof invalid1)[0]}` }
    >(true);
    expect(() => parseInclude(invalid1)).toThrow(
      `invalid include: ${invalid1[0]}`
    );
  });

  const invalid2 = ["user..posts" as const];

  it(`${JSON.stringify(invalid2)} -> (error)`, () => {
    assertEqual<
      parseInclude<typeof invalid2>,
      { ERROR: `invalid include: ${(typeof invalid2)[0]}` }
    >(true);
    expect(() => parseInclude(invalid2)).toThrow(
      `invalid include: ${invalid2[0]}`
    );
  });

  const invalid3 = ["." as const];

  it(`${JSON.stringify(invalid3)} -> (error)`, () => {
    assertEqual<
      parseInclude<typeof invalid3>,
      { ERROR: `invalid include: ${(typeof invalid3)[0]}` }
    >(true);
    expect(() => parseInclude(invalid3)).toThrow(
      `invalid include: ${invalid3[0]}`
    );
  });

  const invalid4 = ["items" as const, "user..posts" as const];

  it(`${JSON.stringify(invalid4)} -> (error)`, () => {
    assertEqual<
      parseInclude<typeof invalid4>,
      { ERROR: `invalid include: user..posts` }
    >(true);
    expect(() => parseInclude(invalid4)).toThrow(
      `invalid include: ${invalid4[1]}`
    );
  });
});
