import { describe, it, expect, vi, beforeEach } from "vitest";
import Swal from "sweetalert2";
import {
  formatDate,
  formatRupiah,
  getCountdown,
  getHighestBid,
  getInitial,
  isAucationClosed,
  parseDate,
  stripMarkdown,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
  showWarningDialog,
  toApiDateTime,
  toInputDateTime,
} from "./toolsHelper";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));

describe("toolsHelper dialogs", () => {
  beforeEach(() => {
    Swal.fire.mockReset();
  });

  it("should show success, error and warning dialogs", () => {
    showSuccessDialog("ok");
    showErrorDialog("gagal");
    showWarningDialog("awas");
    expect(Swal.fire.mock.calls.map(([o]) => o.icon)).toEqual(["success", "error", "warning"]);
    expect(Swal.fire.mock.calls[0][0].text).toBe("ok");
  });

  it("should resolve confirm dialog result", async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: true });
    expect(await showConfirmDialog("yakin?")).toBe(true);
    expect(Swal.fire.mock.calls[0][0].confirmButtonText).toBe("Ya, lanjutkan");

    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    expect(await showConfirmDialog("yakin?", "Hapus")).toBe(false);
    expect(Swal.fire.mock.calls[1][0].confirmButtonText).toBe("Hapus");
  });
});

describe("toolsHelper formatters", () => {
  it("should format rupiah", () => {
    expect(formatRupiah(1500000).replace(/\s/g, " ")).toMatch(/Rp\s?1\.500\.000/);
  });

  it("should parse both sql and iso dates", () => {
    expect(parseDate("2024-10-05 22:00:00").getHours()).toBe(22);
    expect(parseDate("2024-10-05T12:09:16.000000Z").toISOString()).toBe("2024-10-05T12:09:16.000Z");
  });

  it("should format date", () => {
    expect(formatDate("2024-10-05 22:00:00")).toMatch(/2024/);
  });

  it("should convert datetime-local <-> api format", () => {
    expect(toInputDateTime("2024-10-05 22:00:00")).toBe("2024-10-05T22:00");
    expect(toApiDateTime("2024-10-05T22:00")).toBe("2024-10-05 22:00:00");
  });

  it("should detect closed aucation", () => {
    const now = new Date("2024-10-05T10:00:00").getTime();
    expect(isAucationClosed("2024-10-05 09:00:00", now)).toBe(true);
    expect(isAucationClosed("2024-10-05 11:00:00", now)).toBe(false);
    expect(typeof isAucationClosed("2999-01-01 00:00:00")).toBe("boolean");
  });

  it("should build countdown text", () => {
    const now = new Date("2024-10-05T10:00:00").getTime();
    expect(getCountdown("2024-10-05 09:00:00", now)).toBe("Lelang ditutup");
    expect(getCountdown("2024-10-07 12:00:00", now)).toBe("2 hari 2 jam lagi");
    expect(getCountdown("2024-10-05 12:30:00", now)).toBe("2 jam 30 menit lagi");
    expect(getCountdown("2024-10-05 10:15:00", now)).toBe("15 menit lagi");
    expect(getCountdown("2999-01-01 00:00:00")).toMatch(/hari/);
  });

  it("should compute highest bid from start bid and bid objects (ignoring id arrays)", () => {
    expect(getHighestBid({ start_bid: 100, bids: [] })).toBe(100);
    expect(getHighestBid({ start_bid: 100, bids: [1, 2] })).toBe(100);
    expect(getHighestBid({ start_bid: 100, bids: [{ bid: 300 }, { bid: 200 }] })).toBe(300);
  });

  it("should strip markdown symbols", () => {
    expect(stripMarkdown("# Judul **tebal** _miring_ `kode`")).toBe("Judul tebal miring kode");
  });

  it("should get initial", () => {
    expect(getInitial("  sandrina")).toBe("S");
  });
});
