<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="审计日志" name="audit">
        <el-card>
          <!-- 搜索区域 -->
          <div class="search-container">
            <el-form :inline="true" :model="auditSearchForm">
              <el-form-item label="用户名">
                <el-input
                  v-model="auditSearchForm.username"
                  placeholder="搜索用户名"
                  clearable
                  @keyup.enter="handleAuditSearch"
                />
              </el-form-item>
              <el-form-item label="IP地址">
                <el-input
                  v-model="auditSearchForm.ip"
                  placeholder="搜索IP地址"
                  clearable
                  @keyup.enter="handleAuditSearch"
                />
              </el-form-item>
              <el-form-item label="操作类型">
                <el-input
                  v-model="auditSearchForm.operation"
                  placeholder="搜索操作类型"
                  clearable
                  @keyup.enter="handleAuditSearch"
                />
              </el-form-item>
              <el-form-item label="状态">
                <el-select
                  v-model="auditSearchForm.status"
                  placeholder="选择状态"
                  clearable
                  multiple
                  collapse-tags
                >
                  <el-option label="成功" :value="200" />
                  <el-option label="失败" :value="500" />
                  <el-option label="未授权" :value="401" />
                  <el-option label="禁止访问" :value="403" />
                </el-select>
              </el-form-item>
              <el-form-item label="时间范围">
                <el-date-picker
                  v-model="auditDateRange"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="X"
                  :shortcuts="dateShortcuts"
                />
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  @click="handleAuditSearch"
                  >搜索</el-button
                >
                <el-button @click="resetAuditSearch"
                  >重置</el-button
                >
              </el-form-item>
            </el-form>
          </div>

          <!-- 表格区域 -->
          <el-table
            v-loading="auditLoading"
            :data="auditLogList"
            stripe
            border
            style="width: 100%"
          >
            <el-table-column
              prop="id"
              label="ID"
              width="80"
              align="center"
            />
            <el-table-column
              prop="source_ip"
              label="IP地址"
              min-width="120"
            />
            <el-table-column
              prop="operation"
              label="操作类型"
              min-width="120"
            />
            <el-table-column
              prop="uri"
              label="URI"
              min-width="200"
              show-overflow-tooltip
            />
            <el-table-column
              prop="status"
              label="状态"
              width="100"
              align="center"
            >
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="created_at"
              label="操作时间"
              width="180"
              align="center"
            >
              <template #default="{ row }">
                {{ formatTime(row.created_at) }}
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页区域 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="auditPagination.page"
              v-model:page-size="auditPagination.page_size"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="auditPagination.total"
              @size-change="handleAuditSizeChange"
              @current-change="handleAuditCurrentChange"
            />
          </div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="用户操作日志" name="user-operation">
        <el-card>
          <!-- 搜索区域 -->
          <div class="search-container">
            <el-form
              :inline="true"
              :model="userOperationSearchForm"
            >
              <el-form-item label="用户ID">
                <el-input
                  v-model="userOperationSearchForm.uid"
                  placeholder="搜索用户ID"
                  clearable
                  @keyup.enter="handleUserOperationSearch"
                />
              </el-form-item>
              <el-form-item label="时间范围">
                <el-date-picker
                  v-model="userOperationDateRange"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="X"
                  :shortcuts="dateShortcuts"
                />
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  @click="handleUserOperationSearch"
                  >搜索</el-button
                >
                <el-button @click="resetUserOperationSearch"
                  >重置</el-button
                >
              </el-form-item>
            </el-form>
          </div>

          <!-- 表格区域 -->
          <el-table
            v-loading="userOperationLoading"
            :data="userOperationLogList"
            stripe
            border
            style="width: 100%"
          >
            <el-table-column
              prop="id"
              label="ID"
              width="80"
              align="center"
            />
            <el-table-column
              prop="uid"
              label="用户ID"
              min-width="120"
              show-overflow-tooltip
            />
            <el-table-column
              prop="operator"
              label="操作者类型"
              min-width="120"
            />
            <el-table-column
              prop="operation"
              label="操作类型"
              min-width="120"
            />
            <el-table-column
              prop="creator"
              label="创建者"
              min-width="120"
              show-overflow-tooltip
            />
            <el-table-column
              prop="created_at"
              label="操作时间"
              width="180"
              align="center"
            >
              <template #default="{ row }">
                {{ formatTime(row.created_at) }}
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页区域 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="userOperationPagination.page"
              v-model:page-size="
                userOperationPagination.page_size
              "
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="userOperationPagination.total"
              @size-change="handleUserOperationSizeChange"
              @current-change="handleUserOperationCurrentChange"
            />
          </div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="事件日志" name="event">
        <el-card>
          <!-- 搜索区域 -->
          <div class="search-container">
            <el-form :inline="true" :model="eventSearchForm">
              <el-form-item label="事件类型">
                <el-select
                  v-model="eventSearchForm.event_type"
                  placeholder="选择事件类型"
                  clearable
                >
                  <el-option label="系统事件" value="system" />
                  <el-option label="用户事件" value="user" />
                  <el-option label="资源事件" value="resource" />
                  <el-option label="安全事件" value="security" />
                </el-select>
              </el-form-item>
              <el-form-item label="创建者">
                <el-input
                  v-model="eventSearchForm.creator"
                  placeholder="搜索创建者"
                  clearable
                  @keyup.enter="handleEventSearch"
                />
              </el-form-item>
              <el-form-item label="时间范围">
                <el-date-picker
                  v-model="eventDateRange"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="X"
                  :shortcuts="dateShortcuts"
                />
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  @click="handleEventSearch"
                  >搜索</el-button
                >
                <el-button @click="resetEventSearch"
                  >重置</el-button
                >
              </el-form-item>
            </el-form>
          </div>

          <!-- 表格区域 -->
          <el-table
            v-loading="eventLoading"
            :data="eventLogList"
            stripe
            border
            style="width: 100%"
          >
            <el-table-column
              prop="id"
              label="ID"
              width="80"
              align="center"
            />
            <el-table-column
              prop="event_type"
              label="事件类型"
              min-width="120"
            />
            <el-table-column
              prop="operation"
              label="操作类型"
              min-width="120"
            />
            <el-table-column
              prop="message"
              label="消息"
              min-width="200"
              show-overflow-tooltip
            />
            <el-table-column
              prop="resource_uid"
              label="资源ID"
              min-width="120"
              show-overflow-tooltip
            />
            <el-table-column
              prop="resource_type"
              label="资源类型"
              min-width="120"
            />
            <el-table-column
              prop="creator"
              label="创建者"
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
            <el-table-column
              label="操作"
              width="100"
              align="center"
              fixed="right"
            >
              <template #default="{ row }">
                <el-button
                  type="text"
                  size="small"
                  @click="viewEventDetail(row.id)"
                >
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页区域 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="eventPagination.page"
              v-model:page-size="eventPagination.page_size"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="eventPagination.total"
              @size-change="handleEventSizeChange"
              @current-change="handleEventCurrentChange"
            />
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 事件详情对话框 -->
    <el-dialog
      v-model="eventDetailDialogVisible"
      title="事件详情"
      width="600px"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{
          eventDetail.id
        }}</el-descriptions-item>
        <el-descriptions-item label="事件类型">{{
          eventDetail.event_type
        }}</el-descriptions-item>
        <el-descriptions-item label="操作类型">{{
          eventDetail.operation
        }}</el-descriptions-item>
        <el-descriptions-item label="消息">{{
          eventDetail.message
        }}</el-descriptions-item>
        <el-descriptions-item label="资源ID">{{
          eventDetail.resource_uid
        }}</el-descriptions-item>
        <el-descriptions-item label="资源类型">{{
          eventDetail.resource_type
        }}</el-descriptions-item>
        <el-descriptions-item label="创建者">{{
          eventDetail.creator
        }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{
          formatTime(eventDetail.created_at)
        }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="eventDetailDialogVisible = false"
            >关闭</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getAuditLogs,
  getUserOperationLogs,
  getEventLogs,
  getEventLog
} from '@/api/admin'

