import { ref } from "vue";

/**
 * Composable untuk mengelola state dan change handler pada input form.
 * @returns {[import('vue').Ref, (event: Event) => void]}
 */
export default function useInput(defaultValue = "") {
  const value = ref(defaultValue);

  const onChange = (event) => {
    value.value = event.target.value;
  };

  return [value, onChange];
}
