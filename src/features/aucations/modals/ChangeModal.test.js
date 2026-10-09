import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import ChangeModal from "./ChangeModal.vue";
import MarkdownEditor from "../components/MarkdownEditor.vue";
import { renderWithProviders, createMockPinia } from "../../../test-utils";
import { useAucationsStore } from "../states/aucationsStore";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const aucation = {
  id: 5,
  title: "Sepeda",
  description: "Sepeda gunung",
  start_bid: 500000,
  closed_at: "2030-03-04 08:15:00",
};

const mountModal = async (result = { success: true }) => {
  const pinia = createMockPinia();
  const store = useAucationsStore();
  store.asyncChangeAucation = vi.fn().mockResolvedValue(result);
  const rendered = await renderWithProviders(ChangeModal, { pinia, props: { aucation } });
  return { ...rendered, store };
};

describe("ChangeModal", () => {
  beforeEach(() => {
    showErrorDialog.mockReset();
    showSuccessDialog.mockReset();
  });

  it("should prefill the form from the aucation", async () => {
    const { wrapper } = await mountModal();
    expect(wrapper.find("#title").element.value).toBe("Sepeda");
    expect(wrapper.find("#start-bid").element.value).toBe("500000");
    expect(wrapper.find("#closed-at").element.value).toBe("2030-03-04T08:15");
    expect(wrapper.findComponent(MarkdownEditor).props("modelValue")).toBe("Sepeda gunung");
  });

  it("should submit the changes and emit saved", async () => {
    const { wrapper, store } = await mountModal();
    await wrapper.find("#title").setValue("Sepeda Lipat");
    wrapper.findComponent(MarkdownEditor).vm.$emit("update:modelValue", "Lipat");
    await wrapper.find("#start-bid").setValue("600000");
    await wrapper.find("#closed-at").setValue("2030-03-05T09:00");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(store.asyncChangeAucation).toHaveBeenCalledWith(5, {
      title: "Sepeda Lipat",
      description: "Lipat",
      start_bid: 600000,
      closed_at: "2030-03-05 09:00:00",
    });
    expect(showSuccessDialog).toHaveBeenCalledWith("Lelang berhasil diubah");
    expect(wrapper.emitted("saved")).toHaveLength(1);
  });

  it("should show an error when the change fails", async () => {
    const { wrapper } = await mountModal({ success: false, message: "Tidak valid" });
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(showErrorDialog).toHaveBeenCalledWith("Tidak valid");
    expect(wrapper.emitted("saved")).toBeUndefined();
  });

  it("should emit close from the close button and the backdrop", async () => {
    const { wrapper } = await mountModal();
    await wrapper.find("button[aria-label=Tutup]").trigger("click");
    await wrapper.find("[data-testid=modal-backdrop]").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(2);
  });
});
