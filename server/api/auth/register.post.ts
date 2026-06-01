import * as z from "zod";
import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
} from "obscenity";
import { serverSupabaseClient } from "#supabase/server";

const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

const config = useRuntimeConfig();

const RegistrationSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters.")
      .max(20, "Username cannot exceed 20 characters.")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username may only contain letters, numbers, and underscores.",
      )
      .refine(
        (username) => !matcher.hasMatch(username),
        "Username must not contain inappropriate language.",
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[a-z]/i, "Password must contain at least one letter.")
      .regex(/[0-9]/, "Password must contain at least one number.")
      .regex(
        /[^a-z0-9]/i,
        "Password must contain at least one special character.",
      ),
    confirmPassword: z.string(),
  })
  // absolute bummer that I have to write this ugly part to get the password confirmation working, but oh well.
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match.",
  });

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const bodyParsed = RegistrationSchema.safeParse(body);
  if (!bodyParsed.success)
    // validation failed
    throw createError({
      statusCode: 400,
      statusMessage: bodyParsed.error.issues[0]!.message,
    });

  const { username, password } = bodyParsed.data;

  const supabase = await serverSupabaseClient(event);

  const { data, error } = await supabase.auth.signUp({
    email: `${username}@${config.public.authEmailDomain}`,
    password: password,
    options: {
      data: {
        display_name: username,
      },
    },
  });

  if (error)
    throw createError({ statusCode: 500, statusMessage: error.message });

  return { data: data };
});
