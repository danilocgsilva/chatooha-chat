import { createRouter, createWebHistory } from 'vue-router';

import Index from '../pages/IndexComponent.vue'
import Stats from '../pages/StatsComponent.vue'
import HistoryLog from '../pages/HistoryLogComponent.vue'

const routes = [
    {
        path: '/',
        name: 'Index',
        component: Index
    },
    {
        path: '/stats',
        name: 'Stats',
        component: Stats
    },
    {
        path: '/history',
        name: 'History',
        component: HistoryLog
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;