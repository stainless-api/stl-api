interface ParamPart<T extends string> {
  type: "param";
  name: T;
}

interface ResourcePart<T extends string> {
  type: "resource";
  name: T;
}

type PathPart = ParamPart<string> | ResourcePart<string>;

type Path = [
  {
    type: "resource";
    name: "one";
  },
  {
    type: "resource";
    name: "two";
  },
  {
    type: "param";
    name: "three";
  },
  {
    type: "param";
    name: "four";
  },
  {
    type: "resource";
    name: "five";
  },
  {
    type: "param";
    name: "six";
  }
];

type MakeCallable<P extends PathPart[]> = P extends [infer H, ...infer R]
  ? R extends PathPart[]
    ? H extends PathPart
      ? {
          [key in H["name"]]: H extends ResourcePart<string>
            ? MakeCallable<R>
            : () => MakeCallable<R>;
        }
      : never
    : never
  : "Call API";

const foo = {} as MakeCallable<Path>;

foo.one.two.three().four().five.six();

export default "123";
