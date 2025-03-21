<template>
  <div class="not-found">
    <h1>404</h1>
    <h2>页面未找到</h2>
    <p>抱歉，您访问的页面不存在</p>
    <router-link to="/">返回首页</router-link>
  </div>
</template>

<script setup>
// 404页面逻辑
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
}

h1 {
  font-size: 6rem;
  margin-bottom: 1rem;
}

h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

p {
  margin-bottom: 2rem;
}

a {
  color: #409eff;
  text-decoration: none;
}
</style>
