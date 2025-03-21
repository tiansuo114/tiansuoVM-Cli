import request from '@/utils/request'

/**
 * 用户登录
 * @param {Object} data - 登录信息
 * @param {string} data.user_uid - 用户名
 * @param {string} data.password - 密码
 * @returns {Promise<Object>} - 登录结果，包含token和用户名
 */
export function login(data) {
  return request({
    url: '/api/v1/auth/login',
    method: 'post',
    data
  })
}

/**
 * 获取验证码
 * @returns {Promise<Object>} - 验证码信息，包含captchaId和imageBase64
 */
export function getCaptcha() {
  return request({
    url: '/api/v1/auth/captcha',
    method: 'get'
  })
}

/**
 * 用户登出
 * @returns {Promise<void>}
 */
export function logout() {
  return request({
    url: '/api/v1/user/logout',
    method: 'post'
  })
}

/**
 * 获取当前用户信息
 * @returns {Promise<Object>} - 当前用户信息
 */
export function getCurrentUser() {
  return request({
    url: '/api/v1/user/me',
    method: 'get'
  })
}

/**
 * 更新当前用户信息
 * @param {Object} data - 更新的用户信息
 * @param {string} [data.tel] - 电话
 * @param {string} [data.email] - 邮箱
 * @param {string} [data.desc] - 描述
 * @returns {Promise<void>}
 */
export function updateCurrentUser(data) {
  return request({
    url: '/api/v1/user/me',
    method: 'put',
    data
  })
}

/**
 * 注册用户
 * @param {Object} data - 用户注册信息
 * @param {string} data.user_uid - 用户名
 * @param {string} data.password - 密码
 * @param {string} data.email - 邮箱
 * @returns {Promise<void>}
 */
export function register(data) {
  return request({
    url: '/api/v1/user/register',
    method: 'post',
    data
  })
}

/**
 * 获取用户信息
 * @returns {Promise<Object>} - 用户信息
 */
export function getUserInfo() {
  return request({
    url: '/api/v1/user/me',
    method: 'get'
  })
}

/**
 * 更新用户信息
 * @param {Object} data - 更新的用户信息
 * @param {string} [data.tel] - 电话
 * @param {string} [data.email] - 邮箱
 * @param {string} [data.desc] - 描述
 * @returns {Promise<void>}
 */
export function updateUserInfo(data) {
  return request({
    url: '/api/v1/user/me',
    method: 'put',
    data
  })
}

/**
 * 修改密码
 * @param {Object} data - 修改密码信息
 * @param {string} data.old_password - 旧密码
 * @param {string} data.new_password - 新密码
 * @returns {Promise<void>}
 */
export function changePassword(data) {
  return request({
    url: '/api/v1/user/password',
    method: 'put',
    data
  })
}

/**
 * 更新安全设置
 * @param {Object} data - 安全设置信息
 * @param {boolean} data.two_factor_auth - 是否启用两步验证
 * @param {string} data.two_factor_secret - 两步验证密钥
 * @returns {Promise<void>}
 */
export function updateSecuritySettings(data) {
  return request({
    url: '/api/v1/user/security',
    method: 'put',
    data
  })
}

/**
 * 获取虚拟机统计数据
 * @returns {Promise<Object>} - 虚拟机统计数据
 */
export function getVMStats() {
  return request({
    url: '/api/v1/user/vm/stats',
    method: 'get'
  })
}

/**
 * 获取最近使用的虚拟机
 * @param {Object} params - 查询参数
 * @param {number} [params.limit] - 限制返回的虚拟机数量
 * @returns {Promise<Object>} - 最近使用的虚拟机列表
 */
export function getRecentVMs(params) {
  return request({
    url: '/api/v1/user/vm/recent',
    method: 'get',
    params
  })
}
