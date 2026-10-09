import { defineStore } from "pinia";
import { postLogin, postLogout, postRegister } from "../api/authApi";
import { getAccessToken, putAccessToken, removeAccessToken } from "../../../helpers/apiHelper";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: getAccessToken(),
    isLoading: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },
  actions: {
    async isAuthLogin(payload) {
      this.isLoading = true;
      const result = await postLogin(payload);
      if (result.success) {
        putAccessToken(result.data.token);
        this.token = result.data.token;
      }
      this.isLoading = false;
      return result;
    },
    async isAuthRegister(payload) {
      this.isLoading = true;
      const result = await postRegister(payload);
      this.isLoading = false;
      return result;
    },
    async isAuthLogout() {
      await postLogout();
      removeAccessToken();
      this.token = null;
    },
  },
});
