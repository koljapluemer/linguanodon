import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { useSetStore } from './stores/setStore'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App).use(router).use(pinia)

// Initialize setStore data
const setStore = useSetStore(pinia)
if (setStore.getAllSets.length === 0) {
  setStore.seedInitialData()
}

app.mount('#app')
