import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router'
import App from '@/App.vue'

import '@/assets/styles/variables.css'
import '@/assets/styles/base.css'
import '@/assets/styles/layout.css'
import '@/assets/styles/source-colors.css'
import '@/assets/styles/transitions.css'
import '@/assets/styles/responsive.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
