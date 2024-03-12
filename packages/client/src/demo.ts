// import { Client, EndpointConfig, endpoint } from ".";

// type c = Client<
//   [
//     { name: "a" },
//     {
//       name: "b";
//       params: [
//         { name: "bId"; type: "z.string" },
//         { name: "otherId"; type: "z.number" }
//       ];
//     },
//     { name: "c" },
//     { name: "d" }
//   ]
// >;

// const client = {} as c;
// client.a(); // Calling as function when no params
// client.a.b().c.d; // Missing params
// client.a.b(123, "abc").c().d; // Wrong type params
// client.a.b("asdf", 123, "asdf").c().d; // Extra params

// client.a.b("asdf", 123).c.d.url(); // CORRECT!!

// const endpointConfig = {
//   endpoint: `GET /foo/{fooId}/bar/baz/{bazId}/{extraId}`,
//   params: { fooId: "z.string", bazId: "z.number", extraId: "z.string" },
// };

// const ep = endpoint({
//   endpoint: `GET /foo/{fooId}/bar/baz/{bazId}/{extraId}`,
//   params: { fooId: "z.string", bazId: "z.number", extraId: "z.string" },
// });

// const url = ep.foo("fooId").bar.baz(123, "extraId").url();

// console.log({ url });

// const stl = {
//   api() {},
//   resource() {},
//   endpoint() {},
// }

// stl.api({
//   [key: resourceName]: stl.resource({
//     actions: {
//       [key: actionName]: stl.endpoint({

//       })
//     }
//   })
// })
