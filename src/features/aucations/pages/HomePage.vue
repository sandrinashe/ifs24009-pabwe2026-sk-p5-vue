<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { Gavel, Hourglass, ImageOff, Plus, Search, Trash2 } from "lucide-vue-next";
import AddModal from "../modals/AddModal.vue";
import { useAucationsStore } from "../states/aucationsStore";
import {
  formatRupiah,
  getCountdown,
  isAucationClosed,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
  stripMarkdown,
} from "../../../helpers/toolsHelper";

const TABS = [
  { key: "all", label: "Semua Lelang" },
  { key: "mine", label: "Lelang Saya" },
  { key: "open", label: "Lelang Berlangsung" },
  { key: "closed", label: "Lelang Ditutup" },
];

const route = useRoute();
const router = useRouter();
const aucationsStore = useAucationsStore();

const search = ref("");
const showAdd = ref(false);
const now = ref(Date.now());
const tab = computed(() => route.query.tab ?? "all");

const timer = setInterval(() => {
  now.value = Date.now();
}, 30000);
onBeforeUnmount(() => clearInterval(timer));

const load = () => aucationsStore.asyncGetAucations({ is_me: tab.value === "mine" ? 1 : undefined });
onMounted(load);
watch(tab, load);

const filtered = computed(() => {
  const keyword = search.value.trim().toLowerCase();
  return aucationsStore.aucations.filter((aucation) => {
    const closed = isAucationClosed(aucation.closed_at, now.value);
    const matchTab = tab.value === "open" ? !closed : tab.value === "closed" ? closed : true;
    const text = `${aucation.title} ${aucation.description}`.toLowerCase();
    return matchTab && text.includes(keyword);
  });
});

const selectTab = (key) => router.replace({ path: "/", query: key === "all" ? {} : { tab: key } });

const onSaved = () => {
  showAdd.value = false;
  load();
};

const onDeleteAll = async () => {
  if (!(await showConfirmDialog("Semua lelang milik kamu akan dihapus. Lanjutkan?", "Ya, hapus semua"))) {
    return;
  }
  const result = await aucationsStore.asyncDeleteAllAucations();
  if (!result.success) {
    await showErrorDialog(result.message);
    return;
  }
  await showSuccessDialog("Semua lelang berhasil dihapus");
  load();
};
</script>

<template>
  <section class="space-y-6">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">Dashboard Lelang</h1>
        <p class="text-sm text-slate-600">Temukan barang menarik dan ajukan penawaranmu.</p>
      </div>
      <div class="flex gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50"
          @click="onDeleteAll"
        >
          <Trash2 class="h-4 w-4" /> Hapus Semua
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          @click="showAdd = true"
        >
          <Plus class="h-4 w-4" /> Tambah Lelang
        </button>
      </div>
    </header>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap gap-1 rounded-2xl bg-slate-100 p-1">
        <button
          v-for="item in TABS"
          :key="item.key"
          type="button"
          :data-testid="`tab-${item.key}`"
          :class="[
            'rounded-xl px-4 py-2 text-sm font-semibold transition',
            tab === item.key ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-700',
          ]"
          @click="selectTab(item.key)"
        >
          {{ item.label }}
        </button>
      </div>
      <div class="relative w-full sm:w-72">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
        <input
          v-model="search"
          type="search"
          placeholder="Cari judul atau deskripsi..."
          class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
      </div>
    </div>

    <p v-if="aucationsStore.isAucation" class="text-slate-600">Memuat data lelang...</p>
    <p v-else-if="filtered.length === 0" class="rounded-2xl bg-white p-10 text-center text-slate-600">
      <Gavel class="mx-auto mb-2 h-8 w-8 text-slate-300" />
      Tidak ada lelang yang ditemukan.
    </p>
    <div v-else class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <RouterLink
        v-for="aucation in filtered"
        :key="aucation.id"
        :to="`/aucations/${aucation.id}`"
        data-testid="aucation-card"
        class="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-lg"
      >
        <img v-if="aucation.cover" :src="aucation.cover" :alt="aucation.title" class="aspect-video w-full object-cover" />
        <div v-else class="flex aspect-video w-full items-center justify-center bg-slate-100 text-slate-300">
          <ImageOff class="h-10 w-10" />
        </div>
        <div class="space-y-2 p-4">
          <h2 class="truncate text-base font-bold group-hover:text-indigo-700">{{ aucation.title }}</h2>
          <p class="line-clamp-2 text-sm text-slate-600">{{ stripMarkdown(aucation.description) }}</p>
          <div class="flex items-end justify-between pt-1">
            <div>
              <p class="text-xs text-slate-600">Harga awal</p>
              <p class="font-bold text-indigo-700">{{ formatRupiah(aucation.start_bid) }}</p>
            </div>
            <p class="text-xs text-slate-600">{{ aucation.bids.length }} tawaran</p>
          </div>
          <p
            data-testid="countdown"
            :class="[
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
              isAucationClosed(aucation.closed_at, now) ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700',
            ]"
          >
            <Hourglass class="h-3.5 w-3.5" /> {{ getCountdown(aucation.closed_at, now) }}
          </p>
        </div>
      </RouterLink>
    </div>

    <AddModal v-if="showAdd" @close="showAdd = false" @saved="onSaved" />
  </section>
</template>
