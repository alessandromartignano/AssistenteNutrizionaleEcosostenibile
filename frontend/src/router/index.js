import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home/Home.vue';
import Login from '../views/Login/Login.vue';
import Registration from '../views/Registration/Registration.vue';
import ProductInfo from '../views/ProductInfo/ProductInfo.vue';
import Meals from '../views/Meals/Meals.vue';
import CalculateMeal from '../views/CalculateMeal/CalculateMeal.vue';
import Profile from '../views/Profile/Profile.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
  },
  {
    path: '/registration',
    name: 'registration',
    component: Registration,
  },
  {
    path: '/info_prod',
    name: 'productInfo',
    component: ProductInfo,
  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
  },
  {
    path: '/meals',
    name: 'meals',
    component: Meals,
  },
  {
    path: '/calculate_meal_composition',
    name: 'calculate_meal_composition',
    component: CalculateMeal,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
