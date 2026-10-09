<script setup>
import { RouterLink, useRoute, useRouter } from "vue-router";
import { Gavel, Tag, UserRound, Users, X } from "lucide-vue-next";

defineProps({ open: { type: Boolean, default: false } });
const emit = defineEmits(["close"]);

const route = useRoute();
const router = useRouter();

const menus = [
  { label: "Dashboard Lelang", to: "/", icon: Gavel },
  { label: "Lelang Saya", to: { path: "/", query: { tab: "mine" } }, icon: Tag },
  { label: "Daftar Pengguna", to: "/users", icon: Users },
  { label: "Profil Saya", to: "/profile", icon: UserRound },
];

const isActive = (menu) => route.fullPath === router.resolve(menu.to).fullPath;
</script>

<template>
  <div v-if="open" data-testid="sidebar-overlay" class="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" @click="emit('close')" />
  <aside
    data-testid="sidebar"
    :class="[
      'fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white p-4 pt-20 transition-transform lg:top-16 lg:translate-x-0 lg:pt-4',
      open ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <button
      type="button"
      aria-label="Tutup menu"
      class="absolute right-3 top-4 rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
      @click="emit('close')"
    >
      <X class="h-5 w-5" />
    </button>
    <nav class="space-y-1">
      <RouterLink
        v-for="menu in menus"
        :key="menu.label"
        :to="menu.to"
        :class="[
          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
          isActive(menu) ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50',
        ]"
        @click="emit('close')"
      >
        <component :is="menu.icon" class="h-4 w-4" /> {{ menu.label }}
      </RouterLink>
    </nav>
  </aside>
</template>
