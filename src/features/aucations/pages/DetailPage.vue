<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { ArrowLeft, Gavel, Hourglass, ImageOff, ImagePlus, Pencil, Trash2 } from "lucide-vue-next";
import MarkdownViewer from "../components/MarkdownViewer.vue";
import BidModal from "../modals/BidModal.vue";
import ChangeCoverModal from "../modals/ChangeCoverModal.vue";
import ChangeModal from "../modals/ChangeModal.vue";
import { useAucationsStore } from "../states/aucationsStore";
import { useUsersStore } from "../../users/states/usersStore";
import {
  formatDate,
  formatRupiah,
  getCountdown,
  getHighestBid,
  isAucationClosed,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

const route = useRoute();
const router = useRouter();
const aucationsStore = useAucationsStore();
const usersStore = useUsersStore();

const modal = ref(null);
const aucation = computed(() => aucationsStore.aucation);
const isOwner = computed(() => aucation.value.user_id === usersStore.profile?.id);
const isClosed = computed(() => isAucationClosed(aucation.value.closed_at));
const sortedBids = computed(() => [...aucation.value.bids].sort((a, b) => b.bid - a.bid));

const load = () => aucationsStore.asyncGetAucation(route.params.aucationId);
onMounted(load);

const onSaved = () => {
  modal.value = null;
  load();
};

const onDelete = async () => {
  if (!(await showConfirmDialog("Lelang ini akan dihapus permanen. Lanjutkan?", "Ya, hapus"))) {
    return;
  }
  const result = await aucationsStore.asyncDeleteAucation(aucation.value.id);
  if (!result.success) {
    await showErrorDialog(result.message);
    return;
  }
  await showSuccessDialog("Lelang berhasil dihapus");
  router.replace("/");
};

const onDeleteBid = async () => {
  if (!(await showConfirmDialog("Tawaran kamu akan dibatalkan. Lanjutkan?", "Ya, batalkan"))) {
    return;
  }
  const result = await aucationsStore.asyncDeleteBid(aucation.value.id);
  if (!result.success) {
    await showErrorDialog(result.message);
    return;
  }
  await showSuccessDialog("Tawaran berhasil dibatalkan");
  load();
};

const ghostButton =
  "inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50";
</script>

<template>
  <section class="space-y-6">
    <RouterLink to="/" class="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-700">
      <ArrowLeft class="h-4 w-4" /> Kembali ke dashboard
    </RouterLink>

    <p v-if="aucationsStore.isAucation" class="text-slate-500">Memuat detail lelang...</p>
    <p v-else-if="!aucation" class="rounded-2xl bg-white p-10 text-center text-slate-500">
      Lelang tidak ditemukan.
    </p>
    <template v-else>
      <div class="grid gap-6 lg:grid-cols-5">
        <div class="space-y-4 lg:col-span-3">
          <img
            v-if="aucation.cover"
            :src="aucation.cover"
            :alt="aucation.title"
            class="aspect-video w-full rounded-2xl object-cover shadow-sm"
          />
          <div v-else class="flex aspect-video w-full items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
            <ImageOff class="h-14 w-14" />
          </div>
          <article class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h2 class="mb-3 text-lg font-bold">Deskripsi</h2>
            <MarkdownViewer :content="aucation.description" />
          </article>
        </div>

        <aside class="space-y-4 lg:col-span-2">
          <div class="space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h1 class="text-2xl font-extrabold">{{ aucation.title }}</h1>
            <p class="text-sm text-slate-500">
              Oleh <span data-testid="author">{{ aucation.author.name }}</span>
            </p>
            <p
              data-testid="status"
              :class="[
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
                isClosed ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-700',
              ]"
            >
              <Hourglass class="h-3.5 w-3.5" /> {{ getCountdown(aucation.closed_at) }}
            </p>
            <dl class="grid grid-cols-2 gap-3 pt-2 text-sm">
              <div>
                <dt class="text-slate-400">Harga awal</dt>
                <dd class="font-bold">{{ formatRupiah(aucation.start_bid) }}</dd>
              </div>
              <div>
                <dt class="text-slate-400">Tawaran tertinggi</dt>
                <dd data-testid="highest" class="font-bold text-indigo-700">{{ formatRupiah(getHighestBid(aucation)) }}</dd>
              </div>
              <div class="col-span-2">
                <dt class="text-slate-400">Ditutup pada</dt>
                <dd class="font-semibold">{{ formatDate(aucation.closed_at) }}</dd>
              </div>
            </dl>

            <p v-if="aucation.my_bid" data-testid="my-bid" class="rounded-xl bg-indigo-50 p-3 text-sm text-indigo-800">
              Tawaran kamu: <strong>{{ formatRupiah(aucation.my_bid.bid) }}</strong>
            </p>
          </div>

          <div v-if="isOwner" data-testid="owner-actions" class="flex flex-wrap gap-2">
            <button type="button" :class="ghostButton" @click="modal = 'change'">
              <Pencil class="h-4 w-4" /> Ubah
            </button>
            <button type="button" :class="ghostButton" @click="modal = 'cover'">
              <ImagePlus class="h-4 w-4" /> Ganti Cover
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
              @click="onDelete"
            >
              <Trash2 class="h-4 w-4" /> Hapus
            </button>
          </div>
          <div v-else-if="!isClosed" data-testid="bidder-actions" class="flex flex-wrap gap-2">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              @click="modal = 'bid'"
            >
              <Gavel class="h-4 w-4" /> Ajukan Penawaran
            </button>
            <button v-if="aucation.my_bid" type="button" :class="ghostButton" @click="onDeleteBid">
              Batalkan Tawaran
            </button>
          </div>

          <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h2 class="mb-3 text-lg font-bold">Riwayat Penawaran</h2>
            <p v-if="sortedBids.length === 0" class="text-sm text-slate-500">Belum ada penawaran.</p>
            <ol v-else class="space-y-2">
              <li
                v-for="(item, index) in sortedBids"
                :key="item.id"
                data-testid="bid-item"
                class="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
              >
                <span class="font-semibold">#{{ index + 1 }} {{ formatRupiah(item.bid) }}</span>
                <span class="text-xs text-slate-500">{{ formatDate(item.created_at) }}</span>
              </li>
            </ol>
          </div>
        </aside>
      </div>

      <ChangeModal v-if="modal === 'change'" :aucation="aucation" @close="modal = null" @saved="onSaved" />
      <ChangeCoverModal v-if="modal === 'cover'" :aucation="aucation" @close="modal = null" @saved="onSaved" />
      <BidModal v-if="modal === 'bid'" :aucation="aucation" @close="modal = null" @saved="onSaved" />
    </template>
  </section>
</template>
