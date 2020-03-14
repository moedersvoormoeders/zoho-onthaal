import Vue from 'vue'
import VueRouter from 'vue-router'
import Search from '../views/Search.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/search',
    name: 'search',
    component: Search
  },
]

const router = new VueRouter({
  routes
})

router.push("search")

export default router
