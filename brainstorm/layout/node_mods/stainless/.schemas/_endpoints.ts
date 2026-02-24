import z from "zod";

import { Order } from "./api/orders/models";
import { Contact } from "./api/contacts/models";

export const endpoints = {
  "GET /orders": {
    response: z.array(z.lazy(() => Order)),
  },
  "GET /contacts/{contactId}": {
    response: z.array(Contact),
  },
};

+import {Response as ResponseSchema} from '...'

const createAuthenticatedROute<Response> = () => {
    stl.endpoint<Response>({
        config: {
            authenticate: true
        },
        +response: ResponseSchema,
        ...Contact.
    })
}
