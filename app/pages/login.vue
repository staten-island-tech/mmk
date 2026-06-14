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
        class="flex w-full min-h-screen sm:items-center justify-center sm:p-10"
      >
        <UiCardSimple
          class="w-full h-screen sm:h-auto max-w-full sm:max-w-lg p-10 gap-5"
        >
          <h2 class="text-xl font-medium text-slate-500">
            Log in to your account
          </h2>

          <form class="flex flex-col gap-5" @submit.prevent="signIn">
            <UiFormInputSimple
              label="Username"
              type="text"
              placeholder="Enter username"
              class="w-full"
              v-model="username"
            />

            <UiFormInputSimple
              label="Password"
              type="password"
              placeholder="••••••••••••"
              class="w-full"
              v-model="password"
            />

            <UiButtonSimplePrimary
              label="Log In"
              type="submit"
              :disabled="isSubmitting"
            />

            <div class="flex justify-between">
              <UiFormPageLink to="/register">New here? Register</UiFormPageLink>
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

/**
 * The user's account ID, formatted as an email address for Supabase Auth.
 * Not a real email address. The domain is internal and no emails should ever be sent.
 */
const accountId = computed<string>(
  () => `${username.value}@${config.public.authEmailDomain}`,
);

async function signIn() {
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: accountId.value,
      password: password.value,
    });

    if (error) {
      dialogTitle.value = "Error Signing In";
      dialogMessage.value = error.toString();
      dialogOpen.value = true;
      return;
    }

    await navigateTo("/");
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped></style>
