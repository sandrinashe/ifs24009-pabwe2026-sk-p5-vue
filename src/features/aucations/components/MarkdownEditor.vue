<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({ modelValue: { type: String, default: "" } });
const emit = defineEmits(["update:modelValue"]);

const root = ref(null);
let editor;
let isUnmounted = false;

// Toast UI cukup besar, jadi dimuat hanya saat editor benar-benar ditampilkan.
onMounted(async () => {
  const [{ default: Editor }] = await Promise.all([
    import("@toast-ui/editor"),
    import("@toast-ui/editor/dist/toastui-editor.css"),
  ]);
  if (isUnmounted) {
    return;
  }
  editor = new Editor({
    el: root.value,
    height: "260px",
    initialEditType: "markdown",
    previewStyle: "tab",
    initialValue: props.modelValue,
    usageStatistics: false,
  });
  editor.on("change", () => emit("update:modelValue", editor.getMarkdown()));
});

onBeforeUnmount(() => {
  isUnmounted = true;
  editor?.destroy();
});
</script>

<template>
  <div ref="root" data-testid="markdown-editor" />
</template>
