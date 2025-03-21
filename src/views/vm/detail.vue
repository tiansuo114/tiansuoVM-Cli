<template>
  <div class="app-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>虚拟机详情</span>
          <div>
            <el-button @click="$router.push('/vm/list')"
              >返回列表</el-button
            >
            <el-button
              v-if="vm.status === VMStatus.STOPPED"
              type="success"
              @click="handleStartVM"
              :loading="actionLoading"
            >
              启动
            </el-button>
            <el-button
              v-if="vm.status === VMStatus.RUNNING"
              type="warning"
              @click="handleStopVM"
              :loading="actionLoading"
            >
              停止
            </el-button>
            <el-button
              v-if="vm.status === VMStatus.RUNNING"
              type="info"
              @click="handleRestartVM"
              :loading="actionLoading"
            >
              重启
            </el-button>
            <el-button
              v-if="vm.status !== VMStatus.DELETED"
              type="danger"
              @click="handleDeleteVM"
              :loading="actionLoading"
            >
              删除
            </el-button>
            <el-button
              v-if="vm.status === VMStatus.DELETED"
              type="success"
              @click="handleRecoverVM"
              :loading="actionLoading"
            >
              恢复
            </el-button>
          </div>
        </div>
      </template>

      <!-- 基本信息 -->
      <div v-if="vm.id">
        <div class="section-title">基本信息</div>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="虚拟机名称">{{
            vm.name
          }}</el-descriptions-item>
          <el-descriptions-item label="ID">{{
            vm.id
          }}</el-descriptions-item>
          <el-descriptions-item label="创建者">{{
            vm.creator
          }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(vm.status)">{{
              getStatusLabel(vm.status)
            }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{
            formatTime(vm.created_at)
          }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{
            formatTime(vm.updated_at)
          }}</el-descriptions-item>
        </el-descriptions>

        <div class="section-title">配置信息</div>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="CPU"
            >{{ vm.cpu }} 核</el-descriptions-item
          >
          <el-descriptions-item label="内存"
            >{{ vm.memory_mb }} MB</el-descriptions-item
          >
          <el-descriptions-item label="磁盘"
            >{{ vm.disk_gb }} GB</el-descriptions-item
          >
          <el-descriptions-item label="镜像">{{
            vm.image_name
          }}</el-descriptions-item>
          <el-descriptions-item label="镜像ID">{{
            vm.image_id
          }}</el-descriptions-item>
        </el-descriptions>

        <div class="section-title">网络信息</div>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="IP地址">{{
            vm.ip || '暂无'
          }}</el-descriptions-item>
          <el-descriptions-item label="SSH端口">{{
            vm.ssh_port || '暂无'
          }}</el-descriptions-item>
          <el-descriptions-item label="连接命令">
            <el-button
              v-if="vm.ip && vm.ssh_port"
              type="primary"
              size="small"
              @click="showConnectDrawer = true"
            >
              连接到虚拟机
            </el-button>
            <span v-else>虚拟机未启动</span>
          </el-descriptions-item>
        </el-descriptions>

        <div class="section-title">系统信息</div>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="节点名称">{{
            vm.node_name || '暂无'
          }}</el-descriptions-item>
          <el-descriptions-item label="命名空间">{{
            vm.namespace || '暂无'
          }}</el-descriptions-item>
          <el-descriptions-item label="Pod名称">{{
            vm.pod_name || '暂无'
          }}</el-descriptions-item>
          <el-descriptions-item label="状态消息" :span="3">{{
            vm.message || '无'
          }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <el-empty v-else description="未找到虚拟机信息" />
    </el-card>

    <!-- 连接抽屉 -->
    <el-drawer
      v-model="showConnectDrawer"
      title="连接到虚拟机"
      size="500px"
      :destroy-on-close="true"
    >
      <div class="connect-drawer">
        <div class="connect-methods">
          <div class="method-title">选择连接方式</div>

          <!-- SSH命令连接 -->
          <el-card class="method-card" shadow="hover">
            <template #header>
              <div class="method-header">
                <span>通过SSH命令连接</span>
                <el-button
                  type="primary"
                  @click="activeMethod = 'ssh'"
                  :class="{ active: activeMethod === 'ssh' }"
                  >选择</el-button
                >
              </div>
            </template>
            <div
              class="method-content"
              v-if="activeMethod === 'ssh'"
            >
              <el-form label-width="100px">
                <el-form-item label="用户名">
                  <el-input
                    v-model="sshForm.username"
                    placeholder="请输入用户名"
                  />
                </el-form-item>
                <el-form-item label="默认密码">
                  <el-input v-model="sshForm.password" disabled>
                    <template #append>
                      <el-button @click="copyPassword"
                        >复制</el-button
                      >
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="SSH命令">
                  <el-input
                    v-model="sshCommand"
                    readonly
                    type="textarea"
                    rows="2"
                  >
                    <template #append>
                      <el-button @click="copySSHCommand"
                        >复制</el-button
                      >
                    </template>
                  </el-input>
                </el-form-item>
              </el-form>
            </div>
          </el-card>

          <!-- Web Shell连接 -->
          <el-card class="method-card" shadow="hover">
            <template #header>
              <div class="method-header">
                <span>通过Web终端连接</span>
                <el-button
                  type="primary"
                  @click="activeMethod = 'web'"
                  :class="{ active: activeMethod === 'web' }"
                  >选择</el-button
                >
              </div>
            </template>
            <div
              class="method-content"
              v-if="activeMethod === 'web'"
            >
              <el-form label-width="100px">
                <el-form-item label="用户名">
                  <el-input
                    v-model="webForm.username"
                    placeholder="请输入用户名"
                  />
                </el-form-item>
                <el-form-item label="密码">
                  <el-input
                    v-model="webForm.password"
                    type="password"
                    placeholder="请输入密码"
                    show-password
                  />
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="primary"
                    @click="openWebTerminal"
                  >
                    打开Web终端
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-card>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getVM,
  startVM,
  stopVM,
  restartVM,
  deleteVM,
  recoverVM,
  getVMDefaultCredentials
} from '@/api/vm'

