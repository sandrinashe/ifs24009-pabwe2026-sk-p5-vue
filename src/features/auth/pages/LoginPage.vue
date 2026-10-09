<script setup>
import { useRouter } from "vue-router";
import { Mail, Lock, LogIn } from "lucide-vue-next";
import useInput from "../../../hooks/useInput";
import { useAuthStore } from "../states/authStore";
import { showErrorDialog } from "../../../helpers/toolsHelper";

const router = useRouter();
const authStore = useAuthStore();
const [email, onEmailChange] = useInput("");
const [password, onPasswordChange] = useInput("");

const onSubmit = async () => {
  const result = await authStore.isAuthLogin({ email: email.value, password: password.value });
  if (!result.success) {
    await showErrorDialog(result.message);
    return;
  }
  router.replace("/");
};
</script>

<template>
  <form class="space-y-5" @submit.prevent="onSubmit">
    <div>
      <label for="email" class="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
        Alamat Email
      </label>
      <div class="relative">
        <Mail class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id="email"
          type="email"
          required
          placeholder="nama@email.com"
          :value="email"
          class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          @input="onEmailChange"
        />
      </div>
    </div>
    <div>
      <label for="password" class="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
        Kata Sandi
      </label>
      <div class="relative">
        <Lock class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id="password"
          type="password"
          required
          placeholder="••••••••"
          :value="password"
          class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          @input="onPasswordChange"
        />
      </div>
    </div>
    <button
      type="submit"
      :disabled="authStore.isLoading"
      class="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60"
    >
      <LogIn class="h-4 w-4" />
      {{ authStore.isLoading ? "Memproses..." : "Masuk Sekarang" }}
    </button>
  </form>
</template>
