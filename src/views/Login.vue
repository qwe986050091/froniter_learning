<template>
  <div>
    <h2>登录页</h2>
    <input v-model="username" placeholder="用户名" />
    <br /><br />
    <input v-model="password" type="password" placeholder="密码" />
    <br /><br />
    <button @click="handleLogin">登录</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')

const handleLogin = () => {
  router.push('/home')
}
</script>