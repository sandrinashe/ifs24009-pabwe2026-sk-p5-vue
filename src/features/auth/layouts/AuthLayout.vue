<script setup>
import { computed } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { Gavel } from "lucide-vue-next";

const route = useRoute();
const isRegister = computed(() => route.path === "/auth/register");

const tabClass = (active) =>
  `flex-1 rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition ${
    active ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
  }`;
</script>

<template>
  <main class="min-h-screen lg:grid lg:grid-cols-2">
    <aside
      data-testid="auth-banner"
      class="hidden flex-col justify-between bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 p-12 text-white lg:flex"
    >
      <div class="flex items-center gap-3 text-lg font-bold">
        <Gavel class="h-6 w-6" /> Delcom Auction
      </div>
      <div>
        <h2 class="text-4xl font-extrabold leading-tight">Tawar barang impianmu, kapan saja.</h2>
        <p class="mt-4 max-w-md text-indigo-100">
          Buat lelang, pantau penawaran tertinggi, dan menangkan barang favoritmu dalam satu aplikasi.
        </p>
      </div>
      <p class="text-sm text-indigo-200">Praktikum Pengembangan Aplikasi Web 2026</p>
    </aside>

    <section class="flex items-center justify-center px-4 py-10">
      <div class="w-full max-w-md">
        <div class="mb-8 text-center">
          <div
            class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg"
          >
            <Gavel class="h-7 w-7" />
          </div>
          <h1 class="text-3xl font-extrabold text-slate-900">Delcom Auction</h1>
          <p class="mt-1 text-sm text-slate-500">Aplikasi Lelang Online yang Modern</p>
        </div>

        <div class="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/70">
          <nav class="mb-6 flex gap-1 rounded-2xl bg-slate-100 p-1">
            <RouterLink to="/auth/login" :class="tabClass(!isRegister)">Masuk Akun</RouterLink>
            <RouterLink to="/auth/register" :class="tabClass(isRegister)">Daftar Baru</RouterLink>
          </nav>
          <RouterView />
        </div>
      </div>
    </section>
  </main>
</template>
