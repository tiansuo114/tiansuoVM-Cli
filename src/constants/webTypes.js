// src/constants/wsTypes.js

// 控制通道消息类型
export const CTRL_MSG_TYPES = {
  OPEN_TERMINAL_REQ: 100,
  OPEN_TERMINAL_OK: 101,
  OPEN_TERMINAL_ERR: 102,
  CHILD_EXIT_NORMALLY: 120,
  CHILD_EXIT_WITH_ERROR: 121,
  GENERAL_ERROR: 130
}

// WebSocket基础URL
export const WS_BASE_URL =
  'ws://import.meta.env.VITE_API_BASE_URL/api'
