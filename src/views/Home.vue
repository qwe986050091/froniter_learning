<template>
  <div class="home-container">
    <header class="home-header">
      <div class="header-left">
        <el-button text class="collapse-btn" @click="isCollapse = !isCollapse">
          <el-icon :size="22">
            <Expand v-if="isCollapse" />
            <Fold v-else />
          </el-icon>
        </el-button>
        <div class="user-info">
          <h2>欢迎, {{ authStore.userInfo?.nickname || authStore.userInfo?.username || 'User' }}</h2>
          <p class="user-id">ID: {{ authStore.userInfo?.userId }}</p>
        </div>
      </div>
      <el-button type="danger" @click="handleLogout">退出登录</el-button>
    </header>

    <div class="home-body">
      <!-- 左侧导航栏（后端下发） -->
      <aside class="home-sidebar" :class="{ collapsed: isCollapse }">
        <el-menu
          router
          :default-active="activeMenu"
          class="sidebar-menu"
          :default-openeds="defaultOpeneds"
          :collapse="isCollapse"
          :collapse-transition="false"
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
import { Expand, Fold } from '@element-plus/icons-vue'
import SidebarMenuItem from '@/components/SidebarMenuItem.vue'
import { useAuthStore } from '@/stores/auth'
import { logout as authLogout } from '@/services/authService'
import { frontierService } from '@/api'
import type { MenuItem } from '@/types'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 侧边栏是否收起
const isCollapse = ref(false)

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
    // 退出后带当前路径，登录后可跳回
    router.push({ path: '/login', query: { redirect: route.fullPath } })
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

<style lang="scss" scoped>
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

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  padding: 6px;
  color: #606266;
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
  overflow: hidden;
  transition: width 0.25s ease;
}

.home-sidebar.collapsed {
  width: 64px;
}

.sidebar-menu {
  border-right: none;
}

/* 折叠态下让菜单宽度跟随侧边栏一起过渡，避免文字跳变/空白 */
.sidebar-menu.el-menu--collapse {
  width: 100% !important;
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
