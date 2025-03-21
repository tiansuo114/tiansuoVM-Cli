import request from '../request'

/**
 * 获取虚拟机列表
 * @param {Object} params - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.limit=10] - 每页数量
 * @returns {Promise<Object>} - 虚拟机列表和总数
 */
export function getVMList(params) {
  return request({
    url: '/api/v1/vms',
    method: 'get',
    params
  })
}

/**
 * 创建虚拟机
 * @param {Object} data - 虚拟机信息
 * @param {string} data.name - 虚拟机名称
 * @param {number} data.cpu - CPU核心数
 * @param {number} data.memory - 内存大小(MB)
 * @param {number} data.disk - 磁盘大小(GB)
 * @param {string} data.image_id - 镜像ID
 * @param {string} [data.ssh_key] - SSH公钥
 * @returns {Promise<Object>} - 创建的虚拟机信息
 */
export function createVM(data) {
  return request({
    url: '/api/v1/vms',
    method: 'post',
    data
  })
}

/**
 * 获取虚拟机详情
 * @param {number} id - 虚拟机ID
 * @returns {Promise<Object>} - 虚拟机详情
 */
export function getVM(id) {
  return request({
    url: `/api/v1/vms/${id}`,
    method: 'get'
  })
}

/**
 * 删除虚拟机
 * @param {number} id - 虚拟机ID
 * @returns {Promise<void>}
 */
export function deleteVM(id) {
  return request({
    url: `/api/v1/vms/${id}`,
    method: 'delete'
  })
}

/**
 * 恢复已删除的虚拟机
 * @param {number} id - 虚拟机ID
 * @returns {Promise<void>}
 */
export function recoverVM(id) {
  return request({
    url: `/api/v1/vms/${id}/recover`,
    method: 'post'
  })
}

/**
 * 启动虚拟机
 * @param {number} id - 虚拟机ID
 * @returns {Promise<void>}
 */
export function startVM(id) {
  return request({
    url: `/api/v1/vms/${id}/start`,
    method: 'post'
  })
}

/**
 * 停止虚拟机
 * @param {number} id - 虚拟机ID
 * @returns {Promise<void>}
 */
export function stopVM(id) {
  return request({
    url: `/api/v1/vms/${id}/stop`,
    method: 'post'
  })
}

/**
 * 重启虚拟机
 * @param {number} id - 虚拟机ID
 * @returns {Promise<void>}
 */
export function restartVM(id) {
  return request({
    url: `/api/v1/vms/${id}/restart`,
    method: 'post'
  })
}

/**
 * 管理员创建虚拟机
 * @param {Object} data - 虚拟机信息
 * @param {string} data.name - 虚拟机名称
 * @param {number} data.cpu - CPU核心数
 * @param {number} data.memory - 内存大小(MB)
 * @param {number} data.disk - 磁盘大小(GB)
 * @param {string} data.image_id - 镜像ID
 * @param {string} data.owner_username - 所有者用户名
 * @returns {Promise<Object>} - 创建的虚拟机信息
 */
export function adminCreateVM(data) {
  return request({
    url: '/api/v1/admin/vms',
    method: 'post',
    data
  })
}

/**
 * 获取vm连接信息
 * @param {number} id - vmID
 * @returns {Promise<Object>}
 */
export function getVMDefaultCredentials(id) {
  return request({
    url: `/api/v1/vms/${id}/link`,
    method: 'get'
  })
}
