import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import ChangeCoverModal from "./ChangeCoverModal.vue";
import { renderWithProviders, createMockPinia } from "../../../test-utils";
import { useAucationsStore } from "../states/aucationsStore";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const mountModal = async (cover = null, result = { success: true }) => {
  const pinia = createMockPinia();
  const store = useAucationsStore();
  store.asyncChangeCover = vi.fn().mockResolvedValue(result);
  const rendered = await renderWithProviders(ChangeCoverModal, { pinia, props: { aucation: { id: 3, cover } } });
  return { ...rendered, store };
};

const pickFile = async (wrapper, file) => {
  const input = wrapper.find("#cover");
  Object.defineProperty(input.element, "files", { value: [file], configurable: true });
  await input.trigger("change");
};

describe("ChangeCoverModal", () => {
  beforeEach(() => {
    showErrorDialog.mockReset();
    showSuccessDialog.mockReset();
  });

  it("should show a placeholder when there is no cover", async () => {
    const { wrapper } = await mountModal(null);
    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.text()).toContain("Belum ada cover");
  });

  it("should show the existing cover and a live preview of the chosen file", async () => {
    const { wrapper } = await mountModal("http://x/old.png");
    expect(wrapper.find("img").attributes("src")).toBe("http://x/old.png");

    await pickFile(wrapper, new File(["x"], "new.png", { type: "image/png" }));
    expect(wrapper.find("img").attributes("src")).toBe("blob:mock-preview");
  });

  it("should require a file before uploading", async () => {
    const { wrapper, store } = await mountModal();
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(showErrorDialog).toHaveBeenCalledWith("Pilih gambar cover terlebih dahulu");
    expect(store.asyncChangeCover).not.toHaveBeenCalled();
  });

  it("should upload the cover and emit saved", async () => {
    const { wrapper, store } = await mountModal();
    const file = new File(["x"], "new.png", { type: "image/png" });
    await pickFile(wrapper, file);
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(store.asyncChangeCover).toHaveBeenCalledWith(3, file);
    expect(showSuccessDialog).toHaveBeenCalledWith("Cover berhasil diubah");
    expect(wrapper.emitted("saved")).toHaveLength(1);
  });

  it("should show an error when the upload fails", async () => {
    const { wrapper } = await mountModal(null, { success: false, message: "Format salah" });
    await pickFile(wrapper, new File(["x"], "new.txt"));
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(showErrorDialog).toHaveBeenCalledWith("Format salah");
    expect(wrapper.emitted("saved")).toBeUndefined();
  });

  it("should emit close from the close button and the backdrop", async () => {
    const { wrapper } = await mountModal();
    await wrapper.find("button[aria-label=Tutup]").trigger("click");
    await wrapper.find("[data-testid=modal-backdrop]").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(2);
  });
});
