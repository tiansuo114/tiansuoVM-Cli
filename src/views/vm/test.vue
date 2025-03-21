<template>
  <div id="xterm" class="terminal" />
</template>

<script>
import 'xterm/css/xterm.css'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { Base64 } from 'js-base64'
export default {
  name: 'Shell',
  data() {
    return {
      socket: null,
      term: null,
      hostInfo: {
        ip: '',
        port: '',
        pass: ''
      }
    }
  },
  mounted() {
    // 这里执行获取要ssh连接的服务器信息的逻辑
    this.hostInfo.ip = '192.168.1.1'
    this.hostInfo.port = '22'
    this.hostInfo.pass = '123456'
    this.initTerm()
  },
  beforeDestroy() {
    if (this.socket !== null) {
      this.socket.close()
    }
    if (this.term !== null) {
      this.term.dispose()
    }
  },
  methods: {
    initTerm() {
      const term = new Terminal({
        frontSize: 14,
        lineHeight: 1.2,
        cursorBlink: false,
        cursorStyle: 'block', // 光标样式  null | 'block' | 'underline' | 'bar'
        scrollback: 800, // 回滚
        tabStopWidth: 8, // 制表宽度
        screenKeys: true
      })
      const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)
      term.open(document.getElementById('xterm'))
      fitAddon.fit()
      this.cols = term.term.focus()
      this.term.onData(function (data) {
        g.socket.send(
          JSON.stringify({
            type: 'cmd',
            cmd: Base64.encode(data)
          })
        )
      })
    },
    initSocket() {
      this.socket = new WebSocket(
        'ws://' +
          import.meta.env.VITE_API_BASE_URL +
          '/shell/' +
          this.hostInfo.ip +
          '/' +
          this.hostInfo.port +
          '/' +
          this.hostInfo.pass +
          '/' +
          this.term.cols +
          '/' +
          this.term.rows
      )
      this.socket.onopen = () => {
        //这边要用\r而不是\n，\n会导致下一行有空格
        this.term.write('连接已建立\r')
      }
      this.socket.onclose = () => {
        this.term.write('连接已断开\n')
      }
      this.socket.onmessage = (ev) => {
        this.term.write(ev.data)
      }
    }
  }
}
</script>
<style scoped>
.terminal {
  width: 100%;
  height: 100%;
  font-family: 'Courier New', Courier, monospace;
  overflow: hidden;
}
</style>
