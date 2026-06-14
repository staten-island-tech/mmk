import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
} from "obscenity";

const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

/** Global variables for authentication. */
export const useAuthStore = defineStore("auth", () => {
  /** Rules for username validation. */
  const usernameRules: readonly InputValidationRule[] = [
    { test: (u: string) => u.length >= 3, message: "At least 3 characters" },
    {
      test: (u: string) => u.length <= 20,
      message: "Must not exceed 20 characters",
    },
    {
      test: (u: string) => /^[a-zA-Z0-9_]+$/.test(u),
      message: "Only letters, numbers, and underscores",
    },
    {
      test: (u: string) => !matcher.hasMatch(u),
      message: "Must not contain inappropriate language",
    },
  ];

  /** Rules for password validation. */
  const passwordRules: readonly InputValidationRule[] = [
    { test: (p: string) => p.length >= 8, message: "At least 8 characters" },
    {
      test: (p: string) => /[a-z]/i.test(p),
      message: "At least one letter",
    },
    { test: (p: string) => /[0-9]/.test(p), message: "At least one number" },
    {
      test: (p: string) => /[^a-z0-9]/i.test(p),
      message: "At least one special character",
    },
  ];

  return { usernameRules, passwordRules };
});
