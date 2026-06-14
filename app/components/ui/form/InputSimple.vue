<template>
  <div class="flex flex-col gap-2">
    <label v-if="props.label" class="text-input-label">{{ props.label }}</label>
    <input
      class="p-2 w-full outline-none border-4 border-double border-input-border bg-input text-md text-input-foreground transition-all duration-150 focus:border-input-focus-border focus:bg-input-focus focus:text-input-focus-foreground focus:placeholder:text-input-focus-placeholder placeholder:text-input-placeholder"
      v-bind="$attrs"
      v-model="model"
      @blur="touched = true"
    />
    <!-- Error list -->
    <TransitionGroup
      name="error"
      tag="div"
      class="flex flex-col gap-2 pl-2 border-double border-l-4 border-input-warning"
    >
      <div
        v-for="rule in failedRules"
        :key="rule.message"
        class="flex items-center gap-2 text-input-warning"
      >
        <Icon name="pixelarticons:close" />
        <span>{{ rule.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label?: string;
  rules?: readonly InputValidationRule[];
}>();

defineExpose({
  validate: () => (touched.value = true),
  isValid: computed<boolean>(() => failedRules.value.length === 0),
});

const model = defineModel<string>();

const touched = ref(false);
const failedRules = computed<readonly InputValidationRule[]>(() => {
  if (!touched.value) return [];
  return props.rules?.filter((rule) => !rule.test(model.value ?? "")) ?? [];
});
</script>

<style scoped>
.error-enter-active,
.error-leave-active {
  transition: all 0.3s ease;
}

.error-enter-from,
.error-leave-to {
  opacity: 0;
  filter: blur(8px);
  transform: translateY(-4px);
}
</style>
