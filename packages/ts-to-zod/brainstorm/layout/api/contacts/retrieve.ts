import { Contact } from "./models";

export const retrieve = stl.endpoint<{ response: Contact }>({
  endpoint: "GET /contacts/{contactId}",
});
