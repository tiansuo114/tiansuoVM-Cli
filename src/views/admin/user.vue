<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-container">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="用户名">
            <el-input
              v-model="searchForm.username"
              placeholder="搜索用户名"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="用户角色">
            <el-select
              v-model="searchForm.role"
              placeholder="选择角色"
              clearable
            >
              <el-option
                v-for="(value, key) in UserRole"
                :key="key"
                :label="getRoleLabel(value)"
                :value="value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="searchForm.status"
              placeholder="选择状态"
              clearable
            >
              <el-option
                v-for="(value, key) in UserStatus"
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
        :data="userList"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column
          prop="username"
          label="用户名"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="uid"
          label="UID"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="role"
          label="角色"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              :type="row.role === UserRole.ADMIN ? 'danger' : ''"
            >
              {{ getRoleLabel(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="email"
          label="邮箱"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="tel"
          label="电话"
          width="120"
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
              {{ getStatusLabel(row.status) }}
            </el-tag>
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
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleEditUser(row)"
            >
              编辑
            </el-button>
            <el-button
              :type="
                row.status === UserStatus.Enabled
                  ? 'danger'
                  : 'success'
              "
              size="small"
              @click="handleToggleStatus(row)"
              :disabled="row.uid === currentUser.uid"
            >
              {{
                row.status === UserStatus.Enabled
                  ? '禁用'
                  : '启用'
              }}
            </el-button>
            <el-button
              :type="
                row.role === UserRole.ADMIN
                  ? 'warning'
                  : 'success'
              "
              size="small"
              @click="handleToggleRole(row)"
              :disabled="row.uid === currentUser.uid"
            >
              {{ row.role === UserRole.ADMIN ? '降级' : '升级' }}
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

    <!-- 用户编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑用户' : '新增用户'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item
          label="用户名"
          prop="username"
          v-if="!isEdit"
        >
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
          />
        </el-form-item>
        <el-form-item
          label="密码"
          prop="password"
          v-if="!isEdit"
        >
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
          />
        </el-form-item>
        <el-form-item
          label="确认密码"
          prop="confirmPassword"
          v-if="!isEdit"
        >
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请确认密码"
          />
        </el-form-item>
        <el-form-item label="电话" prop="tel">
          <el-input
            v-model="form.tel"
            placeholder="请输入电话"
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="form.email"
            placeholder="请输入邮箱"
          />
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input
            v-model="form.desc"
            type="textarea"
            placeholder="请输入描述"
          />
        </el-form-item>
        <el-form-item label="角色" prop="role" v-if="!isEdit">
          <el-select
            v-model="form.role"
            placeholder="请选择角色"
            style="width: 100%"
          >
            <el-option
              v-for="(value, key) in UserRole"
              :key="key"
              :label="getRoleLabel(value)"
              :value="value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false"
            >取消</el-button
          >
          <el-button
            type="primary"
            @click="submitForm"
            :loading="submitLoading"
          >
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCurrentUser } from '@/api/user'
import { UserRole, UserStatus } from '@/api/types/user'
import * as adminApi from '@/api/admin'

// 状态标识
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)

// 当前登录用户信息
const currentUser = ref({})

// 用户列表
const userList = ref([])

// 搜索表单
const searchForm = reactive({
  username: '',
  role: '',
  status: ''
})

// 分页参数
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

// 表单引用
const formRef = ref(null)

// 表单数据
const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  tel: '',
  email: '',
  desc: '',
  role: UserRole.NORMAL
})

