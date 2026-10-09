import { describe, it, expect, vi } from "vitest";
import {
  deleteAllAucations,
  deleteAucation,
  deleteBid,
  getAucation,
  getAucations,
  postAucation,
  postBid,
  postCover,
  putAucation,
} from "./aucationApi";
import { apiFetch } from "../../../helpers/apiHelper";

vi.mock("../../../helpers/apiHelper", () => ({ apiFetch: vi.fn().mockResolvedValue({ success: true }) }));

const payload = { title: "T", description: "D", start_bid: 1000, closed_at: "2030-01-01 10:00:00", extra: "x" };
const body = { title: "T", description: "D", start_bid: 1000, closed_at: "2030-01-01 10:00:00" };

describe("aucationApi", () => {
  it("should get aucations with and without filters", async () => {
    await getAucations();
    expect(apiFetch).toHaveBeenLastCalledWith("/aucations", { query: { is_me: undefined, is_closed: undefined } });
    await getAucations({ is_me: 1, is_closed: 0 });
    expect(apiFetch).toHaveBeenLastCalledWith("/aucations", { query: { is_me: 1, is_closed: 0 } });
  });

  it("should get an aucation detail", async () => {
    await getAucation(7);
    expect(apiFetch).toHaveBeenLastCalledWith("/aucations/7");
  });

  it("should post and put an aucation", async () => {
    await postAucation(payload);
    expect(apiFetch).toHaveBeenLastCalledWith("/aucations", { method: "POST", body });
    await putAucation(7, payload);
    expect(apiFetch).toHaveBeenLastCalledWith("/aucations/7", { method: "PUT", body });
  });

  it("should upload the cover as form data", async () => {
    await postCover(7, new File(["x"], "c.png"));
    const [path, options] = apiFetch.mock.calls.at(-1);
    expect(path).toBe("/aucations/7/cover");
    expect(options.method).toBe("POST");
    expect(options.formData.get("cover").name).toBe("c.png");
  });

  it("should delete an aucation and all aucations", async () => {
    await deleteAucation(7);
    expect(apiFetch).toHaveBeenLastCalledWith("/aucations/7", { method: "DELETE" });
    await deleteAllAucations();
    expect(apiFetch).toHaveBeenLastCalledWith("/aucations", { method: "DELETE" });
  });

  it("should add and delete a bid", async () => {
    await postBid(7, 5000);
    expect(apiFetch).toHaveBeenLastCalledWith("/aucations/7/bids", { method: "POST", body: { bid: 5000 } });
    await deleteBid(7);
    expect(apiFetch).toHaveBeenLastCalledWith("/aucations/7/bids", { method: "DELETE" });
  });
});
