import { createRouter, createWebHistory } from 'vue-router';
import Index from '../pages/IndexComponent.vue'
import Stats from '../pages/StatsComponent.vue'

const routes = [
    {
        path: '/',
        name: 'Index',
        component: Index,
        meta: { keepAlive: true }
    },
    {
        path: '/stats',
        name: 'Stats',
        component: Stats,
        meta: { keepAlive: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;