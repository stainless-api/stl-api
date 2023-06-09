import { users } from "~/api/users";
import { stlNextPageRoute } from "@stl-api/next";

export default stlNextPageRoute(users.actions.retrieve);
