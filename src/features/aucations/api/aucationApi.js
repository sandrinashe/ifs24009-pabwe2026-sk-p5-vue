import { apiFetch } from "../../../helpers/apiHelper";

const pickPayload = ({ title, description, start_bid, closed_at }) => ({
  title,
  description,
  start_bid,
  closed_at,
});

export const getAucations = ({ is_me, is_closed } = {}) =>
  apiFetch("/aucations", { query: { is_me, is_closed } });

export const getAucation = (id) => apiFetch(`/aucations/${id}`);

export const postAucation = (payload) =>
  apiFetch("/aucations", { method: "POST", body: pickPayload(payload) });

export const putAucation = (id, payload) =>
  apiFetch(`/aucations/${id}`, { method: "PUT", body: pickPayload(payload) });

export const postCover = (id, file) => {
  const formData = new FormData();
  formData.append("cover", file);
  return apiFetch(`/aucations/${id}/cover`, { method: "POST", formData });
};

export const deleteAucation = (id) => apiFetch(`/aucations/${id}`, { method: "DELETE" });

export const postBid = (id, bid) =>
  apiFetch(`/aucations/${id}/bids`, { method: "POST", body: { bid } });

export const deleteBid = (id) => apiFetch(`/aucations/${id}/bids`, { method: "DELETE" });

export const deleteAllAucations = () => apiFetch("/aucations", { method: "DELETE" });
