import { createApp } from "vue";
import { createPinia } from "pinia";
import { createWebHistory } from "vue-router";
import App from "./App.vue";
import { createAppRouter } from "./router";
import "./index.css";

createApp(App).use(createPinia()).use(createAppRouter(createWebHistory())).mount("#app");
