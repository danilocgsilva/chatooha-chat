// import './tailwind.css'
// import { createApp } from 'vue'
// import App from './App.vue'
// import router from './router'

// createApp(App).use(router).mount('#app')
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './tailwind.css';
import router from './router'

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.mount('#app');