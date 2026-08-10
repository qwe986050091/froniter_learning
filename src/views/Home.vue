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
          default-active="home"
          class="sidebar-menu"
          :default-openeds="defaultOpeneds"
          @select="handleMenuSelect"
        >
          <SidebarMenuItem
            v-for="item in menuItems"
            :key="item.id"
            :item="item"
          />
        </el-menu>
      </aside>

      <!-- 右侧主内容区 -->
      <main class="home-main">
        <section class="content-card">
          <h3>{{ currentTitle }}</h3>
          <p class="content-desc">{{ currentDesc }}</p>
        </section>

        <section class="dashboard">
          <div class="card">
            <h3>路由跳转测试</h3>
            <button @click="go404">跳转到不存在的页面（测试404）</button>
          </div>

          <div class="card">
            <h3>router-link 写法（声明式导航）</h3>
            <p>
              <router-link to="/home">回首页</router-link>
              &nbsp;|&nbsp;
              <router-link to="/abc/xyz">访问不存在的路径</router-link>
            </p>
          </div>

          <div class="card">
            <h3>用户信息</h3>
            <p><strong>昵称：</strong>{{ authStore.userInfo?.nickname }}</p>
            <p><strong>头像：</strong>{{ authStore.userInfo?.avatar }}</p>
            <p><strong>角色：</strong>{{ authStore.userInfo?.roles?.join(', ') }}</p>
            <p><strong>Token：</strong>{{ authStore.token?.substring(0, 20) }}...</p>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import SidebarMenuItem from '@/components/SidebarMenuItem.vue'
import { useAuthStore } from '@/stores/auth'
import { logout as authLogout } from '@/services/authService'
import { frontierService } from '@/api'
import type { MenuItem } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

const menuItems = ref<MenuItem[]>([])
const defaultOpeneds = ref<string[]>([])

const currentTitle = ref('首页')
const currentDesc = ref('这里是系统首页总览。')

// 在菜单树中按 id 递归查找节点
const findMenuItem = (list: MenuItem[], id: string): MenuItem | undefined => {
  for (const m of list) {
    if (m.id === id) return m
    if (m.children) {
      const found = findMenuItem(m.children, id)
      if (found) return found
    }
  }
  return undefined
}

const handleMenuSelect = (index: string) => {
  const item = findMenuItem(menuItems.value, index)
  if (item) {
    currentTitle.value = item.name
    currentDesc.value = item.desc || `这里是${item.name}页面。`
  }
}

const go404 = () => {
  router.push('/some-not-exist-page')
}

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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

.content-card {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.content-card h3 {
  margin: 0 0 8px;
  color: #303133;
}

.content-desc {
  margin: 0;
  color: #909399;
}

.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.card {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.card h3 {
  margin: 0 0 16px;
  color: #303133;
}

.card p {
  color: #606266;
  margin: 8px 0;
}

.card button {
  padding: 8px 16px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.card button:hover {
  background: #66b1ff;
}
</style>
