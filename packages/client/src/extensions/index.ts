import * as ReactQuery from "./react-query";

export type ExtensionConfig = {
  reactQuery: ReactQuery.Config;
};

type Extensions = keyof ExtensionConfig;

export type GetExtensions<
  Extensions extends ExtensionConfig,
  Input,
  Output
> = keyof Extensions extends "reactQuery"
  ? ReactQuery.MakeExtension<Input, Output>
  : never;

type Handler = (...args: any[]) => any;

function configureMethods(
  config: ExtensionConfig,
  queryFn: () => Promise<any>,
  queryKey: string[]
): {
  [ext in Extensions]: Record<string, Handler>;
} {
  return {
    reactQuery: ReactQuery.configureMethods(
      config["reactQuery"],
      queryFn,
      queryKey
    ),
  };
}

export function getExtensionHandler(
  config: ExtensionConfig,
  action: string,
  queryFn: () => Promise<any>,
  queryKey: string[]
): Handler | undefined {
  for (const extension in config) {
    const extensionMethods = configureMethods(config, queryFn, queryKey)[
      extension as Extensions
    ];

    if (action in extensionMethods) {
      return extensionMethods[action];
    }
  }
}
