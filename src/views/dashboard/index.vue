<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <!-- 虚拟机概览卡片 -->
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>虚拟机概览</span>
              <el-button text @click="router.push('/vm/list')"
                >查看详情</el-button
              >
            </div>
          </template>
          <div class="card-body">
            <el-row>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-value">
                    {{ stats.vmTotal }}
                  </div>
                  <div class="stat-label">总数</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-value success">
                    {{ stats.vmRunning }}
                  </div>
                  <div class="stat-label">运行中</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-value warning">
                    {{ stats.vmStopped }}
                  </div>
                  <div class="stat-label">已停止</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>

      <!-- 系统资源卡片 -->
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>资源使用</span>
            </div>
          </template>
          <div class="card-body">
            <div class="resource-item">
              <div class="resource-label">CPU</div>
              <el-progress
                :percentage="stats.cpuUsage"
                :color="getProgressColor(stats.cpuUsage)"
              />
            </div>
            <div class="resource-item">
              <div class="resource-label">内存</div>
              <el-progress
                :percentage="stats.memoryUsage"
                :color="getProgressColor(stats.memoryUsage)"
              />
            </div>
            <div class="resource-item">
              <div class="resource-label">磁盘</div>
              <el-progress
                :percentage="stats.diskUsage"
                :color="getProgressColor(stats.diskUsage)"
              />
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 快速操作卡片 -->
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>快速操作</span>
            </div>
          </template>
          <div class="action-list">
            <el-button
              type="primary"
              @click="router.push('/vm/create')"
            >
              <el-icon><Plus /></el-icon>创建虚拟机
            </el-button>
            <el-button @click="router.push('/image/list')">
              <el-icon><PictureFilled /></el-icon>查看镜像
            </el-button>
            <el-button
              v-if="isAdmin"
              @click="router.push('/admin/user')"
            >
              <el-icon><User /></el-icon>用户管理
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近虚拟机列表 -->
    <el-card shadow="hover" class="recent-vm-card">
      <template #header>
        <div class="card-header">
          <span>最近创建的虚拟机</span>
          <el-button text @click="router.push('/vm/list')"
            >查看全部</el-button
          >
        </div>
      </template>
      <el-table
        v-loading="loading"
        :data="recentVMs"
        style="width: 100%"
      >
        <el-table-column
          prop="name"
          label="虚拟机名称"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="cpu"
          label="CPU"
          width="80"
          align="center"
        />
        <el-table-column
          prop="memory_mb"
          label="内存(MB)"
          width="110"
          align="center"
        />
        <el-table-column
          prop="disk_gb"
          label="磁盘(GB)"
          width="110"
          align="center"
        />
        <el-table-column
          prop="ip"
          label="IP地址"
          width="140"
          align="center"
        />
        <el-table-column
          prop="status"
          label="状态"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{
              getStatusLabel(row.status)
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="created_at"
          label="创建时间"
          width="180"
          align="center"
        >
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="router.push(`/vm/detail/${row.id}`)"
              >详情</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getCurrentUser } from '@/api/user'
import { getVMList } from '@/api/vm'
import { VMStatus } from '@/api/types/vm'
import {
  PictureFilled,
  Plus,
  User
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

// 获取路由实例
const router = useRouter()

// 加载状态
const loading = ref(false)

// 用户角色
const userRole = ref('normal')
const isAdmin = computed(() => userRole.value === 'admin')

// 最近创建的虚拟机
const recentVMs = ref([])

// 统计数据
const stats = ref({
  vmTotal: 0,
  vmRunning: 0,
  vmStopped: 0,
  cpuUsage: 45, // 模拟数据
  memoryUsage: 62, // 模拟数据
  diskUsage: 38 // 模拟数据
})

// 获取状态标签
const getStatusLabel = (status) => {
  const statusMap = {
    [VMStatus.CREATING]: '创建中',
    [VMStatus.RUNNING]: '运行中',
    [VMStatus.STOPPED]: '已停止',
    [VMStatus.STARTING]: '启动中',
    [VMStatus.STOPPING]: '停止中',
    [VMStatus.FAILED]: '失败',
    [VMStatus.DELETED]: '已删除'
  }
  return statusMap[status] || status
}

// 获取状态对应的类型
const getStatusType = (status) => {
  const statusTypeMap = {
    [VMStatus.CREATING]: 'info',
    [VMStatus.RUNNING]: 'success',
    [VMStatus.STOPPED]: 'warning',
    [VMStatus.STARTING]: 'info',
    [VMStatus.STOPPING]: 'info',
    [VMStatus.FAILED]: 'danger',
    [VMStatus.DELETED]: 'danger'
  }
  return statusTypeMap[status] || ''
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleString()
}

// 获取进度条颜色
const getProgressColor = (percentage) => {
  if (percentage < 70) return '#67C23A'
  if (percentage < 90) return '#E6A23C'
  return '#F56C6C'
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const data = await getCurrentUser()
    userRole.value = data.role || 'normal'
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 获取最近的虚拟机
const fetchRecentVMs = async () => {
  try {
    loading.value = true

    const params = {
      page: 1,
      limit: 5
    }
    const res = await getVMList(params)
    // 这里出现了一些字段错误,res中含有信息的字段是items,请你修改相关信息

    recentVMs.value = res.items || []
    // 统计数据
    if (res.items && res.items.length > 0) {
      stats.value.vmTotal = res.total || 0
      stats.value.vmRunning = res.items.filter(
        (vm) => vm.status === VMStatus.RUNNING
      ).length
      stats.value.vmStopped = res.items.filter(
        (vm) => vm.status === VMStatus.STOPPED
      ).length
    }
  } catch (error) {
    console.error('获取虚拟机列表失败:', error)
    ElMessage.error('获取虚拟机列表失败')
  } finally {
    loading.value = false
  }
}

const getResourceUsage = async () => {
  stats.value.cpuUsage = Math.floor(Math.random() * 40) + 30
  stats.value.memoryUsage = Math.floor(Math.random() * 40) + 30
  stats.value.diskUsage = Math.floor(Math.random() * 40) + 30
}

// 挂载时获取数据
onMounted(() => {
  fetchUserInfo()
  fetchRecentVMs()
  getResourceUsage()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-card {
  margin-bottom: 20px;
  height: 100%;
}

.card-body {
  padding: 10px 0;
}

.stat-item {
  text-align: center;
  padding: 10px 0;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
}

.stat-value.success {
  color: #67c23a;
}

.stat-value.warning {
  color: #e6a23c;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.resource-item {
  margin-bottom: 15px;
}

.resource-label {
  margin-bottom: 5px;
  font-size: 14px;
  color: #606266;
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.recent-vm-card {
  margin-top: 20px;
}
</style>
