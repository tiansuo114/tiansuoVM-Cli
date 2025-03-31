<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>镜像列表</span>
          <el-button
            type="primary"
            @click="handleCreateImage"
            v-if="isAdmin"
          >
            <el-icon><Plus /></el-icon>添加镜像
          </el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-container">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="镜像名称">
            <el-input
              v-model="searchForm.name"
              placeholder="搜索镜像名称"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="操作系统">
            <el-input
              v-model="searchForm.os_type"
              placeholder="搜索操作系统"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="仅公共镜像">
            <el-switch v-model="searchForm.public" />
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
        :data="imageList"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column
          prop="display_name"
          label="显示名称"
          min-width="150"
          show-overflow-tooltip
        >
          <template #header>
            <div class="column-header">
              <span>显示名称</span>
              <el-button
                type="text"
                @click="toggleSort"
                class="sort-button"
              >
                <el-icon>
                  <component :is="sortAscending ? 'ArrowUp' : 'ArrowDown'" />
                </el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          label="镜像名称"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="os_type"
          label="操作系统"
          width="100"
        />
        <el-table-column
          prop="os_version"
          label="系统版本"
          width="100"
        />
        <el-table-column
          prop="architecture"
          label="架构"
          width="100"
          align="center"
        />
        <el-table-column
          prop="default_user"
          label="默认用户"
          width="100"
          align="center"
        />
        <el-table-column
          prop="public"
          label="公共镜像"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag :type="row.public ? 'success' : 'info'">
              {{ row.public ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="状态"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              :type="
                row.status === 'available' ? 'success' : 'danger'
              "
            >
              {{
                row.status === 'available' ? '可用' : '不可用'
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="created_at"
          label="创建时间"
          width="180"
        >
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleViewDetail(row)"
            >
              详情
            </el-button>
            <el-button
              type="success"
              size="small"
              @click="handleCreateVM(row)"
            >
              创建虚拟机
            </el-button>
            <el-button
              v-if="isAdmin"
              type="danger"
              size="small"
              @click="handleDeleteImage(row)"
              :disabled="row.status !== 'available'"
            >
              删除
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

    <!-- 新增镜像对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="新增镜像"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="镜像名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入镜像名称"
          />
        </el-form-item>
        <el-form-item label="显示名称" prop="display_name">
          <el-input
            v-model="form.display_name"
            placeholder="请输入显示名称"
          />
        </el-form-item>
        <el-form-item label="操作系统类型" prop="os_type">
          <el-select
            v-model="form.os_type"
            placeholder="请选择操作系统类型"
            style="width: 100%"
          >
            <el-option label="CentOS" value="CentOS" />
            <el-option label="Ubuntu" value="Ubuntu" />
            <el-option label="Debian" value="Debian" />
            <el-option label="Windows" value="Windows" />
            <el-option label="其他" value="Other" />
          </el-select>
        </el-form-item>
        <el-form-item label="系统版本" prop="os_version">
          <el-input
            v-model="form.os_version"
            placeholder="请输入系统版本"
          />
        </el-form-item>
        <el-form-item label="架构" prop="architecture">
          <el-select
            v-model="form.architecture"
            placeholder="请选择架构"
            style="width: 100%"
          >
            <el-option label="x86_64" value="x86_64" />
            <el-option label="aarch64" value="aarch64" />
            <el-option label="i386" value="i386" />
          </el-select>
        </el-form-item>
        <el-form-item label="镜像URL" prop="image_url">
          <el-input
            v-model="form.image_url"
            placeholder="请输入镜像URL"
          />
        </el-form-item>
        <el-form-item label="默认用户" prop="default_user">
          <el-input
            v-model="form.default_user"
            placeholder="请输入默认用户"
          />
        </el-form-item>
        <el-form-item label="公共镜像" prop="public">
          <el-switch v-model="form.public" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述信息"
          />
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getImageList,
  createImage,
  deleteImage
} from '@/api/image'
import { getCurrentUser } from '@/api/user'
import { ImageStatus } from '@/api/types/image'

// 路由实例
const router = useRouter()

// 状态标识
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)

// 用户信息
const userRole = ref('normal')
const isAdmin = computed(() => userRole.value === 'admin')

// 表单引用
const formRef = ref(null)

// 镜像列表数据
const imageList = ref([])

// 搜索表单
const searchForm = reactive({
  name: '',
  os_type: '',
  public: false
})

// 分页参数
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

// 新增镜像表单
const form = reactive({
  name: '',
  display_name: '',
  os_type: '',
  os_version: '',
  architecture: 'x86_64',
  image_url: '',
  public: false,
  default_user: 'root',
  description: ''
})

// 表单验证规则
const rules = {
  name: [
    {
      required: true,
      message: '请输入镜像名称',
      trigger: 'blur'
    },
    {
      max: 64,
      message: '镜像名称不能超过64个字符',
      trigger: 'blur'
    }
  ],
  display_name: [
    {
      required: true,
      message: '请输入显示名称',
      trigger: 'blur'
    },
    {
      max: 128,
      message: '显示名称不能超过128个字符',
      trigger: 'blur'
    }
  ],
  os_type: [
    {
      required: true,
      message: '请选择操作系统类型',
      trigger: 'change'
    },
    {
      max: 32,
      message: '操作系统类型不能超过32个字符',
      trigger: 'blur'
    }
  ],
  os_version: [
    {
      required: true,
      message: '请输入系统版本',
      trigger: 'blur'
    },
    {
      max: 32,
      message: '系统版本不能超过32个字符',
      trigger: 'blur'
    }
  ],
  architecture: [
    { required: true, message: '请选择架构', trigger: 'change' },
    { max: 16, message: '架构不能超过16个字符', trigger: 'blur' }
  ],
  image_url: [
    {
      required: true,
      message: '请输入镜像URL',
      trigger: 'blur'
    },
    {
      max: 256,
      message: '镜像URL不能超过256个字符',
      trigger: 'blur'
    },
    {
      type: 'url',
      message: '镜像URL格式不正确',
      trigger: 'blur'
    }
  ],
  default_user: [
    {
      required: true,
      message: '请输入默认用户',
      trigger: 'blur'
    },
    {
      max: 32,
      message: '默认用户不能超过32个字符',
      trigger: 'blur'
    }
  ],
  description: [
    {
      max: 1024,
      message: '描述不能超过1024个字符',
      trigger: 'blur'
    }
  ]
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleString()
}

// 在 script setup 部分添加
const sortAscending = ref(true)

// 切换排序方向
const toggleSort = () => {
  sortAscending.value = !sortAscending.value
  fetchImageList()
}

// 获取镜像列表
const fetchImageList = async () => {
  try {
    loading.value = true

    // 构建查询参数
    const params = {
      page: pagination.page,
      sort_by: 'display_name',
      ascending: sortAscending.value,
      limit: pagination.limit,
      ...searchForm
    }

    // 移除空值
    Object.keys(params).forEach((key) => {
      if (params[key] === '') {
        delete params[key]
      }
    })

    const res = await getImageList(params)

    imageList.value = res.items || []
    pagination.total = res.total || 0
  } catch (error) {
    console.error('获取镜像列表失败:', error)
    ElMessage.error('获取镜像列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchImageList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.name = ''
  searchForm.os_type = ''
  searchForm.public = false
  pagination.page = 1
  fetchImageList()
}

// 每页数量变化
const handleSizeChange = (val) => {
  pagination.limit = val
  fetchImageList()
}

// 页码变化
const handleCurrentChange = (val) => {
  pagination.page = val
  fetchImageList()
}

// 查看详情
const handleViewDetail = (row) => {
  router.push(`/image/detail/${row.id}`)
}

// 创建虚拟机
const handleCreateVM = (row) => {
  router.push({
    path: '/vm/create',
    query: {
      image_id: row.id,
      image_name: row.display_name
    }
  })
}

// 删除镜像
const handleDeleteImage = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除镜像"${row.display_name}"吗？此操作不可恢复！`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteImage(row.id)
    ElMessage.success('删除成功')
    fetchImageList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除镜像失败:', error)
      ElMessage.error('删除镜像失败')
    }
  }
}

// 打开新增镜像对话框
const handleCreateImage = () => {
  // 重置表单
  Object.keys(form).forEach((key) => {
    form[key] =
      key === 'architecture'
        ? 'x86_64'
        : key === 'default_user'
          ? 'root'
          : key === 'public'
            ? false
            : ''
  })

  dialogVisible.value = true
}

// 提交表单
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      submitLoading.value = true

      await createImage(form)

      ElMessage.success('新增镜像成功')
      dialogVisible.value = false
      fetchImageList()
    } catch (error) {
      console.error('新增镜像失败:', error)
      ElMessage.error('新增镜像失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const data = await getCurrentUser()
    userRole.value = data.user?.role || 'normal'
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 挂载时获取数据
onMounted(() => {
  fetchUserInfo()
  fetchImageList()
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

.column-header {
  display: flex;
  align-items: center;
  gap: 4px;
}

.sort-button {
  padding: 0;
  height: auto;
}
</style>
