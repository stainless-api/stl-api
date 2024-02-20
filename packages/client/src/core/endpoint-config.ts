import { ZodObjectSchema } from "stainless";
import { Endpoint } from "./endpoint-string";

interface EndpointConfig {
  endpoint: Endpoint;
  path?: ZodObjectSchema;
  config?: any; // TODO
  query?: any; // TODO
  body?: any; // TODO
  handler?: () => any; // TODO
}

function endpoint(config: EndpointConfig) {}
