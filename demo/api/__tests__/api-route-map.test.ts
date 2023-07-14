import { testClientPagesCatchAll } from "../testClient";

it("client gets endpoint from api route map", async () => {
  expect(await testClientPagesCatchAll.test.foo(5)).toMatchInlineSnapshot(`
    {
      "foo": 5,
    }
  `);
});
