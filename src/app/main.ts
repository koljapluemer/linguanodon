import { createApp } from 'vue'
import App from '@/app/App.vue'
import router from '@/app/router'


const app = createApp(App).use(router)

app.mount('#app')
