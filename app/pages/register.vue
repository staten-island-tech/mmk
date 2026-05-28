<template>
  <div class="overflow-hidden">
    <DomainBackground class="absolute -z-10" />
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
          <h2 class="text-xl font-medium text-slate-500">
            Create a new account
          </h2>

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
  </div>
</template>

<script setup lang="ts">
import type { DialogButton } from "~/types/dialog";
import type { InputValidationRule } from "~/types/validation";

const config = useRuntimeConfig();
const supabase = useSupabaseClient();
const { usernameRules, passwordRules } = useAuthStore();

definePageMeta({
  middleware: "public-only",
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

  try {
    await $fetch("/api/auth/register", {
      method: "POST",
      body: {
        username: username.value,
        password: password.value,
        confirmPassword: confirmPassword.value,
      },
    });
  } catch (e: any) {
    dialogTitle.value = "Error Signing Up";
    dialogMessage.value = e.statusMessage;
    dialogOpen.value = true;
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: `${username.value}@${config.public.authEmailDomain}`,
    password: password.value,
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

  await navigateTo("/");
}
</script>

<style scoped></style>
