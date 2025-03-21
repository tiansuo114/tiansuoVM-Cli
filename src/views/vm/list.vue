<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>虚拟机列表</span>
          <el-button
            type="primary"
            @click="$router.push('/vm/create')"
          >
            <el-icon><Plus /></el-icon>创建虚拟机
          </el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-container">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="虚拟机名称">
            <el-input
              v-model="searchForm.name"
              placeholder="搜索虚拟机名称"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="searchForm.status"
              placeholder="选择状态"
              clearable
            >
              <el-option
                v-for="(value, key) in VMStatus"
                :key="key"
                :label="getStatusLabel(value)"
                :value="value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch"
              >搜索</el-button
            >
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格区域 -->
      <el-table
        v-loading="loading"
        :data="vmList"
        stripe
        border
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
          prop="node_ip"
          label="IP地址"
          width="140"
          align="center"
        />
        <el-table-column
          prop="status"
          label="状态"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{
              getStatusLabel(row.status)
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="image_name"
          label="镜像"
          min-width="120"
          show-overflow-tooltip
        />
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
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === VMStatus.STOPPED"
              type="success"
              size="small"
              @click="handleStartVM(row)"
              :loading="actionLoading"
            >
              启动
            </el-button>
            <el-button
              v-if="row.status === VMStatus.RUNNING"
              type="warning"
              size="small"
              @click="handleStopVM(row)"
              :loading="actionLoading"
            >
              停止
            </el-button>
            <el-button
              v-if="row.status === VMStatus.RUNNING"
              type="info"
              size="small"
              @click="handleRestartVM(row)"
              :loading="actionLoading"
            >
              重启
            </el-button>
            <el-button
              type="primary"
              size="small"
              @click="$router.push(`/vm/detail/${row.id}`)"
            >
              详情
            </el-button>
            <el-button
              v-if="row.status !== VMStatus.DELETED"
              type="danger"
              size="small"
              @click="handleDeleteVM(row)"
              :loading="actionLoading"
            >
              删除
            </el-button>
            <el-button
              v-if="row.status === VMStatus.DELETED"
              type="success"
              size="small"
              @click="handleRecoverVM(row)"
              :loading="actionLoading"
            >
              恢复
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getVMList,
  startVM,
  stopVM,
  restartVM,
  deleteVM,
  recoverVM
} from '@/api/vm'
import { VMStatus } from '@/api/types/vm'

// 加载状态
const loading = ref(false)
const actionLoading = ref(false)

// 虚拟机列表
const vmList = ref([])

// 搜索表单
const searchForm = reactive({
  name: '',
  status: ''
})

// 分页参数
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
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

// 获取虚拟机列表
const fetchVMList = async () => {
  try {
    loading.value = true

    // 构建查询参数
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...searchForm
    }

    // 移除空值
    Object.keys(params).forEach((key) => {
      if (params[key] === '') {
        delete params[key]
      }
    })

    const res = await getVMList(params)

    vmList.value = res.items || []
    pagination.total = res.total || 0
  } catch (error) {
    console.error('获取虚拟机列表失败:', error)
    ElMessage.error('获取虚拟机列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchVMList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.name = ''
  searchForm.status = ''
  pagination.page = 1
  fetchVMList()
}

// 每页数量变化
const handleSizeChange = (val) => {
  pagination.limit = val
  fetchVMList()
}

// 页码变化
const handleCurrentChange = (val) => {
  pagination.page = val
  fetchVMList()
}

// 启动虚拟机
const handleStartVM = async (row) => {
  try {
    actionLoading.value = true
    await startVM(row.id)
    ElMessage.success('虚拟机启动指令已发送')
    fetchVMList()
  } catch (error) {
    console.error('启动虚拟机失败:', error)
    ElMessage.error('启动虚拟机失败')
  } finally {
    actionLoading.value = false
  }
}

// 停止虚拟机
const handleStopVM = async (row) => {
  try {
    await ElMessageBox.confirm('确定要停止该虚拟机吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    actionLoading.value = true
    await stopVM(row.id)
    ElMessage.success('虚拟机停止指令已发送')
    fetchVMList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('停止虚拟机失败:', error)
      ElMessage.error('停止虚拟机失败')
    }
  } finally {
    actionLoading.value = false
  }
}

// 重启虚拟机
const handleRestartVM = async (row) => {
  try {
    await ElMessageBox.confirm('确定要重启该虚拟机吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    actionLoading.value = true
    await restartVM(row.id)
    ElMessage.success('虚拟机重启指令已发送')
    fetchVMList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重启虚拟机失败:', error)
      ElMessage.error('重启虚拟机失败')
    }
  } finally {
    actionLoading.value = false
  }
}

// 删除虚拟机
const handleDeleteVM = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该虚拟机吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    })

    actionLoading.value = true
    await deleteVM(row.id)
    ElMessage.success('虚拟机删除成功')
    fetchVMList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除虚拟机失败:', error)
      ElMessage.error('删除虚拟机失败')
    }
  } finally {
    actionLoading.value = false
  }
}

// 恢复虚拟机
const handleRecoverVM = async (row) => {
  try {
    actionLoading.value = true
    await recoverVM(row.id)
    ElMessage.success('虚拟机恢复成功')
    fetchVMList()
  } catch (error) {
    console.error('恢复虚拟机失败:', error)
    ElMessage.error('恢复虚拟机失败')
  } finally {
    actionLoading.value = false
  }
}

// 挂载时获取数据
onMounted(() => {
  fetchVMList()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-container {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
