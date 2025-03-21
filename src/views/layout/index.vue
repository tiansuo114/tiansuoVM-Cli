<template>
  <div class="app-wrapper">
    <!-- 侧边栏 -->
    <div
      class="sidebar-container"
      :class="{ 'is-collapse': isCollapse }"
    >
      <div class="logo-container">
        <router-link to="/">
          <span class="logo-text" v-if="!isCollapse"
            >虚拟机管理系统</span
          >
          <span class="logo-text-mini" v-else>VM</span>
        </router-link>
      </div>
      <el-scrollbar>
        <el-menu
          :default-active="activeMenu"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          :collapse="isCollapse"
          :collapse-transition="false"
          :unique-opened="true"
          router
        >
          <!-- 仪表盘 -->
          <el-menu-item index="/dashboard">
            <el-icon><Odometer /></el-icon>
            <template #title>仪表盘</template>
          </el-menu-item>

          <!-- 虚拟机管理 -->
          <el-sub-menu index="/vm">
            <template #title>
              <el-icon><Monitor /></el-icon>
              <span>虚拟机管理</span>
            </template>
            <el-menu-item index="/vm/list">
              <el-icon><List /></el-icon>
              <template #title>虚拟机列表</template>
            </el-menu-item>
            <el-menu-item index="/vm/create">
              <el-icon><Plus /></el-icon>
              <template #title>创建虚拟机</template>
            </el-menu-item>
          </el-sub-menu>

          <!-- 镜像管理 -->
          <el-sub-menu index="/image">
            <template #title>
              <el-icon><PictureFilled /></el-icon>
              <span>镜像管理</span>
            </template>
            <el-menu-item index="/image/list">
              <el-icon><List /></el-icon>
              <template #title>镜像列表</template>
            </el-menu-item>
          </el-sub-menu>

          <!-- 系统管理 (仅管理员可见) -->
          <el-sub-menu
            index="/admin"
            v-if="userRole === 'admin'"
          >
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/admin/user">
              <el-icon><User /></el-icon>
              <template #title>用户管理</template>
            </el-menu-item>
            <el-menu-item index="/admin/log">
              <el-icon><Tickets /></el-icon>
              <template #title>日志管理</template>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-container">
      <!-- 顶部导航栏 -->
      <div class="navbar">
        <div class="left-area">
          <el-icon class="fold-btn" @click="toggleSidebar">
            <component :is="isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>
          <breadcrumb />
        </div>
        <div class="right-area">
          <el-dropdown trigger="click">
            <div class="avatar-container">
              <el-avatar :size="30" :src="avatarUrl">{{
                userInfo?.username?.charAt(0)?.toUpperCase()
              }}</el-avatar>
              <span class="username">{{
                userInfo?.username || '用户'
              }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="toUserProfile">
                  <el-icon><User /></el-icon>个人中心
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 页面内容 -->
      <div class="app-main">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCurrentUser, logout } from '@/api/user'
import Breadcrumb from './components/Breadcrumb.vue'

// 路由实例
const router = useRouter()

// 用户信息
const userInfo = ref(null)
const userRole = computed(() => userInfo.value?.role || 'normal')
const avatarUrl = computed(() => userInfo.value?.avatar || '')

// 侧边栏折叠状态
const isCollapse = ref(false)
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 当前激活的菜单
const activeMenu = computed(() => {
  const { path } = router.currentRoute.value
  return path
})

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    userInfo.value = await getCurrentUser()
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 前往个人中心
const toUserProfile = () => {
  router.push('/profile')
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        await logout()
        localStorage.removeItem('token')
        ElMessage.success('退出登录成功')
        router.push('/login')
      } catch (error) {
        console.error('退出登录失败:', error)
      }
    })
    .catch(() => {})
}

// 挂载时获取用户信息
onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.app-wrapper {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.sidebar-container {
  width: 210px;
  height: 100%;
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
}

.sidebar-container.is-collapse {
  width: 64px;
}

.logo-container {
  height: 60px;
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #304156;
}

.logo-text,
.logo-text-mini {
  color: #fff;
  font-size: 18px;
  font-weight: bold;
}

.logo-text-mini {
  font-size: 22px;
}

.logo-container img {
  max-height: 40px;
  max-width: 100%;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f0f2f5;
}

.navbar {
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.left-area,
.right-area {
  display: flex;
  align-items: center;
}

.fold-btn {
  font-size: 20px;
  cursor: pointer;
  margin-right: 20px;
}

.avatar-container {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin: 0 8px;
  color: #606266;
}

.app-main {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  height: 56px;
  line-height: 56px;
}

:deep(.el-sub-menu .el-menu-item) {
  height: 50px;
  line-height: 50px;
}
</style>
