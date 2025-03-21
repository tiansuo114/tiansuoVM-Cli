import { createRouter, createWebHistory } from 'vue-router'

// 布局
const Layout = () => import('../views/layout/index.vue')

// 路由
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/login/index.vue'),
      meta: { title: '登录', hidden: true }
    },
    {
      path: '/',
      component: Layout,
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () =>
            import('../views/dashboard/index.vue'),
          meta: {
            title: '仪表盘',
            icon: 'dashboard',
            affix: true
          }
        },
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('../views/user/profile.vue'),
          meta: { title: '个人中心', icon: 'User' }
        },
        {
          path: 'vm',
          name: 'VM',
          meta: { title: '虚拟机管理', icon: 'Monitor' },
          children: [
            {
              path: 'list',
              name: 'VMList',
              component: () => import('../views/vm/list.vue'),
              meta: { title: '虚拟机列表' }
            },
            {
              path: 'create',
              name: 'VMCreate',
              component: () => import('../views/vm/create.vue'),
              meta: { title: '创建虚拟机' }
            },
            {
              path: 'detail/:id',
              name: 'VMDetail',
              component: () => import('../views/vm/detail.vue'),
              meta: { title: '虚拟机详情', activeMenu: '/vm/list' }
            },
            {
              path: 'terminal',
              component: () => import('@/views/vm/terminal.vue'),
              name: 'VMTerminal',
              meta: { title: '终端连接' }
            }
          ]
        },
        {
          path: 'image',
          name: 'Image',
          meta: { title: '镜像管理', icon: 'Picture' },
          children: [
            {
              path: 'list',
              name: 'ImageList',
              component: () => import('../views/image/list.vue'),
              meta: { title: '镜像列表' }
            },
            {
              path: 'detail/:id',
              name: 'ImageDetail',
              component: () => import('../views/image/detail.vue'),
              meta: { title: '镜像详情', activeMenu: '/image/list' }
            }
          ]
        },
        {
          path: 'admin',
          name: 'Admin',
          meta: { title: '系统管理', icon: 'Setting', roles: ['admin'] },
          children: [
            {
              path: 'user',
              name: 'UserManage',
              component: () => import('../views/admin/user.vue'),
              meta: { title: '用户管理' }
            },
            {
              path: 'log',
              name: 'LogManage',
              component: () => import('../views/admin/log.vue'),
              meta: { title: '日志管理' }
            }
          ]
        }
      ]
    },
    // 404页面
    {
      path: '/:pathMatch(.*)*',
      component: () => import('../views/error/404.vue'),
      meta: { hidden: true }
    }
  ]
})

// 路由拦截器
router.beforeEach((to, from, next) => {
  // 获取token
  const token = localStorage.getItem('token')

  // 设置页面标题
  document.title = to.meta.title
    ? `${to.meta.title} - 虚拟机管理系统`
    : '虚拟机管理系统'

  // 无需登录的页面
  if (to.path === '/login') {
    if (token) {
      next({ path: '/' })
    } else {
      next()
    }
    return
  }

  // 需要登录的页面
  if (!token) {
    next({ path: '/login' })
    return
  }

  // TODO: 权限控制

  next()
})

export default router
