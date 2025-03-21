import request from '../request'

/**
 * 获取镜像列表
 * @param {Object} params - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.limit=10] - 每页数量
 * @param {string} [params.type] - 镜像类型
 * @param {boolean} [params.public] - 是否只显示公共镜像
 * @returns {Promise<Object>} - 镜像列表和总数
 */
export function getImageList(params) {
  return request({
    url: '/api/v1/images',
    method: 'get',
    params
  })
}

/**
 * 创建镜像
 * @param {Object} data - 镜像信息
 * @param {string} data.name - 镜像名称
 * @param {string} data.display_name - 显示名称
 * @param {string} data.os_type - 操作系统类型
 * @param {string} data.os_version - 操作系统版本
 * @param {string} data.architecture - 架构
 * @param {string} data.image_url - 镜像URL
 * @param {boolean} data.public - 是否公开
 * @param {string} data.default_user - 默认用户
 * @param {string} [data.description] - 描述
 * @returns {Promise<Object>} - 创建的镜像信息
 */
export function createImage(data) {
  return request({
    url: '/api/v1/images',
    method: 'post',
    data
  })
}

/**
 * 获取镜像详情
 * @param {number} id - 镜像ID
 * @returns {Promise<Object>} - 镜像详情
 */
export function getImage(id) {
  return request({
    url: `/api/v1/images/${id}`,
    method: 'get'
  })
}

/**
 * 更新镜像
 * @param {number} id - 镜像ID
 * @param {Object} data - 更新的镜像信息
 * @param {string} [data.display_name] - 显示名称
 * @param {string} [data.description] - 描述
 * @param {string} [data.status] - 状态
 * @param {boolean} [data.public] - 是否公开
 * @returns {Promise<void>}
 */
export function updateImage(id, data) {
  return request({
    url: `/api/v1/images/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除镜像
 * @param {number} id - 镜像ID
 * @returns {Promise<void>}
 */
export function deleteImage(id) {
  return request({
    url: `/api/v1/images/${id}`,
    method: 'delete'
  })
}
