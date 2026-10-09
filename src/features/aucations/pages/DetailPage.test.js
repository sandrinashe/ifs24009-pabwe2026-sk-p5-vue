import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import DetailPage from "./DetailPage.vue";
import BidModal from "../modals/BidModal.vue";
import ChangeCoverModal from "../modals/ChangeCoverModal.vue";
import ChangeModal from "../modals/ChangeModal.vue";
import { renderWithProviders, createMockPinia } from "../../../test-utils";
import { useAucationsStore } from "../states/aucationsStore";
import { useUsersStore } from "../../users/states/usersStore";
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showConfirmDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const routes = [
  { path: "/", component: { template: "<p>home</p>" } },
  { path: "/aucations/:aucationId", component: DetailPage },
];

const base = {
  id: 4,
  user_id: 1,
  title: "Jam Tangan",
  cover: "http://x/c.png",
  description: "**Antik**",
  start_bid: 100000,
  closed_at: "2999-01-01 00:00:00",
  author: { name: "Andi", photo: null },
  bids: [
    { id: 1, bid: 150000, created_at: "2024-10-05T12:09:16.000000Z" },
    { id: 2, bid: 300000, created_at: "2024-10-06T12:09:16.000000Z" },
  ],
  my_bid: null,
};

const mountPage = async ({ aucation = base, profileId = 1, loading = false } = {}) => {
  const pinia = createMockPinia();
  const store = useAucationsStore();
  store.asyncGetAucation = vi.fn().mockResolvedValue({ success: true });
  store.asyncDeleteAucation = vi.fn().mockResolvedValue({ success: true });
  store.asyncDeleteBid = vi.fn().mockResolvedValue({ success: true });
  store.$patch({ aucation, isAucation: loading });
  useUsersStore().profile = { id: profileId };
  const rendered = await renderWithProviders(DetailPage, { pinia, routes, route: "/aucations/4" });
  return { ...rendered, store };
};

const button = (wrapper, text) => wrapper.findAll("button").find((b) => b.text().includes(text));

