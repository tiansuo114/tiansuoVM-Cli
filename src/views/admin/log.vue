<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="操作日志" name="operation">
        <el-card>
          <!-- 搜索区域 -->
          <div class="search-container">
            <el-form :inline="true" :model="operationSearchForm">
              <el-form-item label="用户名">
                <el-input
                  v-model="operationSearchForm.username"
                  placeholder="搜索用户名"
                  clearable
                  @keyup.enter="handleOperationSearch"
                />
              </el-form-item>
              <el-form-item label="操作类型">
                <el-input
                  v-model="operationSearchForm.action"
                  placeholder="搜索操作类型"
                  clearable
                  @keyup.enter="handleOperationSearch"
                />
              </el-form-item>
              <el-form-item label="时间范围">
                <el-date-picker
                  v-model="operationDateRange"
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
                  @click="handleOperationSearch"
                  >搜索</el-button
                >
                <el-button @click="resetOperationSearch"
                  >重置</el-button
                >
              </el-form-item>
            </el-form>
          </div>

          <!-- 表格区域 -->
          <el-table
            v-loading="operationLoading"
            :data="operationLogList"
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
              prop="username"
              label="用户名"
              min-width="120"
              show-overflow-tooltip
            />
            <el-table-column
              prop="action"
              label="操作类型"
              min-width="120"
            />
            <el-table-column
              prop="object"
              label="操作对象"
              min-width="120"
              show-overflow-tooltip
            />
            <el-table-column
              prop="result"
              label="操作结果"
              width="100"
              align="center"
            >
              <template #default="{ row }">
                <el-tag
                  :type="
                    row.result === 'success'
                      ? 'success'
                      : 'danger'
                  "
                >
                  {{
                    row.result === 'success' ? '成功' : '失败'
                  }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="ip"
              label="IP地址"
              min-width="120"
            />
            <el-table-column
              prop="detail"
              label="详细信息"
              min-width="200"
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
              v-model:current-page="operationPagination.page"
              v-model:page-size="operationPagination.limit"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="operationPagination.total"
              @size-change="handleOperationSizeChange"
              @current-change="handleOperationCurrentChange"
            />
          </div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="审核日志" name="audit">
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
              <el-form-item label="状态">
                <el-select
                  v-model="auditSearchForm.status"
                  placeholder="选择状态"
                  clearable
                >
                  <el-option label="通过" value="approved" />
                  <el-option label="拒绝" value="rejected" />
                  <el-option label="待审核" value="pending" />
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
              prop="username"
              label="申请用户"
              min-width="120"
              show-overflow-tooltip
            />
            <el-table-column
              prop="resource_type"
              label="资源类型"
              min-width="120"
            />
            <el-table-column
              prop="resource_id"
              label="资源ID"
              min-width="120"
            />
            <el-table-column
              prop="action"
              label="操作类型"
              min-width="120"
            />
            <el-table-column
              prop="status"
              label="状态"
              width="100"
              align="center"
            >
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="reviewer"
              label="审核人"
              min-width="120"
              show-overflow-tooltip
            />
            <el-table-column
              prop="reason"
              label="原因/评论"
              min-width="200"
              show-overflow-tooltip
            />
            <el-table-column
              prop="created_at"
              label="申请时间"
              width="180"
              align="center"
            >
              <template #default="{ row }">
                {{ formatTime(row.created_at) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="updated_at"
              label="审核时间"
              width="180"
              align="center"
            >
              <template #default="{ row }">
                {{ formatTime(row.updated_at) }}
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页区域 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="auditPagination.page"
              v-model:page-size="auditPagination.limit"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="auditPagination.total"
              @size-change="handleAuditSizeChange"
              @current-change="handleAuditCurrentChange"
            />
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getLogList, getAuditLogList } from '@/api/admin'

// 活动标签页
const activeTab = ref('operation')

// 状态标识
const operationLoading = ref(false)
const auditLoading = ref(false)

// 日志列表
const operationLogList = ref([])
const auditLogList = ref([])

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

// 操作日志搜索和分页
const operationSearchForm = reactive({
  username: '',
  action: '',
  start_time: '',
  end_time: ''
})

const operationDateRange = ref([])

const operationPagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

// 审核日志搜索和分页
const auditSearchForm = reactive({
  username: '',
  status: '',
  start_time: '',
  end_time: ''
})

const auditDateRange = ref([])

const auditPagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

// 获取状态标签
const getStatusLabel = (status) => {
  const statusMap = {
    approved: '通过',
    rejected: '拒绝',
    pending: '待审核'
  }
  return statusMap[status] || status
}

// 获取状态对应的类型
const getStatusType = (status) => {
  const statusTypeMap = {
    approved: 'success',
    rejected: 'danger',
    pending: 'warning'
  }
  return statusTypeMap[status] || ''
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleString()
}

// 获取操作日志列表
const fetchOperationLogList = async () => {
  try {
    operationLoading.value = true

    // 处理日期范围
    if (
      operationDateRange.value &&
      operationDateRange.value.length === 2
    ) {
      operationSearchForm.start_time =
        operationDateRange.value[0]
      operationSearchForm.end_time = operationDateRange.value[1]
    } else {
      operationSearchForm.start_time = ''
      operationSearchForm.end_time = ''
    }

    // 构建查询参数
    const params = {
      page: operationPagination.page,
      limit: operationPagination.limit,
      ...operationSearchForm
    }

    // 移除空值
    Object.keys(params).forEach((key) => {
      if (params[key] === '') {
        delete params[key]
      }
    })

    const res = await getLogList(params)

    operationLogList.value = res.logs || []
    operationPagination.total = res.total || 0
  } catch (error) {
    console.error('获取操作日志列表失败:', error)
    ElMessage.error('获取操作日志列表失败')
  } finally {
    operationLoading.value = false
  }
}

// 获取审核日志列表
const fetchAuditLogList = async () => {
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
      limit: auditPagination.limit,
      ...auditSearchForm
    }

    // 移除空值
    Object.keys(params).forEach((key) => {
      if (params[key] === '') {
        delete params[key]
      }
    })

    const res = await getAuditLogList(params)

    auditLogList.value = res.logs || []
    auditPagination.total = res.total || 0
  } catch (error) {
    console.error('获取审核日志列表失败:', error)
    ElMessage.error('获取审核日志列表失败')
  } finally {
    auditLoading.value = false
  }
}

