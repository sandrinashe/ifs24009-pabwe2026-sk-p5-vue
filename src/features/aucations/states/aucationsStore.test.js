import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAucationsStore } from "./aucationsStore";
import { createMockPinia } from "../../../test-utils";
import * as api from "../api/aucationApi";

vi.mock("../api/aucationApi");

const item = { id: 1, title: "Jam Tangan" };

describe("aucationsStore", () => {
  beforeEach(() => {
    createMockPinia();
  });

  it("should load aucations with params", async () => {
    api.getAucations.mockResolvedValue({ success: true, data: { aucations: [item] } });
    const store = useAucationsStore();
    await store.asyncGetAucations({ is_me: 1 });
    expect(api.getAucations).toHaveBeenCalledWith({ is_me: 1 });
    expect(store.aucations).toEqual([item]);
    expect(store.isAucation).toBe(false);
  });

  it("should keep aucations when loading fails", async () => {
    api.getAucations.mockResolvedValue({ success: false });
    const store = useAucationsStore();
    await store.asyncGetAucations();
    expect(store.aucations).toEqual([]);
  });

  it("should load an aucation detail and reset it first", async () => {
    let during;
    api.getAucation.mockImplementation(async () => {
      during = { aucation: useAucationsStore().aucation, loading: useAucationsStore().isAucation };
      return { success: true, data: { aucation: item } };
    });
    const store = useAucationsStore();
    store.aucation = { id: 99 };
    await store.asyncGetAucation(1);
    expect(during).toEqual({ aucation: null, loading: true });
    expect(store.aucation).toEqual(item);
  });

  it("should leave aucation null when the detail request fails", async () => {
    api.getAucation.mockResolvedValue({ success: false });
    const store = useAucationsStore();
    await store.asyncGetAucation(1);
    expect(store.aucation).toBeNull();
  });

  it.each([
    ["asyncAddAucation", "postAucation", ["P"], "isAucationAdd", "isAucationAdded"],
    ["asyncChangeAucation", "putAucation", [1, "P"], "isAucationChange", "isAucationChanged"],
    ["asyncChangeCover", "postCover", [1, "F"], "isAucationChangeCover", "isAucationChangedCover"],
    ["asyncDeleteAucation", "deleteAucation", [1], "isAucationDelete", "isAucationDeleted"],
    ["asyncAddBid", "postBid", [1, 5000], "isBidAdd", "isBidAdded"],
    ["asyncDeleteBid", "deleteBid", [1], "isBidDelete", "isBidDeleted"],
    ["asyncDeleteAllAucations", "deleteAllAucations", [], "isAucationDeleteAll", "isAucationDeletedAll"],
  ])("%s should track pending and done flags", async (action, apiName, args, pending, done) => {
    const store = useAucationsStore();
    let pendingDuring;
    api[apiName].mockImplementation(async () => {
      pendingDuring = store[pending];
      return { success: true, message: "ok" };
    });

    const result = await store[action](...args);
    expect(api[apiName]).toHaveBeenCalledWith(...args);
    expect(pendingDuring).toBe(true);
    expect(store[pending]).toBe(false);
    expect(store[done]).toBe(true);
    expect(result.message).toBe("ok");

    api[apiName].mockResolvedValue({ success: false });
    await store[action](...args);
    expect(store[done]).toBe(false);
  });
});
