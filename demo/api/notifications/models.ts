import { User, UserSelection } from "../users/models";
import { Expandable, Selectable, z } from "stainless";
import { stl } from "~/libs/stl";
import prisma from "~/libs/prismadb";

export const baseNotification = z.object({
  id: z.string().uuid(),
  body: z.string(),
  createdAt: z.date(),
  userId: z.string().uuid(),
});

export type Notification = z.infer<typeof baseNotification> & {
  user?: Expandable<User>;
  user_fields?: Selectable<UserSelection>;
};

export const Notification: z.ZodType<Notification> = stl.response(
  baseNotification.extend({
    user: z.lazy(() => User).expandable(),
    user_fields: z.lazy(() => UserSelection).selectable(),
  }),
  { prismaModel: prisma?.notification }
);

export const NotificationSelection = Notification.selection();
export type NotificationSelection = z.infer<typeof NotificationSelection>;
