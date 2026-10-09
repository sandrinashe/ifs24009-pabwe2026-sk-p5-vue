<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps({ content: { type: String, default: "" } });

const root = ref(null);
let viewer;
let isUnmounted = false;

// Toast UI cukup besar, jadi dimuat hanya saat viewer benar-benar ditampilkan.
onMounted(async () => {
  const [{ default: Viewer }] = await Promise.all([
    import("@toast-ui/editor/viewer"),
    import("@toast-ui/editor/dist/toastui-editor-viewer.css"),
  ]);
  if (isUnmounted) {
    return;
  }
  viewer = new Viewer({ el: root.value, initialValue: props.content });
});

watch(
  () => props.content,
  (value) => viewer?.setMarkdown(value)
);

onBeforeUnmount(() => {
  isUnmounted = true;
  viewer?.destroy();
});
</script>

<template>
  <div ref="root" data-testid="markdown-viewer" />
</template>
