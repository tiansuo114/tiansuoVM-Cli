<template>
  <div class="app-container">
    <el-card class="profile-card">
      <div class="profile-header">
        <!-- 头像部分 -->
        <div class="avatar-container">
          <el-avatar :size="100" :src="userAvatar">
            {{
              userInfo.username
                ? userInfo.username.substring(0, 1).toUpperCase()
                : 'U'
            }}
          </el-avatar>
        </div>
      </div>

      <!-- 个人信息表单 -->
      <el-form
        ref="formRef"
        :model="userInfo"
        :rules="rules"
        label-width="100px"
        class="profile-form"
      >
        <el-form-item label="UID" prop="uid">
          <el-input v-model="userInfo.uid" disabled />
        </el-form-item>

        <el-form-item label="姓名" prop="username">
          <el-input v-model="userInfo.username" />
        </el-form-item>

        <el-form-item label="电话" prop="tel">
          <el-input
            v-model="userInfo.tel"
            placeholder="请输入电话号码"
          />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="userInfo.email"
            placeholder="请输入邮箱"
          />
        </el-form-item>

        <el-form-item label="描述" prop="desc">
          <el-input
            v-model="userInfo.desc"
            type="textarea"
            :rows="3"
            placeholder="请输入个人描述"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            @click="handleSubmit"
            :loading="loading"
          >
            保存修改
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserInfo, updateUserInfo } from '@/api/user'

// 状态
const loading = ref(false)
const userAvatar = ref('')

// 表单引用
const formRef = ref(null)

// 用户信息
const userInfo = reactive({
  uid: '',
  username: '',
  tel: '',
  email: '',
  desc: ''
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    {
      min: 2,
      max: 20,
      message: '长度在 2 到 20 个字符',
      trigger: 'blur'
    }
  ],
  tel: [
    {
      required: true,
      message: '请输入电话号码',
      trigger: 'blur'
    },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号码',
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    {
      type: 'email',
      message: '请输入正确的邮箱地址',
      trigger: 'blur'
    }
  ],
  desc: [
    {
      max: 200,
      message: '描述不能超过200个字符',
      trigger: 'blur'
    }
  ]
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    loading.value = true
    const data = await getUserInfo()

    // 填充表单数据
    Object.assign(userInfo, {
      uid: data.uid || '',
      username: data.username || '',
      tel: data.tel || '',
      email: data.email || '',
      desc: data.desc || ''
    })

    userAvatar.value = data.avatar || ''
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  } finally {
    loading.value = false
  }
}

// 提交表单
const handleSubmit = () => {
  formRef.value?.validate(async (valid) => {
    if (!valid) return

    try {
      loading.value = true
      await updateUserInfo(userInfo)
      ElMessage.success('保存成功')
    } catch (error) {
      console.error('更新用户信息失败:', error)
      ElMessage.error('更新失败')
    } finally {
      loading.value = false
    }
  })
}

// 头像上传前的验证
const beforeAvatarUpload = (file) => {
  const isJPG =
    file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('头像只能是 JPG 或 PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
  }
  return isJPG && isLt2M
}

// 头像上传成功的回调
const handleAvatarSuccess = (res) => {
  if (res.code === 200) {
    userAvatar.value = res.data.url
    ElMessage.success('头像更新成功')
  } else {
    ElMessage.error('头像更新失败')
  }
}

// 页面加载时获取用户信息
onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.profile-card {
  max-width: 800px;
  margin: 0 auto;
}

.profile-header {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.profile-form {
  max-width: 500px;
  margin: 0 auto;
}

.avatar-uploader {
  margin-top: 10px;
}

:deep(.el-form-item__label) {
  font-weight: bold;
}
</style>
