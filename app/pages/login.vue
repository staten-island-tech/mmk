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
        <h2 class="text-xl font-medium text-slate-500">
          Log in to your account
        </h2>

        <form class="flex flex-col gap-5" @submit.prevent="signIn">
          <TextInput
            label="Username"
            type="text"
            placeholder="Enter username"
            class="w-full"
            v-model="username"
          />

          <TextInput
            label="Password"
            type="password"
            placeholder="••••••••••••"
            class="w-full"
            v-model="password"
          />

          <ButtonPrimary label="Log In" type="submit" />

          <div class="flex justify-between">
            <PageLink to="register">New here? Register</PageLink>
            <PageLink to="reset">Forgot password?</PageLink>
          </div>
        </form>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DialogButton } from "~/types/dialog";

const config = useRuntimeConfig();
const supabase = useSupabaseClient();

definePageMeta({
  middleware: "public-only",
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

/**
 * The user's account ID, formatted as an email address for Supabase Auth.
 * Not a real email address. The domain is internal and no emails should ever be sent.
 */
const accountId = computed<string>(
  () => `${username.value}@${config.public.authEmailDomain}`,
);

async function signIn() {
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

  await navigateTo("/dashboard");
}
</script>

<style scoped></style>
