import { Contact } from "./models";

export const retrieve = stl.endpoint<{ response: Contact }>({
  endpoint: "get /contacts/{contactId}",
});
