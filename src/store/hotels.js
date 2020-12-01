import hotelService from "../api/hotels"

export default {
  namespaced: false,
  state: {
    hotels: null,
    loading: false
  },
  getters: {
    getHotels: (state, getters, rootState) => { // eslint-disable-line
      return state.hotels || []
    },
    getLoading: (state, getters, rootState) => { // eslint-disable-line
      return state.loading
    }
  },
  mutations: {
    saveHotels: (state, payload) => {
      state.hotels = payload || []
    },
    saveLoading: (state, loading) => {
      state.loading = loading
    }
  },
  actions: {
    getHotels (store, forceRefresh) {
      return new Promise((resolve, reject) => {  
        store.dispatch("setLoading", true)

        if (!forceRefresh && store.state.hotels) {
          resolve(store.getters.getHotels)
          store.dispatch("setLoading", false)
          return
        }
        hotelService.getHotels().subscribe(
          resp => {
            store.commit("saveHotels", resp)
            resolve(store.getters.getHotels)
          },
          error => {
            reject(error)
          },
          () => {
            store.dispatch("setLoading", false)
          }
        )
      })
    },
    setLoading(store, loading) {
      store.commit("saveLoading", loading)
    }
  }
}