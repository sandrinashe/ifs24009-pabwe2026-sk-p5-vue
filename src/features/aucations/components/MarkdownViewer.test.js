import { describe, it, expect, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import Viewer from "@toast-ui/editor/viewer";
import MarkdownViewer from "./MarkdownViewer.vue";

describe("MarkdownViewer", () => {
  it("should lazy load the viewer with the initial content and update it when the prop changes", async () => {
    const before = Viewer.instances.length;
    const wrapper = mount(MarkdownViewer, { props: { content: "# A" } });
    expect(Viewer.instances).toHaveLength(before);

    await vi.dynamicImportSettled();
    await flushPromises();
    const viewer = Viewer.instances.at(-1);
    expect(viewer.options.initialValue).toBe("# A");

    await wrapper.setProps({ content: "# B" });
    expect(viewer.markdown).toBe("# B");
  });

  it("should ignore content changes while the library is still loading", async () => {
    const wrapper = mount(MarkdownViewer, { props: { content: "# A" } });
    await wrapper.setProps({ content: "# B" });
    await vi.dynamicImportSettled();
    await flushPromises();
    expect(Viewer.instances.at(-1).options.initialValue).toBe("# B");
  });

  it("should default to empty content and destroy on unmount", async () => {
    const wrapper = mount(MarkdownViewer);
    await vi.dynamicImportSettled();
    await flushPromises();
    const viewer = Viewer.instances.at(-1);
    expect(viewer.options.initialValue).toBe("");
    wrapper.unmount();
    expect(viewer.destroyed).toBe(true);
  });

  it("should not create the viewer when unmounted before the library has loaded", async () => {
    const before = Viewer.instances.length;
    const wrapper = mount(MarkdownViewer);
    wrapper.unmount();
    await vi.dynamicImportSettled();
    await flushPromises();
    expect(Viewer.instances).toHaveLength(before);
  });
});
