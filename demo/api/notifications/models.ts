import { User, UserOutput, UserInput, UserSelection } from "../users/models";
import {
  ExpandableOutput,
  ExpandableInput,
  SelectableOutput,
  SelectableInput,
  z,
} from "stainless";
import prisma from "~/libs/prismadb";

export const baseNotification = z.response({
  id: z.string().uuid(),
  body: z.string(),
  createdAt: z.date(),
  userId: z.string().uuid(),
});

export type NotificationOutput = z.output<typeof baseNotification> & {
  user?: ExpandableOutput<UserOutput>;
  user_fields?: SelectableOutput<UserOutput>;
};
export type NotificationInput = z.input<typeof baseNotification> & {
  user?: ExpandableInput<UserInput>;
  user_fields?: SelectableInput<UserInput>;
};

export const Notification: z.ZodType<
  NotificationOutput,
  any,
  NotificationInput
> = baseNotification
  .extend({
    user: z.lazy(() => User).expandable(),
    user_fields: z.lazy(() => UserSelection).selectable(),
  })
  .prismaModel(prisma.notification);

export const NotificationSelection = Notification.selection();