// 表单验证规则
const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    if (form.confirmPassword !== '') {
      formRef.value.validateField('confirmPassword')
    }
    callback()
  }
}

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    {
      min: 3,
      max: 20,
      message: '长度在 3 到 20 个字符',
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, validator: validatePass, trigger: 'blur' },
    {
      min: 6,
      max: 20,
      message: '长度在 6 到 20 个字符',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: 'blur' }
  ],
  email: [
    {
      type: 'email',
      message: '请输入正确的邮箱地址',
      trigger: 'blur'
    }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 获取角色标签
const getRoleLabel = (role) => {
  const roleMap = {
    [UserRole.NORMAL]: '普通用户',
    [UserRole.ADMIN]: '管理员'
  }
  return roleMap[role] || role
}

// 获取状态标签
const getStatusLabel = (status) => {
  const statusMap = {
    [UserStatus.Enabled]: '正常',
    [UserStatus.INACTIVE]: '未激活',
    [UserStatus.DISABLED]: '已禁用'
  }
  return statusMap[status] || status
}

// 获取状态对应的类型
const getStatusType = (status) => {
  const statusTypeMap = {
    [UserStatus.Enabled]: 'success',
    [UserStatus.INACTIVE]: 'info',
    [UserStatus.DISABLED]: 'danger'
  }
  return statusTypeMap[status] || ''
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleString()
}

// 获取用户列表
const fetchUserList = async () => {
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
    debugger
    const res = await adminApi.getUserList(params)

    userList.value = res.items || []
    pagination.total = res.total || 0

    console.log('API返回数据:', userList.value)
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 获取当前用户信息
const fetchCurrentUser = async () => {
  try {
    currentUser.value = await getCurrentUser()
  } catch (error) {
    console.error('获取当前用户信息失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchUserList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.username = ''
  searchForm.role = ''
  searchForm.status = ''
  pagination.page = 1
  fetchUserList()
}

// 每页数量变化
const handleSizeChange = (val) => {
  pagination.limit = val
  fetchUserList()
}

// 页码变化
const handleCurrentChange = (val) => {
  pagination.page = val
  fetchUserList()
}

// 新增用户
const handleCreateUser = () => {
  isEdit.value = false

  // 重置表单
  Object.keys(form).forEach((key) => {
    form[key] = key === 'role' ? UserRole.NORMAL : ''
  })

  dialogVisible.value = true
}

// 编辑用户
const handleEditUser = (row) => {
  isEdit.value = true

  // 填充表单
  form.username = row.username
  form.tel = row.tel || ''
  form.email = row.email || ''
  form.desc = row.desc || ''
  form.role = row.role

  dialogVisible.value = true
}

// 提交表单
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      submitLoading.value = true

      if (isEdit.value) {
        // 编辑用户
        const { username, ...updateData } = form
        await adminApi.updateUser(username, updateData)
        ElMessage.success('编辑用户成功')
      } else {
        // 新增用户
        const { confirmPassword, ...userData } = form
        await adminApi.createUser(userData)
        ElMessage.success('新增用户成功')
      }

      dialogVisible.value = false
      fetchUserList()
    } catch (error) {
      console.error('操作失败:', error)
      ElMessage.error('操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 切换用户状态
const handleToggleStatus = async (row) => {
  const newStatus =
    row.status === UserStatus.Enabled
      ? UserStatus.DISABLED
      : UserStatus.Enabled
  const actionText =
    newStatus === UserStatus.Enabled ? '启用' : '禁用'

  try {
    await ElMessageBox.confirm(
      `确定要${actionText}用户 "${row.username}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    // 按情况使用enableUser和disableUser
    if (newStatus === UserStatus.Enabled) {
      await adminApi.enableUser(row.uid)
    } else {
      await adminApi.disableUser(row.uid)
    }

    ElMessage.success(`${actionText}用户成功`)
    fetchUserList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

// 切换用户角色
const handleToggleRole = async (row) => {
  const newRole =
    row.role === UserRole.ADMIN
      ? UserRole.NORMAL
      : UserRole.ADMIN
  const actionText =
    newRole === UserRole.ADMIN
      ? '升级为管理员'
      : '降级为普通用户'

  try {
    await ElMessageBox.confirm(
      `确定要将用户 "${row.username}" ${actionText}吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const updateData = {
      uid: row.uid,
      role: newRole
    }
    await adminApi.updateUserRole(updateData)
    ElMessage.success(`角色修改成功`)
    fetchUserList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

// 挂载时获取数据
onMounted(() => {
  fetchCurrentUser()
  fetchUserList()
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
