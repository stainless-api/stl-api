import { multiFileTestCase } from "./multiFileTestCase";
import z from "zod";

type Without<T, U> = {
  [P in Exclude<keyof T, keyof U>]?: never;
};

/**
 * XOR is needed to have a real mutually exclusive union type
 * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
 */
type XOR<T, U> = T extends object
  ? U extends object
    ? (Without<T, U> & U) | (Without<U, T> & T)
    : U
  : T;

interface Person {
  name: string;
  language: string;
}
interface Pet {
  name: string;
  breed: string;
}

type T = XOR<Person, Pet>;

it(`XOR type`, async () => {
  expect(
    await multiFileTestCase({
      __filename,
    })
  ).toMatchInlineSnapshot(`
    {
      "src/__tests__/xor.test.codegen.ts": "const Pet = z.object({ name: z.string(), breed: z.string() });
    const Person = z.object({ name: z.string(), language: z.string() });
    const T = z.union([z.object({ language: z.undefined() }).and(z.lazy(() => Pet)), z.object({ breed: z.undefined() }).and(z.lazy(() => Person))]);
    ",
    }
  `);

  const Pet = z.object({ name: z.string(), breed: z.string() });
  const Person = z.object({ name: z.string(), language: z.string() });
  const T = z.union([
    z.object({ language: z.undefined() }).and(z.lazy(() => Pet)),
    z.object({ breed: z.undefined() }).and(z.lazy(() => Person)),
  ]);

  T.parse({ name: "Thierry", language: "anglais" });
  T.parse({ name: "fifi", breed: "rottweiler" });
  expect(() =>
    T.parse({ name: "Dogman", language: "woof", breed: "?" })
  ).toThrow();
});
