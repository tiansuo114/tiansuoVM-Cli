<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>创建虚拟机</span>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="right"
        label-width="120px"
      >
        <!-- 基本信息 -->
        <div class="section-title">基本信息</div>
        <el-form-item label="虚拟机名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入虚拟机名称"
          />
        </el-form-item>

        <!-- 配置信息 -->
        <div class="section-title">配置信息</div>
        <el-form-item label="CPU(核)" prop="cpu">
          <el-input-number
            v-model="form.cpu"
            :min="1"
            :max="32"
            :precision="0"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="内存(MB)" prop="memory">
          <el-input-number
            v-model="form.memory"
            :min="512"
            :max="65536"
            :step="512"
            :precision="0"
            controls-position="right"
          />
          <span class="tip-text">可用范围: 512MB ~ 64GB</span>
        </el-form-item>

        <el-form-item label="磁盘(GB)" prop="disk">
          <el-input-number
            v-model="form.disk"
            :min="10"
            :max="1000"
            :precision="0"
            controls-position="right"
          />
          <span class="tip-text">可用范围: 10GB ~ 1000GB</span>
        </el-form-item>

        <!-- 镜像信息 -->
        <div class="section-title">镜像信息</div>
        <el-form-item label="操作系统镜像" prop="image_id">
          <el-select
            v-model="form.image_id"
            placeholder="请选择操作系统镜像"
            filterable
            style="width: 100%"
            :loading="imageLoading"
          >
            <el-option
              v-for="item in imageOptions"
              :key="item.id"
              :label="item.display_name"
              :value="item.id.toString()"
            >
              <div class="image-option">
                <span>{{ item.display_name }}</span>
                <span class="image-desc"
                  >{{ item.os_type }} {{ item.os_version }} ({{
                    item.architecture
                  }})</span
                >
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- SSH密钥 -->
        <div class="section-title">SSH密钥</div>
        <el-form-item label="SSH公钥" prop="ssh_key">
          <el-input
            v-model="form.ssh_key"
            type="textarea"
            :rows="4"
            placeholder="请输入SSH公钥，留空则使用系统默认密码"
          />
          <div class="tip-text">
            提示:
            不填写SSH公钥将使用系统默认密码，可在创建成功后查看
          </div>
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            @click="handleSubmit"
            :loading="loading"
            >创建</el-button
          >
          <el-button @click="$router.push('/vm/list')"
            >取消</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createVM } from '@/api/vm'
import { getImageList } from '@/api/image'

// 路由实例
const router = useRouter()
const route = useRoute()

// 表单引用
const formRef = ref(null)

// 加载状态
const loading = ref(false)
const imageLoading = ref(false)

// 镜像选项
const imageOptions = ref([])

// 表单数据
const form = reactive({
  name: '',
  cpu: 1,
  memory: 1024,
  disk: 20,
  image_id: '',
  ssh_key: ''
})

// 表单验证规则
const rules = {
  name: [
    {
      required: true,
      message: '请输入虚拟机名称',
      trigger: 'blur'
    },
    {
      max: 64,
      message: '名称长度不能超过64个字符',
      trigger: 'blur'
    }
  ],
  cpu: [
    {
      required: true,
      message: '请设置CPU核心数',
      trigger: 'blur'
    },
    {
      type: 'number',
      min: 1,
      max: 32,
      message: 'CPU核心数必须在1-32之间',
      trigger: 'blur'
    }
  ],
  memory: [
    {
      required: true,
      message: '请设置内存大小',
      trigger: 'blur'
    },
    {
      type: 'number',
      min: 512,
      max: 65536,
      message: '内存大小必须在512MB-64GB之间',
      trigger: 'blur'
    }
  ],
  disk: [
    {
      required: true,
      message: '请设置磁盘大小',
      trigger: 'blur'
    },
    {
      type: 'number',
      min: 10,
      max: 1000,
      message: '磁盘大小必须在10GB-1000GB之间',
      trigger: 'blur'
    }
  ],
  image_id: [
    {
      required: true,
      message: '请选择操作系统镜像',
      trigger: 'change'
    }
  ]
}

// 获取镜像列表
const fetchImageList = async () => {
  try {
    imageLoading.value = true

    const params = {
      public: true,
      limit: 100
    }

    const res = await getImageList(params)

    // 过滤掉不可用的镜像
    imageOptions.value = (res.items || []).filter(
      (image) => image.status === 'available'
    )
  } catch (error) {
    console.error('获取镜像列表失败:', error)
    ElMessage.error('获取镜像列表失败')
  } finally {
    imageLoading.value = false
  }
}

// 处理URL参数传递的镜像信息
const handleUrlParams = () => {
  const { image_id, image_name } = route.query

  if (image_id) {
    form.image_id = image_id.toString()
  }

  // 如果URL中没有镜像参数，那么正常获取镜像列表
  if (!image_id) {
    fetchImageList()
  }
}

// 提交表单
const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      loading.value = true

      await createVM(form)

      ElMessage.success('虚拟机创建成功')

      // 跳转到虚拟机列表页
      router.push('/vm/list')
    } catch (error) {
      console.error('创建虚拟机失败:', error)
      ElMessage.error('创建虚拟机失败')
    } finally {
      loading.value = false
    }
  })
}

// 更新onMounted钩子
onMounted(() => {
  handleUrlParams()
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

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin: 20px 0 10px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.tip-text {
  font-size: 12px;
  color: #909399;
  margin-left: 10px;
}

.image-option {
  display: flex;
  flex-direction: column;
}

.image-desc {
  font-size: 12px;
  color: #909399;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-select) {
  width: 100%;
}
</style>
