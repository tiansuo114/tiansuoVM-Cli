<template>
  <div class="login-container">
    <div class="login-card">
      <div class="title">虚拟机管理系统</div>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-position="top"
      >
        <el-form-item prop="user_uid" label="用户名">
          <el-input
            v-model="loginForm.user_uid"
            placeholder="请输入用户名"
            prefix-icon="User"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item prop="password" label="密码">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <!-- 暂时注释验证码，因为接口中未使用
        <el-form-item prop="captcha" label="验证码">
          <div class="captcha-container">
            <el-input
              v-model="loginForm.captchaValue"
              placeholder="请输入验证码"
              @keyup.enter="handleLogin"
            />
            <div class="captcha-img" @click="refreshCaptcha">
              <img :src="captchaUrl" alt="验证码" v-if="captchaUrl" />
              <div class="loading" v-else>
                <el-icon class="is-loading"><Loading /></el-icon>
              </div>
            </div>
          </div>
        </el-form-item>
        -->

        <el-form-item>
          <el-button
            :loading="loading"
            type="primary"
            class="login-button"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '@/api/user'

// 路由实例
const router = useRouter()

// 表单引用
const loginFormRef = ref(null)

// 登录状态
const loading = ref(false)

// 验证码
// 下面的代码已注释，但保留以备将来可能启用验证码功能
/*
const captchaUrl = ref('')
const captchaId = ref('')

// 获取验证码
const fetchCaptcha = async () => {
  try {
    const res = await getCaptcha()
    captchaId.value = res.captcha_id
    captchaUrl.value = 'data:image/png;base64,' + res.image_base64
    loginForm.captchaId = res.captcha_id
  } catch (error) {
    console.error('获取验证码失败:', error)
  }
}

// 刷新验证码
const refreshCaptcha = () => {
  captchaUrl.value = ''
  fetchCaptcha()
}
*/

// 登录表单数据
const loginForm = reactive({
  user_uid: '',
  password: '',
  captchaId: '',
  captchaValue: ''
})

// 登录表单验证规则
const loginRules = {
  user_uid: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  captchaValue: [
    { required: false, message: '请输入验证码', trigger: 'blur' }
  ]
}

// 处理登录
const handleLogin = () => {
  loginFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      loading.value = true

      const res = await login(loginForm)

      // 保存token
      localStorage.setItem('token', res.token)

      ElMessage.success('登录成功')

      // 跳转到首页
      router.push('/')
    } catch (error) {
      console.error('登录失败:', error)
      // 刷新验证码
      // refreshCaptcha()
    } finally {
      loading.value = false
    }
  })
}

// 组件挂载时获取验证码
// onMounted(() => {
//   // 暂时注释，因为当前接口未使用验证码
//   // fetchCaptcha()
// })
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  background-image: linear-gradient(
    120deg,
    #a1c4fd 0%,
    #c2e9fb 100%
  );
  background-size: cover;
  background-position: center;
}

.login-card {
  width: 400px;
  padding: 35px 35px 15px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  text-align: center;
  margin-bottom: 30px;
}

.login-button {
  width: 100%;
}

.captcha-container {
  display: flex;
  align-items: center;
}

.captcha-img {
  margin-left: 10px;
  cursor: pointer;
  height: 40px;
  width: 100px;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.captcha-img img {
  height: 100%;
  width: 100%;
  object-fit: contain;
}

.loading {
  font-size: 24px;
  color: #909399;
}
</style>
