<template>
  <div>
    <h2>404 - 页面找不到了</h2>
    <p>你访问的路径不存在。</p>
    <button @click="goHome">回首页</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/home')
}
</script>