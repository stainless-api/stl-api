export * from "zod";
import z from "zod";
import { WithStainlessMetadata } from "./stlZodExtensions";

export function path<T extends z.ZodRawShape>(
  shape: T,
  params?: z.RawCreateParams
): z.ZodObject<T, "strip"> {
  return z.object(shape, params);
}

// TODO: make properties optional by default
export class StlParams<
  T extends z.ZodRawShape,
  UnknownKeys extends z.UnknownKeysParam = z.UnknownKeysParam,
  Catchall extends z.ZodTypeAny = z.ZodTypeAny,
  Output = z.objectOutputType<T, Catchall, UnknownKeys>,
  Input = z.objectInputType<T, Catchall, UnknownKeys>
> extends z.ZodObject<T, UnknownKeys, Catchall, Output, Input> {}

export function query<T extends z.ZodRawShape>(
  shape: T,
  params?: z.RawCreateParams
): StlParams<T, "strip"> {
  return new StlParams(z.object(shape, params)._def) as any;
}

export function body<T extends z.ZodRawShape>(
  shape: T,
  params?: z.RawCreateParams
): StlParams<T, "strip"> {
  return new StlParams(z.object(shape, params)._def) as any;
}

export function response<T extends z.ZodRawShape>(
  shape: T,
  params?: z.RawCreateParams
): WithStainlessMetadata<z.ZodObject<T, "strip">, { response: true }> {
  return z.object(shape, params).stlMetadata({ response: true });
}
