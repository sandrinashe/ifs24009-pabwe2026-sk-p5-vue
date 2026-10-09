import { defineStore } from "pinia";
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
} from "../api/aucationApi";

// Menjalankan aksi mutasi sambil memperbarui flag "sedang diproses" dan "berhasil diproses".
async function mutate(store, pending, done, call) {
  store[pending] = true;
  store[done] = false;
  const result = await call();
  store[pending] = false;
  store[done] = result.success;
  return result;
}

export const useAucationsStore = defineStore("aucations", {
  state: () => ({
    aucations: [],
    aucation: null,
    isAucation: false,
    isAucationAdd: false,
    isAucationAdded: false,
    isAucationChange: false,
    isAucationChanged: false,
    isAucationChangeCover: false,
    isAucationChangedCover: false,
    isAucationDelete: false,
    isAucationDeleted: false,
    isBidAdd: false,
    isBidAdded: false,
    isBidDelete: false,
    isBidDeleted: false,
    isAucationDeleteAll: false,
    isAucationDeletedAll: false,
  }),
  actions: {
    async asyncGetAucations(params) {
      this.isAucation = true;
      const result = await getAucations(params);
      if (result.success) {
        this.aucations = result.data.aucations;
      }
      this.isAucation = false;
      return result;
    },
    async asyncGetAucation(id) {
      this.isAucation = true;
      this.aucation = null;
      const result = await getAucation(id);
      if (result.success) {
        this.aucation = result.data.aucation;
      }
      this.isAucation = false;
      return result;
    },
    asyncAddAucation(payload) {
      return mutate(this, "isAucationAdd", "isAucationAdded", () => postAucation(payload));
    },
    asyncChangeAucation(id, payload) {
      return mutate(this, "isAucationChange", "isAucationChanged", () => putAucation(id, payload));
    },
    asyncChangeCover(id, file) {
      return mutate(this, "isAucationChangeCover", "isAucationChangedCover", () => postCover(id, file));
    },
    asyncDeleteAucation(id) {
      return mutate(this, "isAucationDelete", "isAucationDeleted", () => deleteAucation(id));
    },
    asyncAddBid(id, bid) {
      return mutate(this, "isBidAdd", "isBidAdded", () => postBid(id, bid));
    },
    asyncDeleteBid(id) {
      return mutate(this, "isBidDelete", "isBidDeleted", () => deleteBid(id));
    },
    asyncDeleteAllAucations() {
      return mutate(this, "isAucationDeleteAll", "isAucationDeletedAll", () => deleteAllAucations());
    },
  },
});
