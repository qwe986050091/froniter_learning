<template>
  <div class="login-container">
    <div class="login-form-wrapper">
      <div class="login-card">
        <h1 class="login-title">Hello</h1>
        <p class="login-subtitle">欢迎来到硅谷甄选</p>

        <el-form :model="form" class="login-form" @keyup.enter="handleLogin">
          <el-form-item>
            <el-input
              v-model="form.username"
              placeholder="用户名"
              size="large"
              :prefix-icon="User"
              clearable
              :disabled="loading"
            />
          </el-form-item>

          <el-form-item>
            <el-input
              v-model="form.password"
              type="password"
              placeholder="密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              :disabled="loading"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-button"
              :loading="loading"
              @click="handleLogin"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { frontierService } from '@/api'
import type { LoginRequest } from '@/types'

const router = useRouter()
const loading = ref(false)
const form = reactive<LoginRequest>({
  username: '',
  password: '',
})

const handleLogin = async () => {
  if (!form.username) {
    ElMessage.warning('请输入用户名')
    return
  }
  if (!form.password) {
    ElMessage.warning('请输入密码')
    return
  }

  loading.value = true
  try {
    const res = await frontierService.login({
      username: form.username,
      password: form.password,
    })

    if (res.code === '200' || res.code === '0') {
      if (res.token) {
        localStorage.setItem('token', res.token)
      }
      if (res.refreshToken) {
        localStorage.setItem('refreshToken', res.refreshToken)
      }
      if (res.userInfo) {
        localStorage.setItem('userInfo', JSON.stringify(res.userInfo))
      }
      ElMessage.success(res.message || '登录成功')
      router.push('/home')
    } else {
      ElMessage.error(res.message || '登录失败')
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '登录失败，请重试'
    ElMessage.error(message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  width: 100%;
  height: 100vh;
  background:
    linear-gradient(135deg, rgba(79, 172, 254, 0.25) 0%, rgba(0, 212, 255, 0.15) 100%),
    url('@/assets/login.png') center/cover no-repeat;
}

.login-form-wrapper {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 100%;
  padding-right: 6%;
}

.login-card {
  width: 420px;
  padding: 48px 40px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.login-title {
  margin: 0 0 8px 0;
  font-size: 36px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 1px;
}

.login-subtitle {
  margin: 0 0 32px 0;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.8);
}

.login-form {
  width: 100%;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.login-form :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: none;
  padding: 4px 12px;
}

.login-form :deep(.el-input__wrapper:hover),
.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px rgba(79, 172, 254, 0.6) inset;
}

.login-form :deep(.el-input__inner) {
  height: 44px;
  font-size: 15px;
  color: #333;
}

.login-form :deep(.el-input__prefix-inner) {
  color: #909399;
  font-size: 18px;
}

.login-button {
  width: 100%;
  height: 46px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 4px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #4facfe 0%, #00c6fb 100%);
  transition: all 0.3s ease;
}

.login-button:hover {
  background: linear-gradient(135deg, #3a8fd9 0%, #00a8d9 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
}

.login-button:active {
  transform: translateY(0);
}
</style>