// 活动标签页
const activeTab = ref('audit')

// 状态标识
const auditLoading = ref(false)
const userOperationLoading = ref(false)
const eventLoading = ref(false)

// 日志列表
const auditLogList = ref([])
const userOperationLogList = ref([])
const eventLogList = ref([])

// 事件详情
const eventDetail = ref({})
const eventDetailDialogVisible = ref(false)

// 日期快捷方式
const dateShortcuts = [
  {
    text: '最近一天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24)
      return [start, end]
    }
  },
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  }
]

// 审计日志搜索和分页
const auditSearchForm = reactive({
  username: '',
  ip: '',
  operation: '',
  status: [],
  start_time: '',
  end_time: ''
})

const auditDateRange = ref([])

const auditPagination = reactive({
  page: 1,
  page_size: 10,
  total: 0
})

// 用户操作日志搜索和分页
const userOperationSearchForm = reactive({
  uid: '',
  start_time: '',
  end_time: ''
})

const userOperationDateRange = ref([])

const userOperationPagination = reactive({
  page: 1,
  page_size: 10,
  total: 0
})

// 事件日志搜索和分页
const eventSearchForm = reactive({
  event_type: '',
  creator: '',
  start_time: '',
  end_time: ''
})

const eventDateRange = ref([])

const eventPagination = reactive({
  page: 1,
  page_size: 10,
  total: 0
})