import { VMStatus } from '@/api/types/vm'

// 路由实例
const route = useRoute()

// 虚拟机ID
const vmId = route.params.id

// 加载状态
const loading = ref(false)
const actionLoading = ref(false)

// 虚拟机信息
const vm = ref({})

// 连接相关
const showConnectDrawer = ref(false)
const activeMethod = ref('ssh')

// SSH表单数据
const sshForm = reactive({
  username: '',
  password: ''
})

// Web终端表单数据
const webForm = reactive({
  username: '',
  password: ''
})

// 计算SSH命令
const sshCommand = computed(() => {
  if (!vm.value.ip || !vm.value.ssh_port) return ''
  return `ssh -p ${vm.value.ssh_port} ${sshForm.username}@${vm.value.ip}`
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

// 获取默认连接信息
const fetchDefaultCredentials = async () => {
  try {
    // TODO: 调用API获取默认用户名和密码
    const res = await getVMDefaultCredentials(vmId)
    sshForm.username = res.username
    sshForm.password = res.password
    webForm.username = res.username
    webForm.password = res.password
  } catch (error) {
    console.error('获取默认凭据失败:', error)
    ElMessage.error('获取默认凭据失败')
  }
}

// 复制SSH命令
const copySSHCommand = () => {
  navigator.clipboard
    .writeText(sshCommand.value)
    .then(() => {
      ElMessage.success('SSH命令已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.error('复制失败，请手动复制')
    })
}

// 复制密码
const copyPassword = () => {
  navigator.clipboard
    .writeText(sshForm.password)
    .then(() => {
      ElMessage.success('密码已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.error('复制失败，请手动复制')
    })
}

// 打开Web终端
const openWebTerminal = () => {
  if (!vm.value.ip) {
    ElMessage.warning('虚拟机未启动或IP地址未分配')
    return
  }
  
  if (!vm.value.ssh_port) {
    ElMessage.warning('SSH端口未配置')
    return
  }

  const terminalUrl = `/vm/terminal`
  const params = new URLSearchParams({
    vmId: vmId,
    username: webForm.username,
    host: vm.value.ip,
    port: vm.value.ssh_port
  })
  
  // 打开新窗口
  window.open(`${terminalUrl}?${params.toString()}`, '_blank', 'width=800,height=600')
}

// 监听抽屉显示
watch(showConnectDrawer, (val) => {
  if (val) {
    fetchDefaultCredentials()
  }
})

// 获取虚拟机详情
const fetchVMDetail = async () => {
  try {
    loading.value = true
    const data = await getVM(vmId)
    vm.value = data
  } catch (error) {
    console.error('获取虚拟机详情失败:', error)
    ElMessage.error('获取虚拟机详情失败')
  } finally {
    loading.value = false
  }
}

// 启动虚拟机
const handleStartVM = async () => {
  try {
    actionLoading.value = true
    await startVM(vmId)
    ElMessage.success('虚拟机启动指令已发送')
    fetchVMDetail()
  } catch (error) {
    console.error('启动虚拟机失败:', error)
    ElMessage.error('启动虚拟机失败')
  } finally {
    actionLoading.value = false
  }
}

// 停止虚拟机
const handleStopVM = async () => {
  try {
    await ElMessageBox.confirm('确定要停止该虚拟机吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    actionLoading.value = true
    await stopVM(vmId)
    ElMessage.success('虚拟机停止指令已发送')
    fetchVMDetail()
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
const handleRestartVM = async () => {
  try {
    await ElMessageBox.confirm('确定要重启该虚拟机吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    actionLoading.value = true
    await restartVM(vmId)
    ElMessage.success('虚拟机重启指令已发送')
    fetchVMDetail()
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
const handleDeleteVM = async () => {
  try {
    await ElMessageBox.confirm('确定要删除该虚拟机吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    })

    actionLoading.value = true
    await deleteVM(vmId)
    ElMessage.success('虚拟机删除成功')
    fetchVMDetail()
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
const handleRecoverVM = async () => {
  try {
    actionLoading.value = true
    await recoverVM(vmId)
    ElMessage.success('虚拟机恢复成功')
    fetchVMDetail()
  } catch (error) {
    console.error('恢复虚拟机失败:', error)
    ElMessage.error('恢复虚拟机失败')
  } finally {
    actionLoading.value = false
  }
}

// 挂载时获取虚拟机详情
onMounted(() => {
  fetchVMDetail()
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

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin: 20px 0 10px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.connect-drawer {
  padding: 20px;
}

.connect-methods {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.method-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 20px;
}

.method-card {
  margin-bottom: 20px;
}

.method-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.method-content {
  padding: 20px 0;
}

.el-button.active {
  background-color: #409eff;
  color: white;
}

:deep(.el-drawer__body) {
  padding: 0;
}

:deep(.el-form-item:last-child) {
  margin-bottom: 0;
}
</style>
