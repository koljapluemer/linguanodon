import { createApp } from 'vue';
import App from '@/app/App.vue';
import router from '@/app/router';
import i18n from '@/app/i18n';

const app = createApp(App);

app.use(router);
app.use(i18n);

app.mount('#app');