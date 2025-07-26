import { createApp } from 'vue';
import App from '@/app/App.vue';
import router from '@/app/router';
import { provideRepositories } from '@/app/injectRepositories';

const app = createApp(App);

app.use(router);

// Setup dependency injection
provideRepositories(app);

app.mount('#app');