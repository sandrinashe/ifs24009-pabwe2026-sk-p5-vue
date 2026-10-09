<script setup>
import { Gavel, X } from "lucide-vue-next";
import useInput from "../../../hooks/useInput";
import { useAucationsStore } from "../states/aucationsStore";
import {
  formatRupiah,
  getHighestBid,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

const props = defineProps({ aucation: { type: Object, required: true } });
const emit = defineEmits(["close", "saved"]);

const aucationsStore = useAucationsStore();
const highestBid = getHighestBid(props.aucation);
const [bid, onBidChange] = useInput("");

const onSubmit = async () => {
  if (Number(bid.value) <= highestBid) {
    await showErrorDialog(`Tawaran harus lebih tinggi dari ${formatRupiah(highestBid)}`);
    return;
  }
  const result = await aucationsStore.asyncAddBid(props.aucation.id, Number(bid.value));
  if (!result.success) {
    await showErrorDialog(result.message);
    return;
  }
  await showSuccessDialog("Tawaran berhasil diajukan");
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
        <h2 class="text-lg font-bold">Ajukan Penawaran</h2>
        <button type="button" aria-label="Tutup" class="rounded-lg p-1.5 hover:bg-slate-100" @click="emit('close')">
          <X class="h-5 w-5" />
        </button>
      </div>
      <p class="rounded-xl bg-indigo-50 p-3 text-sm text-indigo-800">
        Tawaran tertinggi saat ini: <strong data-testid="highest-bid">{{ formatRupiah(highestBid) }}</strong>
      </p>
      <div>
        <label for="bid" class="mb-1 block text-sm font-medium">Nominal Tawaran (Rp)</label>
        <input id="bid" type="number" required :value="bid" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" @input="onBidChange" />
      </div>
      <button
        type="submit"
        :disabled="aucationsStore.isBidAdd"
        class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        <Gavel class="h-4 w-4" /> Ajukan Tawaran
      </button>
    </form>
  </div>
</template>
