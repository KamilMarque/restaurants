import Vue from 'vue'
import App from './App.vue'
import * as VueGoogleMaps from 'vue2-google-maps'
import SuiVue from 'semantic-ui-vue'

Vue.use(SuiVue)

Vue.use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyAoyHI-r4PMeidsDSnEKuvr4H_LsmzBO-A',
    libraries: 'places'
  }
})

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