// 标签页切换
const handleTabClick = () => {
  if (activeTab.value === 'operation') {
    fetchOperationLogList()
  } else {
    fetchAuditLogList()
  }
}

// 操作日志搜索
const handleOperationSearch = () => {
  operationPagination.page = 1
  fetchOperationLogList()
}

// 重置操作日志搜索
const resetOperationSearch = () => {
  operationSearchForm.username = ''
  operationSearchForm.action = ''
  operationDateRange.value = []
  operationPagination.page = 1
  fetchOperationLogList()
}

// 操作日志分页
const handleOperationSizeChange = (val) => {
  operationPagination.limit = val
  fetchOperationLogList()
}

const handleOperationCurrentChange = (val) => {
  operationPagination.page = val
  fetchOperationLogList()
}

// 审核日志搜索
const handleAuditSearch = () => {
  auditPagination.page = 1
  fetchAuditLogList()
}

// 重置审核日志搜索
const resetAuditSearch = () => {
  auditSearchForm.username = ''
  auditSearchForm.status = ''
  auditDateRange.value = []
  auditPagination.page = 1
  fetchAuditLogList()
}

// 审核日志分页
const handleAuditSizeChange = (val) => {
  auditPagination.limit = val
  fetchAuditLogList()
}

const handleAuditCurrentChange = (val) => {
  auditPagination.page = val
  fetchAuditLogList()
}

// 挂载时获取数据
onMounted(() => {
  fetchOperationLogList()
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
