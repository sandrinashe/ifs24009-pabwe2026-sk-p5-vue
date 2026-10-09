import { describe, it, expect, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import Editor from "@toast-ui/editor";
import MarkdownEditor from "./MarkdownEditor.vue";

describe("MarkdownEditor", () => {
  it("should lazy load the Editor with props and handle change event", async () => {
    const before = Editor.instances.length;
    const wrapper = mount(MarkdownEditor, { props: { modelValue: "# Halo" } });
    expect(Editor.instances).toHaveLength(before);

    await vi.dynamicImportSettled();
    await flushPromises();
    const editor = Editor.instances.at(-1);
    expect(Editor.instances).toHaveLength(before + 1);
    expect(editor.options.initialValue).toBe("# Halo");
    expect(editor.options.el).toBe(wrapper.element);

    editor.markdown = "# Baru";
    editor.handlers.change();
    expect(wrapper.emitted("update:modelValue")[0]).toEqual(["# Baru"]);
  });

  it("should use an empty default value and destroy the editor on unmount", async () => {
    const wrapper = mount(MarkdownEditor);
    await vi.dynamicImportSettled();
    await flushPromises();
    const editor = Editor.instances.at(-1);
    expect(editor.options.initialValue).toBe("");
    wrapper.unmount();
    expect(editor.destroyed).toBe(true);
  });

  it("should not create the editor when unmounted before the library has loaded", async () => {
    const before = Editor.instances.length;
    const wrapper = mount(MarkdownEditor);
    wrapper.unmount();
    await vi.dynamicImportSettled();
    await flushPromises();
    expect(Editor.instances).toHaveLength(before);
  });
});
