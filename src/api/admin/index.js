import request from '../request'
/**
 * 获取用户列表
 * @param {Object} params - 查询参数
 * @param {number} [params.page] - 页码
 * @param {number} [params.limit] - 每页数量
 * @param {string} [params.username] - 用户名
 * @param {string} [params.role] - 角色
 * @param {string} [params.status] - 状态
 * @returns {Promise<Object>} - 用户列表和总数
 */
export function getUserList(params) {
  return request({
    url: '/api/v1/admin/users',
    method: 'get',
    params
  })
}

/**
 * 创建用户
 * @param {Object} data - 用户信息
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @param {string} [data.tel] - 电话
 * @param {string} [data.email] - 邮箱
 * @param {string} [data.desc] - 描述
 * @param {string} data.role - 角色
 * @returns {Promise<Object>} - 创建的用户信息
 */
export function createUser(data) {
  return request({
    url: '/api/v1/admin/users',
    method: 'post',
    data
  })
}

/**
 * 更新用户信息
 * @param {string} username - 用户名
 * @param {Object} data - 更新的用户信息
 * @param {string} [data.tel] - 电话
 * @param {string} [data.email] - 邮箱
 * @param {string} [data.desc] - 描述
 * @returns {Promise<void>}
 */
export function updateUser(username, data) {
  return request({
    url: `/api/v1/admin/users/${username}`,
    method: 'put',
    data
  })
}

/**
 * 更新用户状态
 * @param {string} username - 用户名
 * @param {string} status - 状态
 * @returns {Promise<void>}
 */
export function updateUserStatus(username, status) {
  return request({
    url: `/api/v1/admin/users/${username}/status`,
    method: 'put',
    data: { status }
  })
}

/**
 * 更新用户角色
 * @param {Object} data - 更新信息
 * @param {string} data.uid - 用户uid
 * @param {number} data.role - 角色
 * @returns {Promise<void>}
 */
export function updateUserRole(data) {
  return request({
    url: `/api/v1/admin/users/role`,
    method: 'post',
    data
  })
}

/**
 * 禁用用户
 * @param {string} uid - 用户名
 * @returns {Promise<void>}
 */
export function disableUser(uid) {
  return request({
    url: `/api/v1/admin/users/${uid}/disable`,
    method: 'delete'
  })
}

/**
 * 启用用户
 * @param {string} uid - 用户名
 * @returns {Promise<void>}
 */
export function enableUser(uid) {
  return request({
    url: `/api/v1/admin/users/${uid}/enable`,
    method: 'put'
  })
}

/**
 * 获取审计日志列表
 * @param {Object} params - 查询参数
 * @param {number} [params.page] - 页码
 * @param {number} [params.page_size] - 每页数量
 * @param {string} [params.username] - 用户名
 * @param {string} [params.ip] - IP地址
 * @param {string} [params.operation] - 操作类型
 * @param {number} [params.start_time] - 开始时间
 * @param {number} [params.end_time] - 结束时间
 * @param {Array<number>} [params.status] - 状态列表
 * @returns {Promise<Object>} - 审计日志列表和总数
 */
export function getAuditLogs(params) {
  return request({
    url: '/api/v1/logs/audit',
    method: 'get',
    params
  })
}

/**
 * 获取事件日志列表
 * @param {Object} params - 查询参数
 * @param {number} [params.page] - 页码
 * @param {number} [params.page_size] - 每页数量
 * @param {string} [params.event_type] - 事件类型
 * @param {string} [params.creator] - 创建者
 * @param {number} [params.start_time] - 开始时间
 * @param {number} [params.end_time] - 结束时间
 * @returns {Promise<Object>} - 事件日志列表和总数
 */
export function getEventLogs(params) {
  return request({
    url: '/api/v1/logs/events',
    method: 'get',
    params
  })
}

/**
 * 获取单个事件日志详情
 * @param {number} id - 事件日志ID
 * @returns {Promise<Object>} - 事件日志详情
 */
export function getEventLog(id) {
  return request({
    url: `/api/v1/logs/events/${id}`,
    method: 'get'
  })
}

/**
 * 获取用户操作日志列表
 * @param {Object} params - 查询参数
 * @param {number} [params.page] - 页码
 * @param {number} [params.page_size] - 每页数量
 * @param {string} [params.uid] - 用户ID
 * @param {number} [params.start_time] - 开始时间
 * @param {number} [params.end_time] - 结束时间
 * @returns {Promise<Object>} - 用户操作日志列表和总数
 */
export function getUserOperationLogs(params) {
  return request({
    url: '/api/v1/logs/user-operations',
    method: 'get',
    params
  })
}

/**
 * 获取指定用户的操作日志
 * @param {string} uid - 用户ID
 * @returns {Promise<Object>} - 用户操作日志列表
 */
export function getUserOperationLogsByUid(uid) {
  return request({
    url: `/api/v1/logs/user-operations/user/${uid}`,
    method: 'get'
  })
}