// 获取状态标签文本
const getStatusText = (status) => {
  const statusMap = {
    200: '成功',
    400: '请求错误',
    401: '未授权',
    403: '禁止访问',
    404: '未找到',
    500: '服务器错误'
  }
  return statusMap[status] || `状态${status}`
}

// 获取状态对应的类型
const getStatusType = (status) => {
  if (status >= 200 && status < 300) return 'success'
  if (status >= 400 && status < 500) return 'warning'
  if (status >= 500) return 'danger'
  return 'info'
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp * 1000) // 假设时间戳是秒级的
  return date.toLocaleString()
}

// 获取审计日志列表
const fetchAuditLogs = async () => {
  try {
    auditLoading.value = true

    // 处理日期范围
    if (
      auditDateRange.value &&
      auditDateRange.value.length === 2
    ) {
      auditSearchForm.start_time = auditDateRange.value[0]
      auditSearchForm.end_time = auditDateRange.value[1]
    } else {
      auditSearchForm.start_time = ''
      auditSearchForm.end_time = ''
    }

    // 构建查询参数
    const params = {
      page: auditPagination.page,
      page_size: auditPagination.page_size,
      ...auditSearchForm
    }

    // 移除空值
    Object.keys(params).forEach((key) => {
      if (
        params[key] === '' ||
        (Array.isArray(params[key]) && params[key].length === 0)
      ) {
        delete params[key]
      }
    })

    const res = await getAuditLogs(params)

    auditLogList.value = res.items || []
    auditPagination.total = res.total || 0
  } catch (error) {
    console.error('获取审计日志列表失败:', error)
    ElMessage.error('获取审计日志列表失败')
  } finally {
    auditLoading.value = false
  }
}

// 获取用户操作日志列表
const fetchUserOperationLogs = async () => {
  try {
    userOperationLoading.value = true

    // 处理日期范围
    if (
      userOperationDateRange.value &&
      userOperationDateRange.value.length === 2
    ) {
      userOperationSearchForm.start_time =
        userOperationDateRange.value[0]
      userOperationSearchForm.end_time =
        userOperationDateRange.value[1]
    } else {
      userOperationSearchForm.start_time = ''
      userOperationSearchForm.end_time = ''
    }

    // 构建查询参数，确保页码正确传递
    const params = {
      page: userOperationPagination.page,
      page_size: userOperationPagination.page_size,
      ...userOperationSearchForm
    }
    debugger
    console.log('发送用户操作日志请求参数:', params) // 添加日志帮助调试

    // 移除空值
    Object.keys(params).forEach((key) => {
      if (params[key] === '') {
        delete params[key]
      }
    })

    const res = await getUserOperationLogs(params)
    console.log('用户操作日志响应:', res) // 添加日志帮助调试

    // 统一响应处理
    userOperationLogList.value = res.items || res.list || []
    userOperationPagination.total = res.total || 0

    // 确保页码正确同步
    if (res.page) {
      userOperationPagination.page = Number(res.page)
    }
  } catch (error) {
    console.error('获取用户操作日志列表失败:', error)
    ElMessage.error('获取用户操作日志列表失败')
  } finally {
    userOperationLoading.value = false
  }
}

