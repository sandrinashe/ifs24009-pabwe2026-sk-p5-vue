<script setup>
import { ref } from "vue";
import { ImagePlus, X } from "lucide-vue-next";
import { useAucationsStore } from "../states/aucationsStore";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

const props = defineProps({ aucation: { type: Object, required: true } });
const emit = defineEmits(["close", "saved"]);

const aucationsStore = useAucationsStore();
const file = ref(null);
const preview = ref(props.aucation.cover);

const onFileChange = (event) => {
  file.value = event.target.files[0];
  preview.value = URL.createObjectURL(file.value);
};

const onSubmit = async () => {
  if (!file.value) {
    await showErrorDialog("Pilih gambar cover terlebih dahulu");
    return;
  }
  const result = await aucationsStore.asyncChangeCover(props.aucation.id, file.value);
  if (!result.success) {
    await showErrorDialog(result.message);
    return;
  }
  await showSuccessDialog("Cover berhasil diubah");
  emit("saved");
};
</script>

<template>
  <div
    data-testid="modal-backdrop"
    class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4"
    @click.self="emit('close')"
  >
    <form class="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-2xl" @submit.prevent="onSubmit">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold">Ubah Cover</h2>
        <button type="button" aria-label="Tutup" class="rounded-lg p-1.5 hover:bg-slate-100" @click="emit('close')">
          <X class="h-5 w-5" />
        </button>
      </div>
      <img v-if="preview" :src="preview" alt="Pratinjau cover" class="aspect-video w-full rounded-xl object-cover" />
      <p v-else class="flex aspect-video items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-600">
        Belum ada cover
      </p>
      <label for="cover" class="block text-sm font-medium">Pilih gambar cover</label>
      <input id="cover" type="file" accept="image/*" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" @change="onFileChange" />
      <button
        type="submit"
        :disabled="aucationsStore.isAucationChangeCover"
        class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        <ImagePlus class="h-4 w-4" /> Unggah Cover
      </button>
    </form>
  </div>
</template>
