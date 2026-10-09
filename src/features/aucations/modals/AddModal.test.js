import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import AddModal from "./AddModal.vue";
import MarkdownEditor from "../components/MarkdownEditor.vue";
import { renderWithProviders, createMockPinia } from "../../../test-utils";
import { useAucationsStore } from "../states/aucationsStore";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const mountModal = async (result = { success: true }) => {
  const pinia = createMockPinia();
  const store = useAucationsStore();
  store.asyncAddAucation = vi.fn().mockResolvedValue(result);
  const rendered = await renderWithProviders(AddModal, { pinia });
  return { ...rendered, store };
};

const fillAndSubmit = async (wrapper) => {
  await wrapper.find("#title").setValue("Jam Tangan");
  wrapper.findComponent(MarkdownEditor).vm.$emit("update:modelValue", "**Antik**");
  await wrapper.find("#start-bid").setValue("150000");
  await wrapper.find("#closed-at").setValue("2030-01-02T10:30");
  await wrapper.find("form").trigger("submit");
  await flushPromises();
};

describe("AddModal", () => {
  beforeEach(() => {
    showErrorDialog.mockReset();
    showSuccessDialog.mockReset();
  });

  it("should submit the new aucation and emit saved", async () => {
    const { wrapper, store } = await mountModal();
    await fillAndSubmit(wrapper);

    expect(store.asyncAddAucation).toHaveBeenCalledWith({
      title: "Jam Tangan",
      description: "**Antik**",
      start_bid: 150000,
      closed_at: "2030-01-02 10:30:00",
    });
    expect(showSuccessDialog).toHaveBeenCalledWith("Lelang berhasil ditambahkan");
    expect(wrapper.emitted("saved")).toHaveLength(1);
  });

  it("should show an error and stay open when saving fails", async () => {
    const { wrapper } = await mountModal({ success: false, message: "Judul wajib diisi" });
    await fillAndSubmit(wrapper);
    expect(showErrorDialog).toHaveBeenCalledWith("Judul wajib diisi");
    expect(wrapper.emitted("saved")).toBeUndefined();
  });

  it("should emit close from the close button and the backdrop only", async () => {
    const { wrapper } = await mountModal();
    await wrapper.find("button[aria-label=Tutup]").trigger("click");
    await wrapper.find("[data-testid=modal-backdrop]").trigger("click");
    await wrapper.find("form").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(2);
  });
});
