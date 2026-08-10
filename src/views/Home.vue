<template>
  <div class="home-container">
    <header class="home-header">
      <div class="user-info">
        <h2>欢迎, {{ authStore.userInfo?.nickname || authStore.userInfo?.username || 'User' }}</h2>
        <p class="user-id">ID: {{ authStore.userInfo?.userId }}</p>
      </div>
      <el-button type="danger" @click="handleLogout">退出登录</el-button>
    </header>

    <div class="home-body">
      <!-- 左侧导航栏（后端下发） -->
      <aside class="home-sidebar">
        <el-menu
          router
          :default-active="activeMenu"
          class="sidebar-menu"
          :default-openeds="defaultOpeneds"
        >
          <SidebarMenuItem
            v-for="item in menuItems"
            :key="item.id"
            :item="item"
          />
        </el-menu>
      </aside>

      <!-- 右侧主内容区：渲染当前路由对应的子页面组件 -->
      <main class="home-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import SidebarMenuItem from '@/components/SidebarMenuItem.vue'
import { useAuthStore } from '@/stores/auth'
import { logout as authLogout } from '@/services/authService'
import { frontierService } from '@/api'
import type { MenuItem } from '@/types'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const menuItems = ref<MenuItem[]>([])
const defaultOpeneds = ref<string[]>([])

// 根据当前路由路径高亮侧边栏菜单项
const activeMenu = ref(route.path)

// 路由变化时同步高亮
watch(
  () => route.path,
  (path) => {
    activeMenu.value = path
  }
)

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await authLogout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch {
    // user cancelled
  }
}

onMounted(async () => {
  try {
    menuItems.value = await frontierService.getMenu()
    // 收集所有带子菜单的节点 id 用于默认展开
    const opened: string[] = []
    const collect = (list: MenuItem[]) => {
      list.forEach((m) => {
        if (m.children && m.children.length) {
          opened.push(m.id)
          collect(m.children)
        }
      })
    }
    collect(menuItems.value)
    defaultOpeneds.value = opened
  } catch (err) {
    const message = err instanceof Error ? err.message : '获取菜单失败'
    ElMessage.error(message)
  }
})
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 40px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.user-info h2 {
  margin: 0;
  color: #303133;
}

.user-id {
  margin: 4px 0 0;
  color: #909399;
  font-size: 14px;
}

.home-body {
  display: flex;
  min-height: calc(100vh - 76px);
}

/* 左侧导航栏 */
.home-sidebar {
  width: 220px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #e4e7ed;
}

.sidebar-menu {
  border-right: none;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: #ecf5ff;
  color: #409eff;
}

/* 右侧主内容区 */
.home-main {
  flex: 1;
  padding: 24px;
  overflow: auto;
}
</style>
