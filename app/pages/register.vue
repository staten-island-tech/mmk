<template>
  <div>
    <Dialog
      :open="dialogOpen"
      :title="dialogTitle"
      @close="dialogOpen = false"
      :buttons="dialogButtons"
    >
      {{ dialogMessage }}
    </Dialog>

    <div class="flex justify-center items-center p-32 w-screen h-screen">
      <Card>
        <h2 class="text-xl font-medium text-slate-500">Create a new account</h2>

        <form class="flex flex-col gap-5" @submit.prevent="register">
          <TextInput
            label="Username"
            :rules="usernameRules"
            type="text"
            placeholder="Enter username"
            class="w-full"
            ref="usernameInput"
            v-model="username"
          />

          <TextInput
            label="Password"
            :rules="passwordRules"
            type="password"
            placeholder="••••••••••••"
            class="w-full"
            ref="passwordInput"
            v-model="password"
          />

          <TextInput
            label="Confirm Password"
            :rules="confirmPasswordRules"
            type="password"
            placeholder="••••••••••••"
            class="w-full"
            ref="confirmPasswordInput"
            v-model="confirmPassword"
          />

          <ButtonPrimary label="Register" type="submit" />

          <div class="flex justify-between">
            <PageLink to="login">Have an account? Sign in</PageLink>
            <PageLink to="privacy">Privacy Policy</PageLink>
          </div>
        </form>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DialogButton } from "~/types/dialog";
import type { InputValidationRule } from "~/types/validation";

const config = useRuntimeConfig();
const supabase = useSupabaseClient();
const { usernameRules, passwordRules } = useAuthStore();

definePageMeta({
  layout: "auth",
  transitionGroup: "auth",
});

const dialogOpen = ref<boolean>(false);
const dialogTitle = ref<string>("");
const dialogMessage = ref<string>("");
const dialogButtons = ref<DialogButton[]>([
  {
    label: "OK",
    priority: 1,
    callback: () => (dialogOpen.value = false),
  },
]);

const username = ref<string>("");
const password = ref<string>("");
const confirmPassword = ref<string>("");

const usernameInput = ref();
const passwordInput = ref();
const confirmPasswordInput = ref();

/**
 * The user's account ID, formatted as an email address for Supabase Auth.
 * Not a real email address. The domain is internal and no emails should ever be sent.
 */
const accountId = computed<string>(
  () => `${username.value}@${config.public.authEmailDomain}`,
);

const confirmPasswordRules = computed<readonly InputValidationRule[]>(() => [
  {
    test: (c: string) => c === password.value,
    message: "Passwords must match",
  },
]);

async function register() {
  /* Re-validate the form.
   * This is so that errors still display even if the inputs were never touched.
   */
  usernameInput.value?.validate();
  passwordInput.value?.validate();
  confirmPasswordInput.value?.validate();

  if (
    !usernameInput.value?.isValid ||
    !passwordInput.value?.isValid ||
    !confirmPasswordInput.value?.isValid
  ) {
    dialogTitle.value = "Error Signing Up";
    dialogMessage.value = "Please correct the errors on the form.";
    dialogOpen.value = true;
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email: accountId.value,
    password: password.value,
    options: {
      data: {
        display_name: username.value,
      },
    },
  });

  if (error) {
    dialogTitle.value = "Error Signing Up";
    dialogMessage.value = error.toString();
    dialogOpen.value = true;
    return;
  }

  dialogTitle.value = "Signed Up";
  dialogMessage.value = "The account has been registered.";
  dialogOpen.value = true;
}
</script>

<style scoped></style>
