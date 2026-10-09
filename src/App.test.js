import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createMemoryHistory } from "vue-router";
import { createPinia, setActivePinia } from "pinia";
import App from "./App.vue";
import { createAppRouter, requireAuth, requireGuest, routes } from "./router";
import { putAccessToken } from "./helpers/apiHelper";
import { getMe, getUsers } from "./features/users/api/userApi";
import { getAucation, getAucations } from "./features/aucations/api/aucationApi";

vi.mock("./features/users/api/userApi");
vi.mock("./features/aucations/api/aucationApi");
vi.mock("./features/auth/api/authApi");

const mountApp = async (path) => {
  const pinia = createPinia();
  setActivePinia(pinia);
  const router = createAppRouter(createMemoryHistory());
  router.push(path);
  await router.isReady();
  const wrapper = mount(App, { global: { plugins: [pinia, router] } });
  await flushPromises();
  return { wrapper, router };
};

describe("App routing", () => {
  beforeEach(() => {
    getMe.mockResolvedValue({ success: true, data: { user: { id: 1, name: "Sandrina", email: "s@a.com", photo: null } } });
    getUsers.mockResolvedValue({ success: true, data: { users: [] } });
    getAucations.mockResolvedValue({ success: true, data: { aucations: [] } });
    getAucation.mockResolvedValue({ success: false });
  });

  it("should expose route guards", () => {
    expect(requireAuth()).toBe("/auth/login");
    expect(requireGuest()).toBe(true);
    putAccessToken("tok");
    expect(requireAuth()).toBe(true);
    expect(requireGuest()).toBe("/");
    expect(routes.at(-1).path).toBe("/:pathMatch(.*)*");
  });

  it("should redirect guests from protected pages to the login page", async () => {
    const { wrapper, router } = await mountApp("/");
    expect(router.currentRoute.value.path).toBe("/auth/login");
    expect(wrapper.text()).toContain("Masuk Akun");
  });

  it("should redirect /auth to the login page and render the register page", async () => {
    const auth = await mountApp("/auth");
    expect(auth.router.currentRoute.value.path).toBe("/auth/login");

    const register = await mountApp("/auth/register");
    expect(register.wrapper.text()).toContain("Daftar Sekarang");
  });

  it("should render the dashboard for logged in users", async () => {
    putAccessToken("tok");
    const { wrapper, router } = await mountApp("/");
    expect(router.currentRoute.value.path).toBe("/");
    expect(wrapper.text()).toContain("Dashboard Lelang");
    expect(wrapper.text()).toContain("Sandrina");
  });

  it("should render the detail route for logged in users", async () => {
    putAccessToken("tok");
    const { wrapper } = await mountApp("/aucations/9");
    expect(getAucation).toHaveBeenCalledWith("9");
    expect(wrapper.text()).toContain("Lelang tidak ditemukan");
  });

  it("should redirect logged in users away from the auth pages", async () => {
    putAccessToken("tok");
    const { router } = await mountApp("/auth/login");
    expect(router.currentRoute.value.path).toBe("/");
  });

  it("should render the users and profile pages for logged in users", async () => {
    putAccessToken("tok");
    const users = await mountApp("/users");
    expect(users.wrapper.text()).toContain("Daftar Pengguna");

    const profile = await mountApp("/profile");
    expect(profile.wrapper.text()).toContain("Profil Saya");
  });

  it("should render the not found page for unknown routes", async () => {
    const { wrapper } = await mountApp("/tidak/ada");
    expect(wrapper.text()).toContain("Halaman tidak ditemukan");
  });
});
