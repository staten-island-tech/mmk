/**
 * Enforces page transition groups to restrict transitions to certain pages.
 */
export default defineNuxtRouteMiddleware((to, from) => {
  const transitionName = useState("default-transition-name", () => "default");

  const fromGroup = from?.meta?.transitionGroup as string | undefined;
  const toGroup = to.meta?.transitionGroup as string | undefined;

  const sameGroup = fromGroup && toGroup && fromGroup === toGroup;

  transitionName.value = sameGroup ? fromGroup : "page";

  console.log(
    "[MW]",
    from?.path,
    "->",
    to.path,
    "| transition:",
    transitionName.value,
  );
});
