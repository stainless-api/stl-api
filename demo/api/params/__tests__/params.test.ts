import { testClient } from "../../testClient";

describe("/api/params/[id]", function () {
  it("with all optional params", async function () {
    const id = 5;
    const query = {
      boolean: false,
      number: 3.5,
      string: "blah",
      date: new Date("Dec 3 1986"),
    };
    expect(await testClient.params.retrieve(id, query)).toEqual(
      JSON.parse(
        JSON.stringify({
          id,
          ...query,
        }),
      ),
    );
  });
  it("without optional params", async function () {
    const id = 5;
    expect(await testClient.params.retrieve(id)).toEqual({ id });
  });
});
