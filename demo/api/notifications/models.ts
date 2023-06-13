import { User, UserSelection } from "../users/models";
import { z } from "stainless";
import prisma from "../../libs/prismadb";

export const Notification0 = z.response({
  id: z.string().uuid(),
  body: z.string(),
  createdAt: z.date(),
  userId: z.string().uuid(),
});

type Notification1 = z.CircularModel<
  typeof Notification0,
  {
    user?: z.ExpandableZodType<typeof User>;
    user_fields?: z.SelectableZodType<typeof User>;
  }
>;

const Notification1: Notification1 = Notification0.extend({
  user: z.lazy(() => User).expandable(),
  user_fields: z.lazy(() => UserSelection).selectable(),
});
export const Notification = Notification1.prismaModel(prisma.notification);

export const NotificationSelection = Notification.selection();
