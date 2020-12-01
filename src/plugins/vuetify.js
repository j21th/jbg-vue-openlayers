import Vue from "vue"
import Vuetify from "vuetify"
import "vuetify/dist/vuetify.min.css"

Vue.use(Vuetify)

const opts = {
  theme: {
    options: {
      customProperties: true,
    },
    themes: {
      light: {
        primary: "#059900"
      }
    }
  }
}

export default new Vuetify(opts)