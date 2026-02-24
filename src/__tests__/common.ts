export type Address = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
};

export interface AddressIface {
  street: string;
  city: string;
  state: string;
  postalCode: string;
}

export { AddressIface as AddrIface };

export enum Enum {
  HELLO,
  BYE,
}
