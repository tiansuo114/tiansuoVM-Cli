<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item
      v-for="(item, index) in breadcrumbs"
      :key="index"
      :to="item.path"
    >
      {{ item.meta.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

// 路由实例
const route = useRoute()

// 面包屑数据
const breadcrumbs = ref([])

// 获取面包屑数据
const getBreadcrumbs = () => {
  // 当前路由的路径匹配记录
  const matched = route.matched.filter(
    (item) => item.meta && item.meta.title
  )

  // 过滤掉没有标题的路由
  breadcrumbs.value = matched.filter((item) => {
    // 是否设置了隐藏
    if (item.meta.hidden) {
      return false
    }
    return true
  })
}

// 监听路由变化
watch(
  () => route.path,
  () => {
    getBreadcrumbs()
  },
  { immediate: true }
)
</script>

<style scoped>
:deep(.el-breadcrumb__inner) {
  color: #606266;
}

:deep(.el-breadcrumb__inner.is-link) {
  color: #97a8be;
  cursor: pointer;
}

:deep(.el-breadcrumb__inner.is-link:hover) {
  color: #409eff;
}
</style>
