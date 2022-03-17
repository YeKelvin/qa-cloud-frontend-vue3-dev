<template>
  <el-card shadow="hover">
    <div class="l-container">
      <el-button type="primary" plain @click="showResultDrawer = !showResultDrawer">响应结果</el-button>
      <el-button type="primary" plain @click="showLogDrawer = !showLogDrawer">运行日志</el-button>
    </div>

    <div class="r-container">
      <el-button type="danger" plain circle><SvgIcon icon-name="pymeter-broom" @click="clearAll()" /></el-button>
    </div>

    <!-- 运行结果 -->
    <ResultDrawer v-model="showResultDrawer" v-model:data="results" />
    <!-- 运行日志 -->
    <LogDrawer v-model="showLogDrawer" v-model:data="logs" />
  </el-card>
</template>

<script setup>
import { assign as _assign } from 'lodash-es'
import { ElNotification } from 'element-plus'
import ResultDrawer from './result/ResultDrawer.vue'
import LogDrawer from './log/LogDrawer.vue'
import usePyMeterState from '@/pymeter/composables/usePyMeterState'
import useSocket from '@/composables/useSocket'
import useSocketIO from '@/composables/useSocketIO'
import SvgIcon from '@/components/svg-icon/SvgIcon.vue'

const socket = useSocket()
const socketio = useSocketIO()
const results = ref([])
const logs = ref([])
const { showResultDrawer, showLogDrawer } = usePyMeterState()

onBeforeMount(() => {
  socket.on('pymeter_result_summary', (data) => {
    const result = results.value.find((result) => result.id === data.resultId)
    if (result) {
      _assign(result, data.result)
    } else {
      results.value.push(data.result)
    }
  })
  socket.on('pymeter_group_result', (data) => {
    const result = results.value.find((result) => result.id === data.resultId)
    if (!result) return

    const group = result.details.find((group) => group.id === data.groupId)
    if (group) {
      _assign(group, data.group)
    } else {
      result.details.push(data.group)
    }
  })
  socket.on('pymeter_sampler_result', (data) => {
    const result = results.value.find((result) => result.id === data.resultId)
    if (!result) return

    const group = result.details.find((group) => group.id === data.groupId)
    if (!group) return

    group.children.push(data.sampler)
  })
  socket.on('pymeter_message', (data) => {
    ElNotification({ message: data, type: 'success', duration: 1 * 1000 })
  })
  socket.on('pymeter_log', (data) => {
    logs.value.push(data)
  })
  socket.on('pymeter_completed', () => {
    ElNotification({ message: '脚本执行完毕', type: 'success', duration: 2 * 1000 })
    socketio.disconnect()
  })
  socket.on('pymeter_error', (data) => {
    ElNotification({ message: data, type: 'error', duration: 2 * 1000 })
    socketio.disconnect()
  })
})

onBeforeUnmount(() => {
  socket.off('pymeter_result_summary')
  socket.off('pymeter_group_result')
  socket.off('pymeter_sampler_result')
  socket.off('pymeter_message')
  socket.off('pymeter_log')
  socket.off('pymeter_completed')
  socket.off('pymeter_error')
  socketio.disconnect()
})

/**
 * 清空所有记录
 */
const clearAll = () => {
  results.value = []
  logs.value = []
}
</script>

<style lang="scss" scoped>
:deep(.el-card__body) {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 5px 20px;
  width: 100%;
  min-height: 30px;
}

:deep(.el-badge__content.is-dot) {
  height: 12px;
  width: 12px;
  right: 8px;
  top: 2px;
}

.l-container .el-button {
  margin-right: 20px;
}
</style>
