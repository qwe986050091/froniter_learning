<template>
  <div>
    <h2>首页</h2>
    <p>欢迎来到首页！</p>

    <h3>路由跳转测试：</h3>
    <button @click="goLogin">跳转到登录页</button>
    <button @click="go404">跳转到不存在的页面（测试404）</button>

    <br /><br />
    <h3>router-link 写法（声明式导航）：</h3>
    <p>
      <router-link to="/login">去登录</router-link>
      &nbsp;|&nbsp;
      <router-link to="/home">回首页</router-link>
      &nbsp;|&nbsp;
      <router-link to="/abc/xyz">访问不存在的路径</router-link>
    </p>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goLogin = () => {
  router.push('/login')
}

const go404 = () => {
  router.push('/some-not-exist-page')
}
</script>