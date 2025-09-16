import { Address } from "./common";

export type Order = {
  item: string;
  billingAddress: Address;
  shippingAddress: Address;
};
