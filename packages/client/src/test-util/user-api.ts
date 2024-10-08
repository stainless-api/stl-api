import { Stl, z } from "stainless";

const stl = new Stl({ plugins: {} });

const UserPath = z.path({
  id: z.string(),
});

const userAccountType = {
  admin: "admin",
  free: "free",
  paid: "paid",
};

const UpdateUserBody = z.body({
  name: z.string().trim().optional(),
  email: z.string().email().trim().optional(),
  accountType: z.nativeEnum(userAccountType).optional(),
});

const User = z.object({
  id: z.string(),
  name: z.string().nullish(),
  email: z.string().nullish(),
  siteWideRole: z.enum(["admin", "user"]),
  accountType: z.nativeEnum(userAccountType),
  githubUsername: z.string().nullish(),
  createAt: z.string(),
  updatedAt: z.string(),
});

const updateUser = stl.endpoint({
  endpoint: "POST /api/users/{id}",
  path: UserPath,
  body: UpdateUserBody,
  response: User,
  handler: async ({ id: userId, email, name }, context) => {
    return {} as any;
  },
});

export const users = stl.resource({
  summary: "Users",
  internal: true,
  actions: {
    update: updateUser,
  },
});
