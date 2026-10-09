import Swal from "sweetalert2";

const COLOR = "#4f46e5";

export const showSuccessDialog = (message) =>
  Swal.fire({ icon: "success", title: "Berhasil", text: message, confirmButtonColor: COLOR });

export const showErrorDialog = (message) =>
  Swal.fire({ icon: "error", title: "Gagal", text: message, confirmButtonColor: COLOR });

export const showWarningDialog = (message) =>
  Swal.fire({ icon: "warning", title: "Perhatian", text: message, confirmButtonColor: COLOR });

export const showConfirmDialog = async (message, confirmText = "Ya, lanjutkan") => {
  const result = await Swal.fire({
    icon: "question",
    title: "Konfirmasi",
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Batal",
    confirmButtonColor: COLOR,
  });
  return result.isConfirmed;
};

export const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));

// Mendukung "2024-10-05 22:00:00" maupun ISO "2024-10-05T12:09:16.000000Z"
export const parseDate = (value) => new Date(String(value).replace(" ", "T"));

export const formatDate = (value) =>
  new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(
    parseDate(value)
  );

export const isAucationClosed = (closedAt, now = Date.now()) => parseDate(closedAt).getTime() <= now;

export const getCountdown = (closedAt, now = Date.now()) => {
  const diff = parseDate(closedAt).getTime() - now;
  if (diff <= 0) {
    return "Lelang ditutup";
  }
  const minutes = Math.floor(diff / 60000) % 60;
  const hours = Math.floor(diff / 3600000) % 24;
  const days = Math.floor(diff / 86400000);
  if (days > 0) {
    return `${days} hari ${hours} jam lagi`;
  }
  if (hours > 0) {
    return `${hours} jam ${minutes} menit lagi`;
  }
  return `${minutes} menit lagi`;
};

// "2024-10-05 22:00:00" -> "2024-10-05T22:00" (value untuk <input type="datetime-local">)
export const toInputDateTime = (value) => String(value).replace(" ", "T").slice(0, 16);

// "2024-10-05T22:00" -> "2024-10-05 22:00:00" (format yang diterima API)
export const toApiDateTime = (value) => `${value.replace("T", " ")}:00`;

export const getHighestBid = (aucation) =>
  Math.max(
    Number(aucation.start_bid),
    ...aucation.bids.filter((bid) => typeof bid === "object").map((bid) => Number(bid.bid))
  );

export const getInitial = (name) => String(name).trim().charAt(0).toUpperCase();

// Menghilangkan simbol markdown sederhana untuk ringkasan teks pada kartu
export const stripMarkdown = (text) => String(text).replace(/[#*_`>~]/g, "").trim();
