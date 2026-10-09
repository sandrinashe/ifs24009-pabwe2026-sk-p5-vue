<script setup>
import { ref } from "vue";
import { Plus, X } from "lucide-vue-next";
import useInput from "../../../hooks/useInput";
import MarkdownEditor from "../components/MarkdownEditor.vue";
import { useAucationsStore } from "../states/aucationsStore";
import { showErrorDialog, showSuccessDialog, toApiDateTime } from "../../../helpers/toolsHelper";

const emit = defineEmits(["close", "saved"]);

const aucationsStore = useAucationsStore();
const [title, onTitleChange] = useInput("");
const [startBid, onStartBidChange] = useInput("");
const [closedAt, onClosedAtChange] = useInput("");
const description = ref("");

const onSubmit = async () => {
  const result = await aucationsStore.asyncAddAucation({
    title: title.value,
    description: description.value,
    start_bid: Number(startBid.value),
    closed_at: toApiDateTime(closedAt.value),
  });
  if (!result.success) {
    await showErrorDialog(result.message);
    return;
  }
  await showSuccessDialog("Lelang berhasil ditambahkan");
  emit("saved");
};
</script>

<template>
  <div
    data-testid="modal-backdrop"
    class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4"
    @click.self="emit('close')"
  >
    <form class="w-full max-w-xl space-y-4 rounded-2xl bg-white p-6 shadow-2xl" @submit.prevent="onSubmit">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold">Tambah Lelang</h2>
        <button type="button" aria-label="Tutup" class="rounded-lg p-1.5 hover:bg-slate-100" @click="emit('close')">
          <X class="h-5 w-5" />
        </button>
      </div>
      <div>
        <label for="title" class="mb-1 block text-sm font-medium">Judul</label>
        <input id="title" required :value="title" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" @input="onTitleChange" />
      </div>
      <div>
        <span class="mb-1 block text-sm font-medium">Deskripsi (Markdown)</span>
        <MarkdownEditor v-model="description" />
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label for="start-bid" class="mb-1 block text-sm font-medium">Harga Awal (Rp)</label>
          <input id="start-bid" type="number" min="1" required :value="startBid" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" @input="onStartBidChange" />
        </div>
        <div>
          <label for="closed-at" class="mb-1 block text-sm font-medium">Batas Waktu Penutupan</label>
          <input id="closed-at" type="datetime-local" required :value="closedAt" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" @input="onClosedAtChange" />
        </div>
      </div>
      <button
        type="submit"
        :disabled="aucationsStore.isAucationAdd"
        class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        <Plus class="h-4 w-4" /> Simpan Lelang
      </button>
    </form>
  </div>
</template>
