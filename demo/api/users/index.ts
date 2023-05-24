import { stl } from "~/libs/stl";
import { list } from "./list";
import { retrieve } from "./retrieve";
import { User, SelectableUser } from "./models";
import { Notification, SelectableNotification } from "../notifications/models";

export const users = stl.resource({
  summary: "Users",
  internal: false,
  models: {
    User,
    SelectableUser,
    Notification,
    SelectableNotification,
  },
  actions: {
    list,
    retrieve,
  },
});
