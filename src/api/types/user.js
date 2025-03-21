/**
 * 用户角色枚举
 * @readonly
 * @enum {string}
 */
export const UserRole = {
  NORMAL: 'normal', // 普通用户
  ADMIN: 'admin' // 管理员
}

/**
 * 用户状态枚举
 * @readonly
 * @enum {string}
 */
export const UserStatus = {
  Enabled: 'enabled', // 激活状态
  INACTIVE: 'inactive', // 未激活
  DISABLED: 'disabled' // 已禁用
}

/**
 * @typedef {Object} UserInfo - 用户信息对象
 * @property {number} id - 用户ID
 * @property {string} uid - 用户唯一标识符
 * @property {string} username - 用户名
 * @property {string} role - 用户角色
 * @property {boolean} primary - 是否主用户
 * @property {string} tel - 电话号码
 * @property {string} email - 邮箱
 * @property {string} desc - 描述
 * @property {string} status - 用户状态
 * @property {string} [gidNumber] - 组ID
 * @property {number} createdAt - 创建时间
 * @property {string} creator - 创建者
 * @property {number} updatedAt - 更新时间
 * @property {string} updater - 更新者
 */

/**
 * @typedef {Object} LoginRequest - 登录请求
 * @property {string} user_uid - 用户名
 * @property {string} password - 密码
 */

/**
 * @typedef {Object} LoginResponse - 登录响应
 * @property {string} token - 认证令牌
 * @property {string} username - 用户名
 */

/**
 * @typedef {Object} UpdateUserRequest - 更新用户信息请求
 * @property {string} [tel] - 电话号码
 * @property {string} [email] - 邮箱
 * @property {string} [desc] - 描述
 */
