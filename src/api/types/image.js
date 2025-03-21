/**
 * 镜像状态枚举
 * @readonly
 * @enum {string}
 */
export const ImageStatus = {
  AVAILABLE: 'available', // 可用
  UNAVAILABLE: 'unavailable' // 不可用
}

/**
 * @typedef {Object} ImageInfo - 镜像信息
 * @property {number} id - 镜像ID
 * @property {string} name - 镜像名称
 * @property {string} display_name - 显示名称
 * @property {string} os_type - 操作系统类型
 * @property {string} os_version - 操作系统版本
 * @property {string} architecture - 架构
 * @property {string} image_url - 镜像URL
 * @property {boolean} public - 是否公开
 * @property {string} default_user - 默认用户
 * @property {string} description - 描述
 * @property {string} status - 状态
 * @property {number} created_at - 创建时间
 * @property {string} creator - 创建者
 * @property {number} updated_at - 更新时间
 * @property {string} updater - 更新者
 */

/**
 * @typedef {Object} CreateImageRequest - 创建镜像请求
 * @property {string} name - 镜像名称
 * @property {string} display_name - 显示名称
 * @property {string} os_type - 操作系统类型
 * @property {string} os_version - 操作系统版本
 * @property {string} architecture - 架构
 * @property {string} image_url - 镜像URL
 * @property {boolean} public - 是否公开
 * @property {string} default_user - 默认用户
 * @property {string} [description] - 描述
 */

/**
 * @typedef {Object} UpdateImageRequest - 更新镜像请求
 * @property {string} [display_name] - 显示名称
 * @property {string} [description] - 描述
 * @property {string} [status] - 状态
 * @property {boolean} [public] - 是否公开
 */

/**
 * @typedef {Object} ImageListResponse - 镜像列表响应
 * @property {number} total - 总数
 * @property {Array<ImageInfo>} images - 镜像信息数组
 */
