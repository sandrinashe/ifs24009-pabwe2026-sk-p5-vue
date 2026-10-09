import { createRouter } from "vue-router";
import { getAccessToken } from "./helpers/apiHelper";

// Halaman yang membutuhkan login: arahkan ke /auth/login bila belum ada token
export const requireAuth = () => (getAccessToken() ? true : "/auth/login");

// Halaman login/register: arahkan ke beranda bila sudah login
export const requireGuest = () => (getAccessToken() ? "/" : true);

export const routes = [
  {
    path: "/auth",
    component: () => import("./features/auth/layouts/AuthLayout.vue"),
    beforeEnter: requireGuest,
    children: [
      { path: "", redirect: "/auth/login" },
      { path: "login", component: () => import("./features/auth/pages/LoginPage.vue") },
      { path: "register", component: () => import("./features/auth/pages/RegisterPage.vue") },
    ],
  },
  {
    path: "/",
    component: () => import("./features/aucations/layouts/AucationLayout.vue"),
    beforeEnter: requireAuth,
    children: [
      { path: "", component: () => import("./features/aucations/pages/HomePage.vue") },
      { path: "aucations/:aucationId", component: () => import("./features/aucations/pages/DetailPage.vue") },
      { path: "users", component: () => import("./features/users/pages/UsersPage.vue") },
      { path: "profile", component: () => import("./features/users/pages/ProfilePage.vue") },
    ],
  },
  { path: "/:pathMatch(.*)*", component: () => import("./features/common/pages/NotFoundPage.vue") },
];

export const createAppRouter = (history) => createRouter({ history, routes });

export default createAppRouter;
