import Vue from "vue"
import VueI18n from "vue-i18n"
import en from "../i18n/en.js"

Vue.use(VueI18n)

const messages = {
  en
}

export default new VueI18n({
  locale: "en",
  messages
})
