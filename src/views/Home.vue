<template>
  <div class="home-container">
    <header class="home-header">
      <div class="user-info">
        <h2>欢迎, {{ authStore.userInfo?.nickname || authStore.userInfo?.username || 'User' }}</h2>
        <p class="user-id">ID: {{ authStore.userInfo?.userId }}</p>
      </div>
      <el-button type="danger" @click="handleLogout">退出登录</el-button>
    </header>

    <main class="home-main">
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
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { logout as authLogout } from '@/services/authService'

const router = useRouter()
const authStore = useAuthStore()

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
  padding: 20px 40px;
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

.home-main {
  padding: 40px;
}

.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
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
