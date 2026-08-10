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
      <!-- 左侧导航栏 -->
      <aside class="home-sidebar">
        <el-menu
          default-active="home"
          class="sidebar-menu"
          :default-openeds="['group1', 'group2']"
          @select="handleMenuSelect"
        >
          <el-menu-item index="home">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </el-menu-item>

          <el-sub-menu index="group1">
            <template #title>
              <el-icon><DataBoard /></el-icon>
              <span>数据管理</span>
            </template>
            <el-menu-item index="dashboard">
              <el-icon><Odometer /></el-icon>
              <span>数据看板</span>
            </el-menu-item>
            <el-menu-item index="statistics">
              <el-icon><TrendCharts /></el-icon>
              <span>统计分析</span>
            </el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="group2">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统设置</span>
            </template>
            <el-menu-item index="user-manage">
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </el-menu-item>
            <el-menu-item index="role-manage">
              <el-icon><Avatar /></el-icon>
              <span>角色管理</span>
            </el-menu-item>
            <el-sub-menu index="group2-1">
              <template #title>
                <el-icon><Tools /></el-icon>
                <span>更多设置</span>
              </template>
              <el-menu-item index="system-config">
                <el-icon><Monitor /></el-icon>
                <span>系统配置</span>
              </el-menu-item>
            </el-sub-menu>
          </el-sub-menu>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  HomeFilled,
  DataBoard,
  Odometer,
  TrendCharts,
  Setting,
  User,
  Avatar,
  Tools,
  Monitor,
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { logout as authLogout } from '@/services/authService'

const router = useRouter()
const authStore = useAuthStore()

const menuContent: Record<string, { title: string; desc: string }> = {
  home: { title: '首页', desc: '这里是系统首页总览。' },
  dashboard: { title: '数据看板', desc: '这里是数据看板页面。' },
  statistics: { title: '统计分析', desc: '这里是统计分析页面。' },
  'user-manage': { title: '用户管理', desc: '这里是用户管理页面。' },
  'role-manage': { title: '角色管理', desc: '这里是角色管理页面。' },
  'system-config': { title: '系统配置', desc: '这里是系统配置页面。' },
}

const currentTitle = ref('首页')
const currentDesc = ref('这里是系统首页总览。')

const handleMenuSelect = (index: string) => {
  const content = menuContent[index]
  if (content) {
    currentTitle.value = content.title
    currentDesc.value = content.desc
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
