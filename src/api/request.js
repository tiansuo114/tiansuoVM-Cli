import axios from 'axios'

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data
    // 如果响应成功
    if (res.code === 200) {
      return res.data
    } else {
      // 处理错误
      const errMsg = res.message || '请求失败'
      // 可以在这里添加消息提示
      console.error(errMsg)
      return Promise.reject(new Error(errMsg))
    }
  },
  (error) => {
    // 处理网络错误
    const { response } = error
    let message = '网络错误，请稍后重试'

    if (response) {
      // 登录超时或token无效
      if (response.status === 401) {
        // 清除token并跳转到登录页
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
      message =
        response.data?.message || `请求错误 (${response.status})`
    }

    // 可以在这里添加消息提示
    console.error(message)

    return Promise.reject(error)
  }
)

export default service
