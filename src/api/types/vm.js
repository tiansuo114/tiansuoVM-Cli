/**
 * 虚拟机状态枚举
 * @readonly
 * @enum {string}
 */
export const VMStatus = {
  CREATING: 'creating', // 创建中
  RUNNING: 'running', // 运行中
  STOPPED: 'stopped', // 已停止
  STARTING: 'starting', // 启动中
  STOPPING: 'stopping', // 停止中
  FAILED: 'failed', // 失败
  DELETED: 'deleted', // 已删除
  MARKEDFORDELETED: 'marked_for_deletion'
}

/**
 * @typedef {Object} VMInfo - 虚拟机信息
 * @property {number} id - 虚拟机ID
 * @property {string} name - 虚拟机名称
 * @property {string} uid - 虚拟机唯一标识符
 * @property {string} user_uid - 所有者唯一标识符
 * @property {string} user_name - 所有者用户名
 * @property {number} cpu - CPU核心数
 * @property {number} memory_mb - 内存大小(MB)
 * @property {number} disk_gb - 磁盘大小(GB)
 * @property {string} status - 虚拟机状态
 * @property {string} pod_name - Pod名称
 * @property {string} namespace - 命名空间
 * @property {string} node_name - 节点名称
 * @property {string} ip - IP地址
 * @property {number} ssh_port - SSH端口
 * @property {string} image_name - 镜像名称
 * @property {number} image_id - 镜像ID
 * @property {string} [message] - 状态消息
 * @property {number} created_at - 创建时间
 * @property {string} creator - 创建者
 * @property {number} updated_at - 更新时间
 * @property {string} updater - 更新者
 */

/**
 * @typedef {Object} CreateVMRequest - 创建虚拟机请求
 * @property {string} name - 虚拟机名称
 * @property {number} cpu - CPU核心数
 * @property {number} memory - 内存大小(MB)
 * @property {number} disk - 磁盘大小(GB)
 * @property {string} image_id - 镜像ID
 * @property {string} [ssh_key] - SSH公钥
 */

/**
 * @typedef {Object} AdminCreateVMRequest - 管理员创建虚拟机请求
 * @property {string} name - 虚拟机名称
 * @property {number} cpu - CPU核心数
 * @property {number} memory - 内存大小(MB)
 * @property {number} disk - 磁盘大小(GB)
 * @property {string} image_id - 镜像ID
 * @property {string} owner_username - 所有者用户名
 */

/**
 * @typedef {Object} VMListResponse - 虚拟机列表响应
 * @property {number} total - 总数
 * @property {Array<VMInfo>} vms - 虚拟机信息数组
 */
