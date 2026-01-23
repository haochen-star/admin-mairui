import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/product',
    meta: { requiresAuth: true },
    children: [
      {
        path: '/product',
        name: 'Product',
        component: () => import('@/views/Product/ProductList.vue'),
        meta: { title: '产品管理', requiresAuth: true }
      },
      {
        path: '/user',
        name: 'User',
        component: () => import('@/views/User/UserList.vue'),
        meta: { title: '账户管理', requiresAuth: true }
      },
      {
        path: '/product-type',
        name: 'ProductType',
        component: () => import('@/views/ProductType/ProductTypeList.vue'),
        meta: { title: '产品类型管理', requiresAuth: true, roles: ['super_admin', 'admin'] }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory('/admin'),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isLoggedIn = authStore.isLoggedIn

  if (to.meta.requiresAuth === false) {
    // 登录页，如果已登录则跳转到首页
    if (isLoggedIn) {
      next('/')
    } else {
      next()
    }
  } else {
    // 需要登录的页面
    if (isLoggedIn) {
      // 检查角色权限
      if (to.meta.roles && Array.isArray(to.meta.roles)) {
        const userRole = authStore.user?.role
        if (!userRole || !to.meta.roles.includes(userRole)) {
          ElMessage.error('权限不足，无法访问该页面')
          next('/')
          return
        }
      }
      next()
    } else {
      next('/login')
    }
  }
})

export default router

