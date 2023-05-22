import z from "zod";
import { extendZodForStl, Expandable } from "./libs/stlZodExtensions";
extendZodForStl(z);

type InputZodUser = {
  id: number;
  name: string;
  posts?: InputZodPost[] | null;
};
type ZodUser = {
  id: number;
  name: string;
  posts?: Expandable<ZodPost[]>;
};
const ZodUser: z.ZodType<ZodUser, any, InputZodUser> = z.object({
  id: z.number(),
  name: z.string(),
  posts: z.array(z.lazy(() => ZodPost)).expandable(),
});

type InputZodPost = {
  id: number;
  body: string;
  user?: InputZodUser | null;
};
type ZodPost = {
  id: number;
  body: string;
  user?: Expandable<ZodUser>;
};
const ZodPost: z.ZodType<ZodPost, any, InputZodPost> = z.object({
  id: z.number(),
  body: z.string(),
  user: z.lazy(() => ZodUser).expandable(),
});
