import { ReactQueryInstance } from "./react-query";

type extensions = "reactQuery";

type MakeReactQueryExtension = `foobar`;

export interface ExtensionAdapters {
  reactQuery: MakeReactQueryExtension;
}

export interface ExtensionConfig {
  reactQuery?: ReactQueryInstance;
}
