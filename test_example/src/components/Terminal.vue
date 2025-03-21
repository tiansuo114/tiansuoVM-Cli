<template>
  <div>
    <el-tabs v-model="activeName" style="margin-left: 1vh; margin-right: 1vh" @tab-click="handleClick">
      <el-tab-pane name="first" label="SSH">
        <div style="text-align: center">
          <el-form ref="formRef" :model="form" status-icon :rules="rules" label-position="left" label-width="80px" style="margin-left: 50vh; width: 50vh">
            <el-form-item label="Ip" prop="ip">
              <el-input v-model="form.ip" />
            </el-form-item>
            <el-form-item label="Port" prop="port">
              <el-input v-model="form.port" />
            </el-form-item>
            <el-form-item label="User" prop="user">
              <el-input v-model="form.user" />
            </el-form-item>
            <el-form-item label="Password" prop="pwd">
              <el-input v-model="form.pwd" type="password" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitForm">连接</el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      <el-tab-pane name="second" label="Terminal">
        <div ref="terminalRef" class="ssh-container" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import { debounce } from 'lodash'

const formRef = ref(null)
const terminalRef = ref(null)
const activeName = ref('first')
const initText = '连接中...\r\n'
const term = ref(null)
const fitAddon = ref(null)
const ws = ref(null)
const socketUrl = 'ws://' + window.location.host + '/ws/ssh'

const form = ref({
  user: '',
  pwd: '',
  ip: '',
  port: ''
})

const option = {
  lineHeight: 1.0,
  cursorBlink: true,
  cursorStyle: 'block',
  fontSize: 14,
  fontFamily: "Monaco, Menlo, Consolas, 'Courier New', monospace",
  theme: {
    background: '#ffffff',
    foreground: '#000000',
    cursor: '#000000',
    selection: '#0000ff',
    selectionForeground: '#0000ff'
  },
  cols: 30
}

const rules = {
  ip: [{ required: true, message: '不能为空', trigger: 'blur' }],
  port: [{ required: true, message: '不能为空', trigger: 'blur' }],
  user: [{ required: true, message: '不能为空', trigger: 'blur' }],
  pwd: [{ required: true, message: '不能为空', trigger: 'blur' }]
}

const utf8_to_b64 = (rawString) => {
  return btoa(unescape(encodeURIComponent(rawString)))
}

const b64_to_utf8 = (encodeString) => {
  return decodeURIComponent(escape(atob(encodeString)))
}

const isWsOpen = () => {
  return ws.value && ws.value.readyState === 1
}

const initTerm = () => {
  term.value = new Terminal(option)
  fitAddon.value = new FitAddon()
  term.value.loadAddon(fitAddon.value)
  term.value.open(terminalRef.value)
  setTimeout(() => {
    fitAddon.value.fit()
  }, 500)
}

const onTerminalKeyPress = () => {
  term.value.onData(data => {
    isWsOpen() && ws.value.send(JSON.stringify({
      type: 'stdin',
      data: utf8_to_b64(data)
    }))
  })
}

const resizeRemoteTerminal = () => {
  const { cols, rows } = term.value
  console.log('列数、行数设置为：', cols, rows)
  isWsOpen() && ws.value.send(JSON.stringify({
    type: 'resize',
    data: JSON.stringify({ cols, rows })
  }))
}

const onResize = debounce(() => {
  fitAddon.value.fit()
}, 500)

const onTerminalResize = () => {
  window.addEventListener('resize', onResize)
  term.value.onResize(resizeRemoteTerminal)
}

const removeResizeListener = () => {
  window.removeEventListener('resize', onResize)
}

const initSocket = () => {
  term.value.write(initText)
  console.log('正在连接到WebSocket服务器:', socketUrl)
  ws.value = new WebSocket(socketUrl)
  onOpenSocket()
  onCloseSocket()
  onErrorSocket()
  term.value._initialized = true
  onMessageSocket()
}

const onOpenSocket = () => {
  ws.value.onopen = () => {
    console.log('WebSocket连接已建立')
    const addr = form.value.ip + ':' + form.value.port
    console.log('发送连接信息:', {
      addr: addr,
      user: form.value.user
    })
    ws.value.send(JSON.stringify({ 
      type: 'addr', 
      data: utf8_to_b64(addr)
    }))
    ws.value.send(JSON.stringify({ 
      type: 'login', 
      data: utf8_to_b64(form.value.user)
    }))
    ws.value.send(JSON.stringify({ 
      type: 'password', 
      data: utf8_to_b64(form.value.pwd)
    }))
    term.value.reset()
    setTimeout(() => {
      resizeRemoteTerminal()
    }, 500)
  }
}

const onCloseSocket = () => {
  ws.value.onclose = (event) => {
    console.log('WebSocket连接已关闭:', event)
    term.value.write('连接已关闭，请刷新页面重试...\r\n')
  }
}

const onErrorSocket = () => {
  ws.value.onerror = (error) => {
    console.error('WebSocket错误:', error)
    term.value.write('连接错误，请检查网络或服务器状态...\r\n')
  }
}

const onMessageSocket = () => {
  ws.value.onmessage = (event) => {
    console.log('收到WebSocket消息:', event.data)
    const data = JSON.parse(event.data)
    switch (data.type) {
      case 'stdout':
        term.value.write(b64_to_utf8(data.data))
        break
      case 'stderr':
        term.value.write(b64_to_utf8(data.data))
        break
      default:
        console.log('收到未知类型消息:', data)
    }
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    activeName.value = 'second'
    initWs()
  } catch (error) {
    console.log('error submit!!')
    return false
  }
}

const resetForm = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
}

const handleClick = (tab) => {
  if (tab.name === 'second') {
    // init()
  }
}

const initWs = () => {
  initTerm()
  initSocket()
  onTerminalResize()
  onTerminalKeyPress()
}

onMounted(() => {
  // 组件挂载时的初始化逻辑
})

onBeforeUnmount(() => {
  removeResizeListener()
  term.value && term.value.dispose()
  ws.value && ws.value.send(JSON.stringify({
    type: 'stdin',
    data: utf8_to_b64('exit')
  }))
})
</script>

<style scoped>
.ssh-container {
  width: 100%;
  height: 600px;
  background: #ffffff;
  padding: 10px;
  box-sizing: border-box;
}
</style> 