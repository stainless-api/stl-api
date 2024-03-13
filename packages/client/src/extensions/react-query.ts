import { AnyResourceConfig } from "stainless";
import * as ReactQuery from "@tanstack/react-query";
import { Client } from "../core/api-client-types";

export function addReactQuery<
  API extends {
    basePath: `/${string}`;
    resources: Record<string, AnyResourceConfig>;
  }
>(client: Client<API>) {
  client;
}

export type ReactQueryInstance = typeof ReactQuery;
