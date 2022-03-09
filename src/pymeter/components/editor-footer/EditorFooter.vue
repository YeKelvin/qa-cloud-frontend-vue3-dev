<template>
  <el-card shadow="hover">
    <el-badge is-dot :hidden="resultsReaded">
      <el-button type="primary" plain @click="showResultDrawer = !showResultDrawer">响应结果</el-button>
    </el-badge>

    <el-button type="primary" plain @click="showLogDrawer = !showLogDrawer">运行日志</el-button>

    <ResultDrawer
      v-model="showResultDrawer"
      v-model:data="results"
      @open="resultsReaded = true"
      @close="resultsReaded = true"
    />

    <LogDrawer v-model="showLogDrawer" v-model:data="logs" />
  </el-card>
</template>

<script setup>
import { ref, onBeforeMount, onBeforeUnmount } from 'vue'
import { ElNotification } from 'element-plus'
import ResultDrawer from './result/ResultDrawer.vue'
import LogDrawer from './log/LogDrawer.vue'
import usePyMeterState from '@/pymeter/composables/usePyMeterState'
import useSocket from '@/composables/useSocket'
import useSocketIO from '@/composables/useSocketIO'

const socket = useSocket()
const socketio = useSocketIO()
const results = ref([])
const resultsReaded = ref(true)
const logs = ref([])
const logsReaded = ref(true)
const { showResultDrawer, showLogDrawer } = usePyMeterState()

onBeforeMount(() => {
  socket.on('pymeter_result_summary', (data) => {
    const result = results.value.find((result) => result.id === data.resultId)
    if (result) {
      Object.assign(result, data.result)
    } else {
      results.value.push(data.result)
    }
  })
  socket.on('pymeter_group_result', (data) => {
    const result = results.value.find((result) => result.id === data.resultId)
    if (!result) return

    const group = result.details.find((group) => group.id === data.groupId)
    if (group) {
      Object.assign(group, data.group)
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
    resultsReaded.value = false
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
</script>

<style lang="scss" scoped>
:deep(.el-card__body) {
  display: flex;
  justify-content: flex-start;
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

.el-button {
  margin-right: 20px;
}
</style>