// 获取事件日志列表
const fetchEventLogs = async () => {
  try {
    eventLoading.value = true

    // 处理日期范围
    if (
      eventDateRange.value &&
      eventDateRange.value.length === 2
    ) {
      eventSearchForm.start_time = eventDateRange.value[0]
      eventSearchForm.end_time = eventDateRange.value[1]
    } else {
      eventSearchForm.start_time = ''
      eventSearchForm.end_time = ''
    }

    // 构建查询参数
    const params = {
      page: eventPagination.page,
      page_size: eventPagination.page_size,
      ...eventSearchForm
    }

    // 移除空值
    Object.keys(params).forEach((key) => {
      if (params[key] === '') {
        delete params[key]
      }
    })

    const res = await getEventLogs(params)

    eventLogList.value = res.items || []
    eventPagination.total = res.total || 0
  } catch (error) {
    console.error('获取事件日志列表失败:', error)
    ElMessage.error('获取事件日志列表失败')
  } finally {
    eventLoading.value = false
  }
}

// 查看事件详情
const viewEventDetail = async (id) => {
  try {
    const res = await getEventLog(id)
    eventDetail.value = res
    eventDetailDialogVisible.value = true
  } catch (error) {
    console.error('获取事件详情失败:', error)
    ElMessage.error('获取事件详情失败')
  }
}

// 标签页切换
const handleTabClick = () => {
  if (activeTab.value === 'audit') {
    fetchAuditLogs()
  } else if (activeTab.value === 'user-operation') {
    fetchUserOperationLogs()
  } else if (activeTab.value === 'event') {
    fetchEventLogs()
  }
}

// 审计日志搜索
const handleAuditSearch = () => {
  auditPagination.page = 1
  fetchAuditLogs()
}

// 重置审计日志搜索
const resetAuditSearch = () => {
  auditSearchForm.username = ''
  auditSearchForm.ip = ''
  auditSearchForm.operation = ''
  auditSearchForm.status = []
  auditDateRange.value = []
  auditPagination.page = 1
  fetchAuditLogs()
}

// 审计日志分页
const handleAuditSizeChange = (val) => {
  auditPagination.page_size = val
  fetchAuditLogs()
}

const handleAuditCurrentChange = (val) => {
  auditPagination.page = val
  fetchAuditLogs()
}

// 用户操作日志搜索
const handleUserOperationSearch = () => {
  userOperationPagination.page = 1
  fetchUserOperationLogs()
}

// 重置用户操作日志搜索
const resetUserOperationSearch = () => {
  userOperationSearchForm.uid = ''
  userOperationDateRange.value = []
  userOperationPagination.page = 1
  fetchUserOperationLogs()
}

// 用户操作日志分页
const handleUserOperationSizeChange = (val) => {
  userOperationPagination.page_size = val
  // 当修改每页显示数量时，重置到第1页
  userOperationPagination.page = 1
  fetchUserOperationLogs()
}

const handleUserOperationCurrentChange = (val) => {
  console.log('用户操作日志页码变更为:', val) // 添加日志帮助调试
  userOperationPagination.page = val
  fetchUserOperationLogs()
}

// 事件日志搜索
const handleEventSearch = () => {
  eventPagination.page = 1
  fetchEventLogs()
}

// 重置事件日志搜索
const resetEventSearch = () => {
  eventSearchForm.event_type = ''
  eventSearchForm.creator = ''
  eventDateRange.value = []
  eventPagination.page = 1
  fetchEventLogs()
}

// 事件日志分页
const handleEventSizeChange = (val) => {
  eventPagination.page_size = val
  fetchEventLogs()
}

const handleEventCurrentChange = (val) => {
  eventPagination.page = val
  fetchEventLogs()
}

// 挂载时获取数据
onMounted(() => {
  fetchAuditLogs()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
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
