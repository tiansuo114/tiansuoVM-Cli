<template>
  <div class="app-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>镜像详情</span>
          <div>
            <el-button @click="$router.push('/image/list')"
              >返回列表</el-button
            >
            <el-button
              type="success"
              @click="handleCreateVM"
              :disabled="image.status !== 'available'"
            >
              使用此镜像创建虚拟机
            </el-button>
            <el-button
              v-if="isAdmin && image.status === 'available'"
              type="primary"
              @click="handleEditImage"
            >
              编辑
            </el-button>
            <el-button
              v-if="isAdmin"
              type="danger"
              @click="handleDeleteImage"
              :disabled="image.status !== 'available'"
            >
              删除
            </el-button>
          </div>
        </div>
      </template>

      <!-- 基本信息 -->
      <div v-if="image.id">
        <div class="section-title">基本信息</div>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="显示名称">{{
            image.display_name
          }}</el-descriptions-item>
          <el-descriptions-item label="镜像名称">{{
            image.name
          }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag
              :type="
                image.status === 'available'
                  ? 'success'
                  : 'danger'
              "
            >
              {{
                image.status === 'available' ? '可用' : '不可用'
              }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作系统"
            >{{ image.os_type }}
            {{ image.os_version }}</el-descriptions-item
          >
          <el-descriptions-item label="架构">{{
            image.architecture
          }}</el-descriptions-item>
          <el-descriptions-item label="公共镜像">
            <el-tag :type="image.public ? 'success' : 'info'">
              {{ image.public ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="默认用户">{{
            image.default_user
          }}</el-descriptions-item>
          <el-descriptions-item label="创建者">{{
            image.creator
          }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{
            formatTime(image.created_at)
          }}</el-descriptions-item>
          <el-descriptions-item label="更新者">{{
            image.updater
          }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{
            formatTime(image.updated_at)
          }}</el-descriptions-item>
        </el-descriptions>

        <div class="section-title">镜像信息</div>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="镜像URL">
            <el-link
              :href="image.image_url"
              type="primary"
              target="_blank"
              >{{ image.image_url }}</el-link
            >
          </el-descriptions-item>
          <el-descriptions-item label="描述">{{
            image.description || '暂无描述'
          }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <el-empty v-else description="未找到镜像信息" />
    </el-card>

    <!-- 编辑镜像对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑镜像"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="显示名称" prop="display_name">
          <el-input
            v-model="form.display_name"
            placeholder="请输入显示名称"
          />
        </el-form-item>
        <el-form-item label="公共镜像" prop="public">
          <el-switch v-model="form.public" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="form.status"
            placeholder="请选择状态"
            style="width: 100%"
          >
            <el-option label="可用" value="available" />
            <el-option label="不可用" value="unavailable" />
          </el-select>
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
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getImage, updateImage, deleteImage } from '@/api/image'
import { getCurrentUser } from '@/api/user'

// 路由实例
const route = useRoute()
const router = useRouter()

// 镜像ID
const imageId = route.params.id

// 状态标识
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)

// 用户信息
const userRole = ref('normal')
const isAdmin = computed(() => userRole.value === 'admin')

// 镜像信息
const image = ref({})

// 表单引用
const formRef = ref(null)

// 编辑表单数据
const form = reactive({
  display_name: '',
  public: false,
  status: 'available',
  description: ''
})

// 表单验证规则
const rules = {
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
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
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

// 获取镜像详情
const fetchImageDetail = async () => {
  try {
    loading.value = true
    const data = await getImage(imageId)
    image.value = data
  } catch (error) {
    console.error('获取镜像详情失败:', error)
    ElMessage.error('获取镜像详情失败')
  } finally {
    loading.value = false
  }
}

// 使用此镜像创建虚拟机
const handleCreateVM = () => {
  router.push({
    path: '/vm/create',
    query: {
      image_id: image.value.id,
      image_name: image.value.display_name
    }
  })
}

// 打开编辑对话框
const handleEditImage = () => {
  form.display_name = image.value.display_name
  form.public = image.value.public
  form.status = image.value.status
  form.description = image.value.description

  dialogVisible.value = true
}

// 提交编辑表单
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      submitLoading.value = true

      await updateImage(imageId, form)

      ElMessage.success('编辑镜像成功')
      dialogVisible.value = false
      fetchImageDetail()
    } catch (error) {
      console.error('编辑镜像失败:', error)
      ElMessage.error('编辑镜像失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 删除镜像
const handleDeleteImage = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除镜像"${image.value.display_name}"吗？此操作不可恢复！`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteImage(imageId)
    ElMessage.success('删除成功')
    router.push('/image/list')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除镜像失败:', error)
      ElMessage.error('删除镜像失败')
    }
  }
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
  fetchImageDetail()
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
