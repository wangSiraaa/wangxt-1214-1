import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import 'primevue/resources/themes/lara-light-blue/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'

import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import Textarea from 'primevue/textarea'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'

import App from './App.vue'
import router from './router'
import './styles/global.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, { ripple: true })

app.component('InputText', InputText)
app.component('InputNumber', InputNumber)
app.component('Button', Button)
app.component('Dropdown', Dropdown)
app.component('Textarea', Textarea)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('TabView', TabView)
app.component('TabPanel', TabPanel)

app.mount('#app')
