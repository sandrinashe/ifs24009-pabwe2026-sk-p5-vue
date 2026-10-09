import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import BidModal from "./BidModal.vue";
import { renderWithProviders, createMockPinia } from "../../../test-utils";
import { useAucationsStore } from "../states/aucationsStore";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const aucation = { id: 9, start_bid: 100000, bids: [{ bid: 250000 }, { bid: 200000 }] };

const mountModal = async (result = { success: true }) => {
  const pinia = createMockPinia();
  const store = useAucationsStore();
  store.asyncAddBid = vi.fn().mockResolvedValue(result);
  const rendered = await renderWithProviders(BidModal, { pinia, props: { aucation } });
  return { ...rendered, store };
};

describe("BidModal", () => {
  beforeEach(() => {
    showErrorDialog.mockReset();
    showSuccessDialog.mockReset();
  });

  it("should display the current highest bid", async () => {
    const { wrapper } = await mountModal();
    expect(wrapper.find("[data-testid=highest-bid]").text().replace(/\s/g, "")).toMatch(/Rp250\.000/);
  });

  it("should reject a bid that is not higher than the highest bid", async () => {
    const { wrapper, store } = await mountModal();
    await wrapper.find("#bid").setValue("250000");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(showErrorDialog.mock.calls[0][0]).toContain("Tawaran harus lebih tinggi dari");
    expect(store.asyncAddBid).not.toHaveBeenCalled();
  });

  it("should submit a higher bid and emit saved", async () => {
    const { wrapper, store } = await mountModal();
    await wrapper.find("#bid").setValue("300000");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(store.asyncAddBid).toHaveBeenCalledWith(9, 300000);
    expect(showSuccessDialog).toHaveBeenCalledWith("Tawaran berhasil diajukan");
    expect(wrapper.emitted("saved")).toHaveLength(1);
  });

  it("should show the server error when the bid fails", async () => {
    const { wrapper } = await mountModal({ success: false, message: "Lelang sudah ditutup" });
    await wrapper.find("#bid").setValue("300000");
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(showErrorDialog).toHaveBeenCalledWith("Lelang sudah ditutup");
    expect(wrapper.emitted("saved")).toBeUndefined();
  });

  it("should emit close from the close button and the backdrop", async () => {
    const { wrapper } = await mountModal();
    await wrapper.find("button[aria-label=Tutup]").trigger("click");
    await wrapper.find("[data-testid=modal-backdrop]").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(2);
  });
});
