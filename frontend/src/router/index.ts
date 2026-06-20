import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
  },
  {
    path: '/battery',
    name: 'Battery',
    component: () => import('@/views/BatteryList.vue'),
  },
  {
    path: '/battery/register',
    name: 'BatteryRegister',
    component: () => import('@/views/BatteryRegister.vue'),
  },
  {
    path: '/inspection',
    name: 'Inspection',
    component: () => import('@/views/InspectionList.vue'),
  },
  {
    path: '/inspection/create',
    name: 'InspectionCreate',
    component: () => import('@/views/InspectionCreate.vue'),
  },
  {
    path: '/sales',
    name: 'Sales',
    component: () => import('@/views/SalesList.vue'),
  },
  {
    path: '/sales/create',
    name: 'SalesCreate',
    component: () => import('@/views/SalesCreate.vue'),
  },
  {
    path: '/flow',
    name: 'Flow',
    component: () => import('@/views/FlowTrace.vue'),
  },
  {
    path: '/audit',
    name: 'Audit',
    component: () => import('@/views/AuditQuery.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
