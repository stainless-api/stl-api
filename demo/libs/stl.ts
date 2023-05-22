import { makeStl } from "@stl-api/stl";
import { User } from ".prisma/client";
import { makePrismaPlugin } from "@stl-api/prisma";
import { makeNextPlugin } from "@stl-api/next";
import { makeNextAuthPlugin } from "@stl-api/next-auth";
import { makeCurrentUserPlugin } from "./currentUserPlugin";
import { authOptions } from "~/pages/api/auth/[...nextauth]";

export type StlUserContext = {
  currentUser?: User;
  requireCurrentUser: () => User;
};

const next = makeNextPlugin({});
const nextAuth = makeNextAuthPlugin({
  authOptions,
});
const prismaPlugin = makePrismaPlugin({});
const currentUser = makeCurrentUserPlugin({});

const plugins = { next, nextAuth, prisma: prismaPlugin, currentUser };

export const stl = makeStl<StlUserContext, typeof plugins>({
  plugins,
});
