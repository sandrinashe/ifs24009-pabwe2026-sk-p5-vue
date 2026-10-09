import { defineStore } from "pinia";
import { getMe, getUsers, postPhoto, putMe, putPassword } from "../api/userApi";

export const useUsersStore = defineStore("users", {
  state: () => ({
    users: [],
    user: null,
    profile: null,
    isLoading: false,
    isProfileChange: false,
    isProfileChanged: false,
  }),
  actions: {
    async asyncGetUsers() {
      this.isLoading = true;
      const result = await getUsers();
      if (result.success) {
        this.users = result.data.users;
      }
      this.isLoading = false;
      return result;
    },
    async asyncGetProfile() {
      this.isLoading = true;
      const result = await getMe();
      if (result.success) {
        this.profile = result.data.user;
        this.user = result.data.user;
      }
      this.isLoading = false;
      return result;
    },
    async mutateProfile(call) {
      this.isProfileChange = true;
      this.isProfileChanged = false;
      const result = await call();
      if (result.success) {
        await this.asyncGetProfile();
      }
      this.isProfileChange = false;
      this.isProfileChanged = result.success;
      return result;
    },
    asyncChangeProfile(payload) {
      return this.mutateProfile(() => putMe(payload));
    },
    asyncChangePhoto(file) {
      return this.mutateProfile(() => postPhoto(file));
    },
    async asyncChangePassword(payload) {
      this.isProfileChange = true;
      const result = await putPassword(payload);
      this.isProfileChange = false;
      return result;
    },
  },
});
