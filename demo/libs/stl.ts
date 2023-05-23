import { makeStl } from "stainless";
import { makePrismaPlugin } from "@stl-api/prisma";
import { makeNextPlugin } from "@stl-api/next";
import { makeNextAuthPlugin } from "@stl-api/next-auth";
import { authOptions } from "~/pages/api/auth/[...nextauth]";
import { makeCurrentUserPlugin } from "./currentUserPlugin";
import { User } from ".prisma/client";

export type StlUserContext = {
  currentUser?: User;
  requireCurrentUser: () => User;
};

const plugins = {
  next: makeNextPlugin(),
  nextAuth: makeNextAuthPlugin({ authOptions }),
  prisma: makePrismaPlugin(),
  currentUser: makeCurrentUserPlugin(),
};

export const stl = makeStl<StlUserContext, typeof plugins>({
  plugins,
});
