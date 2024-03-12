type ValueOf<T> = T[keyof T];

// Ref: https://fettblog.eu/typescript-union-to-intersection/
type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (
  x: infer R
) => any
  ? R
  : never;

type IntersectionToMap<T> = {
  [key in keyof T]: T[key] extends never ? never : T[key];
};

export type Unnest<T> = IntersectionToMap<UnionToIntersection<ValueOf<T>>>;

export type Utest<T, U = ValueOf<T>, I = UnionToIntersection<U>> = {
  [key in keyof I]: I[key] extends never ? U : I[key];
};

type Client =
  | {
      resource: {
        list(): void;
        create(body: {}): void;
      };
    }
  | {
      resource: {
        subresource: {
          list(): void;
          create(body: {}): void;
        };
      };
    };

type ClientA =
  | {
      resource: {
        list(): void;
        create(body: {}): void;
        subresource?: undefined;
      };
    }
  | {
      resource: {
        subresource: {
          list(): void;
          create(body: {}): void;
        };
        list?: undefined;
        create?: undefined;
      };
    };
