import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Simplert from 'vue2-simplert-plugin'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faSearch, faPlusSquare, faMinusCircle, faCheckSquare, faExclamationTriangle, faTimesOctagon } from '@fortawesome/pro-solid-svg-icons'
import { faTrash, faLongArrowLeft, faBoxHeart, faPrint } from '@fortawesome/pro-duotone-svg-icons'
import { faSave, faHistory } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
 
library.add(faSearch, faPlusSquare, faMinusCircle, faTrash, faSave, faLongArrowLeft, faBoxHeart, faCheckSquare, faExclamationTriangle, faTimesOctagon, faPrint, faHistory)
 
Vue.component('font-awesome-icon', FontAwesomeIcon)
require('vue2-simplert-plugin/dist/vue2-simplert-plugin.css')

Vue.use(Simplert)
Vue.config.productionTip = false

Vue.directive('focus', {
  inserted: function (el) {
      el.focus()
  }
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