describe("DetailPage", () => {
  beforeEach(() => {
    showConfirmDialog.mockReset();
    showErrorDialog.mockReset();
    showSuccessDialog.mockReset();
  });

  it("should load the aucation by route param and show its details", async () => {
    const { wrapper, store } = await mountPage();
    expect(store.asyncGetAucation).toHaveBeenCalledWith("4");
    expect(wrapper.find("h1").text()).toBe("Jam Tangan");
    expect(wrapper.find("[data-testid=author]").text()).toBe("Andi");
    expect(wrapper.find("img").attributes("src")).toBe("http://x/c.png");
    expect(wrapper.find("[data-testid=highest]").text().replace(/\s/g, "")).toMatch(/Rp300\.000/);
    expect(wrapper.find("[data-testid=status]").text()).toContain("hari");
  });

  it("should list the bid history from the highest bid", async () => {
    const { wrapper } = await mountPage();
    const items = wrapper.findAll("[data-testid=bid-item]");
    expect(items).toHaveLength(2);
    expect(items[0].text().replace(/\s/g, "")).toContain("#1Rp300.000");
  });

  it("should show an empty bid history and a cover placeholder", async () => {
    const { wrapper } = await mountPage({ aucation: { ...base, cover: null, bids: [] } });
    expect(wrapper.text()).toContain("Belum ada penawaran");
    expect(wrapper.find("img").exists()).toBe(false);
  });

  it("should show loading and not-found states", async () => {
    const loading = await mountPage({ loading: true });
    expect(loading.wrapper.text()).toContain("Memuat detail lelang");

    const missing = await mountPage({ aucation: null });
    expect(missing.wrapper.text()).toContain("Lelang tidak ditemukan");
  });

  it("should show owner actions only to the owner", async () => {
    const owner = await mountPage();
    expect(owner.wrapper.find("[data-testid=owner-actions]").exists()).toBe(true);
    expect(owner.wrapper.find("[data-testid=bidder-actions]").exists()).toBe(false);
  });

  it("should open and close the change and cover modals (owner)", async () => {
    const { wrapper } = await mountPage();
    await button(wrapper, "Ubah").trigger("click");
    expect(wrapper.findComponent(ChangeModal).exists()).toBe(true);
    await wrapper.findComponent(ChangeModal).vm.$emit("close");
    expect(wrapper.findComponent(ChangeModal).exists()).toBe(false);

    await button(wrapper, "Ganti Cover").trigger("click");
    expect(wrapper.findComponent(ChangeCoverModal).exists()).toBe(true);
    await wrapper.findComponent(ChangeCoverModal).vm.$emit("close");
    expect(wrapper.findComponent(ChangeCoverModal).exists()).toBe(false);
  });

  it("should reload and close the modal after saving", async () => {
    const { wrapper, store } = await mountPage();
    await button(wrapper, "Ubah").trigger("click");
    store.asyncGetAucation.mockClear();
    await wrapper.findComponent(ChangeModal).vm.$emit("saved");
    await flushPromises();
    expect(wrapper.findComponent(ChangeModal).exists()).toBe(false);
    expect(store.asyncGetAucation).toHaveBeenCalledTimes(1);
  });

  it("should not delete when the confirmation is cancelled", async () => {
    const { wrapper, store } = await mountPage();
    showConfirmDialog.mockResolvedValue(false);
    await button(wrapper, "Hapus").trigger("click");
    await flushPromises();
    expect(store.asyncDeleteAucation).not.toHaveBeenCalled();
  });

  it("should delete the aucation and go home", async () => {
    const { wrapper, store, router } = await mountPage();
    showConfirmDialog.mockResolvedValue(true);
    await button(wrapper, "Hapus").trigger("click");
    await flushPromises();
    expect(store.asyncDeleteAucation).toHaveBeenCalledWith(4);
    expect(showSuccessDialog).toHaveBeenCalledWith("Lelang berhasil dihapus");
    expect(router.currentRoute.value.path).toBe("/");
  });

  it("should show an error when deleting fails", async () => {
    const { wrapper, store, router } = await mountPage();
    showConfirmDialog.mockResolvedValue(true);
    store.asyncDeleteAucation.mockResolvedValue({ success: false, message: "Gagal hapus" });
    await button(wrapper, "Hapus").trigger("click");
    await flushPromises();
    expect(showErrorDialog).toHaveBeenCalledWith("Gagal hapus");
    expect(router.currentRoute.value.path).toBe("/aucations/4");
  });

  it("should let a non-owner place a bid on an open aucation", async () => {
    const { wrapper } = await mountPage({ profileId: 2 });
    expect(wrapper.find("[data-testid=owner-actions]").exists()).toBe(false);
    expect(wrapper.find("[data-testid=my-bid]").exists()).toBe(false);
    expect(button(wrapper, "Batalkan Tawaran")).toBeUndefined();

    await button(wrapper, "Ajukan Penawaran").trigger("click");
    expect(wrapper.findComponent(BidModal).exists()).toBe(true);
    await wrapper.findComponent(BidModal).vm.$emit("close");
    expect(wrapper.findComponent(BidModal).exists()).toBe(false);
  });

  it("should hide bidding on a closed aucation", async () => {
    const { wrapper } = await mountPage({
      profileId: 2,
      aucation: { ...base, closed_at: "2000-01-01 00:00:00" },
    });
    expect(wrapper.find("[data-testid=bidder-actions]").exists()).toBe(false);
    expect(wrapper.find("[data-testid=status]").text()).toContain("Lelang ditutup");
  });

  it("should show my bid and cancel it after confirmation", async () => {
    const my_bid = { id: 2, bid: 300000 };
    const { wrapper, store } = await mountPage({ profileId: 2, aucation: { ...base, my_bid } });
    expect(wrapper.find("[data-testid=my-bid]").text().replace(/\s/g, "")).toMatch(/Rp300\.000/);

    showConfirmDialog.mockResolvedValue(false);
    await button(wrapper, "Batalkan Tawaran").trigger("click");
    await flushPromises();
    expect(store.asyncDeleteBid).not.toHaveBeenCalled();

    showConfirmDialog.mockResolvedValue(true);
    store.asyncGetAucation.mockClear();
    await button(wrapper, "Batalkan Tawaran").trigger("click");
    await flushPromises();
    expect(store.asyncDeleteBid).toHaveBeenCalledWith(4);
    expect(showSuccessDialog).toHaveBeenCalledWith("Tawaran berhasil dibatalkan");
    expect(store.asyncGetAucation).toHaveBeenCalledTimes(1);
  });

  it("should show an error when cancelling the bid fails", async () => {
    const { wrapper, store } = await mountPage({ profileId: 2, aucation: { ...base, my_bid: { id: 2, bid: 1 } } });
    showConfirmDialog.mockResolvedValue(true);
    store.asyncDeleteBid.mockResolvedValue({ success: false, message: "Gagal batal" });
    await button(wrapper, "Batalkan Tawaran").trigger("click");
    await flushPromises();
    expect(showErrorDialog).toHaveBeenCalledWith("Gagal batal");
  });
});
