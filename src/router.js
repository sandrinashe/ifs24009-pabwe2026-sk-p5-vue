import { createRouter } from "vue-router";
import { getAccessToken } from "./helpers/apiHelper";
import AuthLayout from "./features/auth/layouts/AuthLayout.vue";
import LoginPage from "./features/auth/pages/LoginPage.vue";
import RegisterPage from "./features/auth/pages/RegisterPage.vue";
import AucationLayout from "./features/aucations/layouts/AucationLayout.vue";
import HomePage from "./features/aucations/pages/HomePage.vue";
import DetailPage from "./features/aucations/pages/DetailPage.vue";
import UsersPage from "./features/users/pages/UsersPage.vue";
import ProfilePage from "./features/users/pages/ProfilePage.vue";
import NotFoundPage from "./features/common/pages/NotFoundPage.vue";

// Halaman yang membutuhkan login: arahkan ke /auth/login bila belum ada token
export const requireAuth = () => (getAccessToken() ? true : "/auth/login");

// Halaman login/register: arahkan ke beranda bila sudah login
export const requireGuest = () => (getAccessToken() ? "/" : true);

export const routes = [
  {
    path: "/auth",
    component: AuthLayout,
    beforeEnter: requireGuest,
    children: [
      { path: "", redirect: "/auth/login" },
      { path: "login", component: LoginPage },
      { path: "register", component: RegisterPage },
    ],
  },
  {
    path: "/",
    component: AucationLayout,
    beforeEnter: requireAuth,
    children: [
      { path: "", component: HomePage },
      { path: "aucations/:aucationId", component: DetailPage },
      { path: "users", component: UsersPage },
      { path: "profile", component: ProfilePage },
    ],
  },
  { path: "/:pathMatch(.*)*", component: NotFoundPage },
];

export const createAppRouter = (history) => createRouter({ history, routes });

export default createAppRouter;
