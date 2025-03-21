import { v4 as uuidv4 } from 'uuid'
import {
  CTRL_MSG_TYPES,
  WS_BASE_URL
} from '../constants/wsTypes'

class TerminalService {
  constructor() {
    this.ctrlChannel = null
    this.dataChannel = null
    this.ctrlChannelPromise = null
    this.eventListeners = {}
    this.frontendId = uuidv4()
  }

  // 获取控制通道连接
  getCtrlChannel(hostId, authToken) {
    if (this.ctrlChannelPromise) {
      return this.ctrlChannelPromise
    }

    this.ctrlChannelPromise = new Promise((resolve, reject) => {
      const ws = new WebSocket(
        `${WS_BASE_URL}/bridge/ctrl/${hostId}?auth=${authToken}`
      )

      ws.onopen = () => {
        this.ctrlChannel = ws
        ws.onerror = null
        resolve(ws)
      }

      ws.onerror = (error) => {
        this.ctrlChannelPromise = null
        reject(new Error('无法连接到WebSocket服务器'))
      }

      ws.onclose = () => {
        this.ctrlChannel = null
        this.ctrlChannelPromise = null
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this._handleCtrlMessage(message)
        } catch (error) {
          console.error('解析消息失败', error)
        }
      }
    })

    return this.ctrlChannelPromise
  }

  // 处理控制通道消息
  _handleCtrlMessage(message) {
    const eventName = `message-${message.msg_type}`
    const listeners = this.eventListeners[eventName] || []

    listeners.forEach((callback) => {
      callback(message)
    })
  }

  // 添加事件监听器
  addEventListener(eventName, callback) {
    if (!this.eventListeners[eventName]) {
      this.eventListeners[eventName] = []
    }
    this.eventListeners[eventName].push(callback)
  }

  // 移除事件监听器
  removeEventListener(eventName, callback) {
    if (!this.eventListeners[eventName]) {
      return
    }
    this.eventListeners[eventName] = this.eventListeners[
      eventName
    ].filter((cb) => cb !== callback)
  }

  // 创建数据通道连接
  createDataChannel(hostId, channelId, authToken) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(
        `${WS_BASE_URL}/bridge/data/${hostId}/${channelId}?auth=${authToken}`
      )

      ws.onopen = () => {
        this.dataChannel = ws
        resolve(ws)
      }

      ws.onerror = (error) => {
        reject(new Error('无法连接到数据通道'))
      }

      ws.onclose = () => {
        this.dataChannel = null
      }
    })
  }

  // 打开Web终端
  async openWebTerminal(hostId, authToken, cols, rows) {
    try {
      // 生成唯一通道ID
      const contextId = uuidv4()
      const channelId = uuidv4()

      // 创建数据通道
      await this.createDataChannel(hostId, channelId, authToken)

      // 确保控制通道已连接
      const ctrlWs = await this.getCtrlChannel(hostId, authToken)

      // 发送打开终端请求
      const message = {
        recipient: `Host-${hostId}`,
        context_id: contextId,
        type: CTRL_MSG_TYPES.OPEN_TERMINAL_REQ,
        content: {
          channel_id: channelId,
          cols,
          rows
        }
      }

      ctrlWs.send(JSON.stringify(message))

      return {
        contextId,
        channelId,
        dataChannel: this.dataChannel
      }
    } catch (error) {
      console.error('打开Web终端失败', error)
      throw error
    }
  }

  // 发送终端大小调整
  sendTerminalResize(cols, rows) {
    if (
      !this.dataChannel ||
      this.dataChannel.readyState !== WebSocket.OPEN
    ) {
      return
    }

    // 创建二进制消息，格式与后端匹配
    const buffer = new ArrayBuffer(5)
    const view = new DataView(buffer)
    view.setUint8(0, 0x37)
    view.setUint16(1, rows, false) // BigEndian格式
    view.setUint16(3, cols, false) // BigEndian格式

    this.dataChannel.send(buffer)
  }

  // 关闭连接
  close() {
    if (this.dataChannel) {
      this.dataChannel.close()
    }

    if (this.ctrlChannel) {
      this.ctrlChannel.close()
    }
  }
}

export default new TerminalService()
