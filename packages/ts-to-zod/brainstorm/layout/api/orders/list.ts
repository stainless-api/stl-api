import { Order } from "./models";

export const list = stl.endpoint<{ response: Order[] }>({
  endpoint: "GET /orders",
});
