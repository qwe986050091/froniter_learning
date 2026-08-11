<template>
  <div class="login-container">
    <div class="login-form-wrapper">
      <div class="login-card">
        <h1 class="login-title">Hello</h1>
        <p class="login-subtitle">欢迎来到硅谷甄选</p>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          class="login-form"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="用户名"
              size="large"
              :prefix-icon="User"
              clearable
              :disabled="loading"
            />
          </el-form-item>

          <el-form-item prop="password">
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
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { login as authLogin, logout as authLogout } from '@/services/authService'
import type { LoginRequest } from '@/types'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive<LoginRequest>({
  username: '',
  password: '',
})

const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为 3-20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 30, message: '密码长度为 6-30 个字符', trigger: 'blur' },
  ],
})

const handleLogin = async () => {
  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const res = await authLogin({
      username: form.username,
      password: form.password,
    })

    if (res.code === '200' || res.code === '0') {
      const now = new Date()
      const timeStr = now.toLocaleString('zh-CN')
      ElMessageBox.alert(
        `当前时间：${timeStr}`,
        'hi！',
        {
          confirmButtonText: '进入系统',
          callback: () => {
            router.push('/home')
          }
        }
      )
    } else {
      await authLogout()
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

<style lang="scss" scoped>
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

.login-form :deep(.el-form-item__error) {
  position: static;
  padding-top: 4px;
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
