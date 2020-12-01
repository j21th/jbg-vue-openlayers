import Vue from "vue"
import VueRouter from "vue-router"
import Map from "../views/Map.vue"

const originalPush = VueRouter.prototype.push

VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

Vue.use(VueRouter)

function lazyLoad(view){
  return () => import(`@/views/${view}.vue`)
}
const eRoutes = {
  home: "/",
  hotels: "/hotels/"
}

const routes = [
  { path: eRoutes.home, component: Map },
  { path: eRoutes.hotels, component: lazyLoad("Hotels") }
]

export { eRoutes }
export default new VueRouter({
  routes
})


