/*
  Aplicación ejemplo web con mapas programada y diseñada por Jose B. G.
  Madrid, 29 de septiembre de 2020
*/

import Vue from "vue"
import App from "./App.vue"
import store from "./plugins/store"
import router from "./plugins/router"
import vuetify from "./plugins/vuetify"
import i18n from "./plugins/translate"

Vue.config.productionTip = false

new Vue({
  el: "#app",
  router,
  store,
  vuetify,
  i18n,
  render: fn => fn(App)
})
