import { User, UserOutput, UserInput, UserSelection } from "../users/models";
import { z } from "stainless";
import prisma from "~/libs/prismadb";

export const baseNotification = z.response({
  id: z.string().uuid(),
  body: z.string(),
  createdAt: z.date(),
  userId: z.string().uuid(),
});

export type NotificationOutput = z.output<typeof baseNotification> & {
  user?: z.ExpandableOutput<UserOutput>;
  user_fields?: z.SelectableOutput<UserOutput>;
};
export type NotificationInput = z.input<typeof baseNotification> & {
  user?: z.ExpandableInput<UserInput>;
  user_fields?: z.SelectableInput<UserInput>;
};

export const Notification: z.ZodType<
  NotificationOutput,
  z.ZodObjectDef,
  NotificationInput
> = baseNotification
  .extend({
    user: z.lazy(() => User).expandable(),
    user_fields: z.lazy(() => UserSelection).selectable(),
  })
  .prismaModel(prisma.notification);

export const NotificationSelection = Notification.selection();
