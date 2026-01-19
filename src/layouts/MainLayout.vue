<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
      <div class="logo">
        <h2 v-if="!isCollapse">后台管理</h2>
        <h2 v-else>后台</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        router
        class="sidebar-menu"
      >
        <el-tooltip
          v-if="isCollapse"
          content="产品管理"
          placement="right"
          effect="dark"
        >
          <el-menu-item index="/product">
            <el-icon><Box /></el-icon>
            <span>产品管理</span>
          </el-menu-item>
        </el-tooltip>
        <el-menu-item v-else index="/product">
          <el-icon><Box /></el-icon>
          <span>产品管理</span>
        </el-menu-item>
        
        <el-tooltip
          v-if="isCollapse"
          content="账户管理"
          placement="right"
          effect="dark"
        >
          <el-menu-item index="/user">
            <el-icon><UserFilled /></el-icon>
            <span>账户管理</span>
          </el-menu-item>
        </el-tooltip>
        <el-menu-item v-else index="/user">
          <el-icon><UserFilled /></el-icon>
          <span>账户管理</span>
        </el-menu-item>
        
        <el-tooltip
          v-if="isCollapse && isAdminOrSuperAdmin"
          content="产品类型管理"
          placement="right"
          effect="dark"
        >
          <el-menu-item index="/product-type">
            <el-icon><Setting /></el-icon>
            <span>产品类型管理</span>
          </el-menu-item>
        </el-tooltip>
        <el-menu-item
          v-else-if="isAdminOrSuperAdmin"
          index="/product-type"
        >
          <el-icon><Setting /></el-icon>
          <span>产品类型管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-button
            :icon="isCollapse ? Expand : Fold"
            circle
            @click="toggleCollapse"
            class="collapse-btn"
          />
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon><User /></el-icon>
              <span>{{ authStore.username || '用户' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Box, User, ArrowDown, UserFilled, Setting, Fold, Expand } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 菜单折叠状态
const isCollapse = ref(false)

// 切换折叠状态
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const activeMenu = computed(() => route.path)

// 检查是否是管理员或超级管理员
const isAdminOrSuperAdmin = computed(() => {
  const role = authStore.user?.role
  return role === 'admin' || role === 'super_admin'
})

const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      authStore.logout()
      router.push('/login')
    } catch {
      // 用户取消
    }
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  color: white;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo h2 {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.sidebar-menu {
  border: none;
  background-color: #304156;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 200px;
}

.sidebar-menu :deep(.el-menu-item) {
  color: rgba(255, 255, 255, 0.7);
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.1);
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: #409eff;
  color: white;
}

.sidebar-menu :deep(.el-menu-item span) {
  margin-left: 8px;
}

/* 确保 tooltip 在折叠状态下正确显示 */
.sidebar-menu :deep(.el-tooltip__trigger) {
  width: 100%;
  display: block;
}

.sidebar-menu :deep(.el-tooltip) {
  width: 100%;
}

.header {
  background-color: white;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  border: none;
  background-color: transparent;
  color: #606266;
}

.collapse-btn:hover {
  color: #409eff;
  background-color: #f5f7fa;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #606266;
}

.user-info:hover {
  color: #409eff;
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>

