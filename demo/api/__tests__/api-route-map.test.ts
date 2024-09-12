import { testClientPagesCatchAll } from "../testClient";

// @todo: get includable working again!
it.skip("client gets endpoint from api route map", async () => {
  expect(await testClientPagesCatchAll.test.foo(5)).toMatchInlineSnapshot(`
    {
      "foo": 5,
    }
  `);
});
