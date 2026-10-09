import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Editor from "@toast-ui/editor";
import MarkdownEditor from "./MarkdownEditor.vue";

describe("MarkdownEditor", () => {
  it("should initialize Editor with props and handle change event", () => {
    const wrapper = mount(MarkdownEditor, { props: { modelValue: "# Halo" } });
    const editor = Editor.instances.at(-1);

    expect(editor.options.initialValue).toBe("# Halo");
    expect(editor.options.el).toBe(wrapper.element);

    editor.markdown = "# Baru";
    editor.handlers.change();
    expect(wrapper.emitted("update:modelValue")[0]).toEqual(["# Baru"]);
  });

  it("should use an empty default value and destroy the editor on unmount", () => {
    const wrapper = mount(MarkdownEditor);
    const editor = Editor.instances.at(-1);
    expect(editor.options.initialValue).toBe("");
    wrapper.unmount();
    expect(editor.destroyed).toBe(true);
  });
});
