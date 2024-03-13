import { MakeReactQueryExtension, ReactQueryInstance } from "./react-query";

export type ExtensionConfig = {
  reactQuery: ReactQueryInstance;
};

export type GetExtensions<
  Extensions extends ExtensionConfig,
  Input,
  Output
> = keyof Extensions extends "reactQuery"
  ? MakeReactQueryExtension<Input, Output>
  : never;
