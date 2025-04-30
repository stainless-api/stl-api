type Address = {
  street: string;
  city: string;
  state: string;
  country: string;
};

export type Contact = {
  firstName: string;
  lastName: string;
  address: Address;
};
