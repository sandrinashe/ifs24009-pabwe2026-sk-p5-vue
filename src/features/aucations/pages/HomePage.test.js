import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import HomePage from "./HomePage.vue";
import AddModal from "../modals/AddModal.vue";
import { renderWithProviders, createMockPinia } from "../../../test-utils";
import { useAucationsStore } from "../states/aucationsStore";
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showConfirmDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const aucations = [
  { id: 1, title: "Jam Tangan", description: "Jam antik", cover: "http://x/1.png", start_bid: 100000, closed_at: "2999-01-01 00:00:00", bids: [1, 2] },
  { id: 2, title: "Sepeda Lama", description: "Sepeda gunung", cover: null, start_bid: 500000, closed_at: "2000-01-01 00:00:00", bids: [] },
];

const mountPage = async ({ route = "/", state = { aucations } } = {}) => {
  const pinia = createMockPinia();
  const store = useAucationsStore();
  store.asyncGetAucations = vi.fn().mockResolvedValue({ success: true });
  store.asyncDeleteAllAucations = vi.fn().mockResolvedValue({ success: true });
  store.$patch(state);
  const rendered = await renderWithProviders(HomePage, { pinia, route });
  return { ...rendered, store };
};

const titles = (wrapper) => wrapper.findAll("[data-testid=aucation-card] h2").map((h) => h.text());

describe("HomePage", () => {
  beforeEach(() => {
    showConfirmDialog.mockReset();
    showErrorDialog.mockReset();
    showSuccessDialog.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should load all aucations on mount and render cards", async () => {
    const { wrapper, store } = await mountPage();
    expect(store.asyncGetAucations).toHaveBeenCalledWith({ is_me: undefined });
    expect(titles(wrapper)).toEqual(["Jam Tangan", "Sepeda Lama"]);

    const cards = wrapper.findAll("[data-testid=aucation-card]");
    expect(cards[0].attributes("href")).toBe("/aucations/1");
    expect(cards[0].find("img").attributes("src")).toBe("http://x/1.png");
    expect(cards[1].find("img").exists()).toBe(false);
    expect(cards[0].text()).toContain("2 tawaran");
    expect(cards[0].find("[data-testid=countdown]").text()).toContain("hari");
    expect(cards[1].find("[data-testid=countdown]").text()).toContain("Lelang ditutup");
  });

  it("should show a loading text", async () => {
    const { wrapper } = await mountPage({ state: { isAucation: true } });
    expect(wrapper.text()).toContain("Memuat data lelang");
  });

  it("should show an empty state", async () => {
    const { wrapper } = await mountPage({ state: { aucations: [] } });
    expect(wrapper.text()).toContain("Tidak ada lelang yang ditemukan");
  });

  it("should filter by the open and closed tabs", async () => {
    const open = await mountPage({ route: "/?tab=open" });
    expect(titles(open.wrapper)).toEqual(["Jam Tangan"]);

    const closed = await mountPage({ route: "/?tab=closed" });
    expect(titles(closed.wrapper)).toEqual(["Sepeda Lama"]);
  });

  it("should request only my aucations on the mine tab", async () => {
    const { store } = await mountPage({ route: "/?tab=mine" });
    expect(store.asyncGetAucations).toHaveBeenCalledWith({ is_me: 1 });
  });

  it("should switch tabs, update the query and reload", async () => {
    const { wrapper, router, store } = await mountPage();
    await wrapper.find("[data-testid=tab-mine]").trigger("click");
    await flushPromises();
    expect(router.currentRoute.value.query.tab).toBe("mine");
    expect(store.asyncGetAucations).toHaveBeenLastCalledWith({ is_me: 1 });
    expect(wrapper.find("[data-testid=tab-mine]").classes()).toContain("text-indigo-700");

    await wrapper.find("[data-testid=tab-all]").trigger("click");
    await flushPromises();
    expect(router.currentRoute.value.query.tab).toBeUndefined();
    expect(store.asyncGetAucations).toHaveBeenLastCalledWith({ is_me: undefined });
  });

  it("should search by title or description (live search)", async () => {
    const { wrapper } = await mountPage();
    await wrapper.find("input[type=search]").setValue("  gunung ");
    expect(titles(wrapper)).toEqual(["Sepeda Lama"]);
    await wrapper.find("input[type=search]").setValue("antik");
    expect(titles(wrapper)).toEqual(["Jam Tangan"]);
    await wrapper.find("input[type=search]").setValue("tidak ada");
    expect(wrapper.text()).toContain("Tidak ada lelang yang ditemukan");
  });

  it("should refresh the countdown every 30 seconds and stop on unmount", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
    vi.setSystemTime(new Date("1999-12-31T23:59:30"));
    const { wrapper } = await mountPage({ state: { aucations: [aucations[1]] } });
    expect(wrapper.find("[data-testid=countdown]").text()).toContain("0 menit lagi");

    vi.advanceTimersByTime(30000);
    await flushPromises();
    expect(wrapper.find("[data-testid=countdown]").text()).toContain("Lelang ditutup");
    wrapper.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("should open the add modal, then close it", async () => {
    const { wrapper } = await mountPage();
    expect(wrapper.findComponent(AddModal).exists()).toBe(false);
    await wrapper.findAll("button").find((b) => b.text().includes("Tambah Lelang")).trigger("click");
    expect(wrapper.findComponent(AddModal).exists()).toBe(true);

    await wrapper.findComponent(AddModal).vm.$emit("close");
    expect(wrapper.findComponent(AddModal).exists()).toBe(false);
  });

  it("should close the add modal and reload after saving", async () => {
    const { wrapper, store } = await mountPage();
    await wrapper.findAll("button").find((b) => b.text().includes("Tambah Lelang")).trigger("click");
    store.asyncGetAucations.mockClear();
    await wrapper.findComponent(AddModal).vm.$emit("saved");
    await flushPromises();
    expect(wrapper.findComponent(AddModal).exists()).toBe(false);
    expect(store.asyncGetAucations).toHaveBeenCalledTimes(1);
  });

  const clickDeleteAll = (wrapper) =>
    wrapper.findAll("button").find((b) => b.text().includes("Hapus Semua")).trigger("click");

  it("should not delete anything when the confirmation is cancelled", async () => {
    const { wrapper, store } = await mountPage();
    showConfirmDialog.mockResolvedValue(false);
    await clickDeleteAll(wrapper);
    await flushPromises();
    expect(store.asyncDeleteAllAucations).not.toHaveBeenCalled();
  });

  it("should delete all aucations after confirmation and reload", async () => {
    const { wrapper, store } = await mountPage();
    showConfirmDialog.mockResolvedValue(true);
    store.asyncGetAucations.mockClear();
    await clickDeleteAll(wrapper);
    await flushPromises();
    expect(store.asyncDeleteAllAucations).toHaveBeenCalled();
    expect(showSuccessDialog).toHaveBeenCalledWith("Semua lelang berhasil dihapus");
    expect(store.asyncGetAucations).toHaveBeenCalledTimes(1);
  });

  it("should show an error when deleting all fails", async () => {
    const { wrapper, store } = await mountPage();
    showConfirmDialog.mockResolvedValue(true);
    store.asyncDeleteAllAucations.mockResolvedValue({ success: false, message: "Unauthenticated." });
    await clickDeleteAll(wrapper);
    await flushPromises();
    expect(showErrorDialog).toHaveBeenCalledWith("Unauthenticated.");
    expect(showSuccessDialog).not.toHaveBeenCalled();
  });
});
