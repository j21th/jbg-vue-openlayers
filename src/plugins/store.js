import Vue from "vue"
import Vuex from "vuex"
import hotels from "../store/hotels"

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    hotels
  }
})
