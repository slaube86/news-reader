import { createRouter, createWebHistory } from 'vue-router'

const HomeView = { template: '<div />' }

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
  ],
})

export default router
