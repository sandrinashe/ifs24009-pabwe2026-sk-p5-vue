import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Viewer from "@toast-ui/editor/viewer";
import MarkdownViewer from "./MarkdownViewer.vue";

describe("MarkdownViewer", () => {
  it("should render the initial content and update it when the prop changes", async () => {
    const wrapper = mount(MarkdownViewer, { props: { content: "# A" } });
    const viewer = Viewer.instances.at(-1);
    expect(viewer.options.initialValue).toBe("# A");

    await wrapper.setProps({ content: "# B" });
    expect(viewer.markdown).toBe("# B");
  });

  it("should default to empty content and destroy on unmount", () => {
    const wrapper = mount(MarkdownViewer);
    const viewer = Viewer.instances.at(-1);
    expect(viewer.options.initialValue).toBe("");
    wrapper.unmount();
    expect(viewer.destroyed).toBe(true);
  });
});
