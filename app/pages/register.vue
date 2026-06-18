<template>
  <div class="overflow-hidden">
    <UiBackgroundDomain class="absolute -z-10" />

    <div>
      <UiModalSimple
        :open="dialogOpen"
        :title="dialogTitle"
        @close="dialogOpen = false"
        :buttons="dialogButtons"
      >
        {{ dialogMessage }}
      </UiModalSimple>

      <div
        class="flex w-full min-h-[100dvh] sm:items-center justify-center sm:p-10"
      >
        <UiCardSimple
          class="overflow-y-auto w-full h-[100dvh] sm:h-auto max-w-full sm:max-w-lg p-10 gap-5"
        >
          <h2 class="text-xl font-medium text-slate-500">
            Create a new account
          </h2>

          <form class="flex flex-col gap-5" @submit.prevent="register">
            <UiFormInputSimple
              label="Username"
              :rules="usernameRules"
              type="text"
              placeholder="Enter username"
              class="w-full"
              ref="usernameInput"
              v-model="username"
            />

            <UiFormInputSimple
              label="Password"
              :rules="passwordRules"
              type="password"
              placeholder="••••••••••••"
              class="w-full"
              ref="passwordInput"
              v-model="password"
            />

            <UiFormInputSimple
              label="Confirm Password"
              :rules="confirmPasswordRules"
              type="password"
              placeholder="••••••••••••"
              class="w-full"
              ref="confirmPasswordInput"
              v-model="confirmPassword"
            />

            <UiButtonSimplePrimary
              label="Register"
              type="submit"
              :disabled="isSubmitting"
            />

            <div class="flex flex-col md:flex-row justify-between">
              <UiFormPageLink to="/login"
                >Have an account? Sign in</UiFormPageLink
              >
              <UiFormPageLink to="/privacy">Privacy Policy</UiFormPageLink>
            </div>
          </form>
        </UiCardSimple>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "public-only",
});

const config = useRuntimeConfig();
const supabase = useSupabaseClient();

const { usernameRules, passwordRules } = useAuthStore();

const isSubmitting = ref(false);

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

  if (isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    await $fetch("/api/auth/register", {
      method: "POST",
      body: {
        username: username.value,
        password: password.value,
        confirmPassword: confirmPassword.value,
      },
    });

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

    await navigateTo("/onboarding");
  } catch (e: any) {
    dialogTitle.value = "Error Signing Up";
    dialogMessage.value = e.statusMessage;
    dialogOpen.value = true;
    return;
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped></style>
