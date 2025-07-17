import { createApp } from 'vue'
import App from '../legacy/App.vue'
import router from '../legacy/router'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App).use(router).use(pinia)

app.mount('#app')
