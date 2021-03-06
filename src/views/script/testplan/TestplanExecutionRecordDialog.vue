<template>
  <el-dialog title="执行记录" width="80%" center>
    <el-table :data="tableData" style="width: 100%; height: 100%" fit stripe highlight-current-row>
      <!-- 空数据提示 -->
      <template #empty><el-empty /></template>
      <!-- 列定义 -->
      <el-table-column prop="executionNo" label="执行编号" min-width="100" />
      <el-table-column prop="testPhase" label="测试阶段">
        <template #default="{ row }">
          <span>{{ TestPhase[row.testPhase] }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="environment" label="测试环境" />
      <el-table-column prop="runningState" label="执行状态">
        <template #default="{ row }">{{ RunningState[row.runningState] }}</template>
      </el-table-column>
      <el-table-column prop="startTime" label="执行时间" min-width="100">
        <template #default="{ row }">
          {{ row.startTime ? $dayjs(row.startTime).format('YYYY-MM-DD HH:mm:ss') : '' }}
        </template>
      </el-table-column>
      <el-table-column prop="endTime" label="完成时间" min-width="100">
        <template #default="{ row }">
          {{ row.endTime ? $dayjs(row.endTime).format('YYYY-MM-DD HH:mm:ss') : '' }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" min-width="100" width="100">
        <template #default="{ row }">
          <el-button type="primary" link style="margin-left: 12px" @click="openDetails(row.executionNo)">
            查看详情
          </el-button>
          <el-button v-if="row.reportNo" type="primary" link @click="openReport(row.reportNo)">查看报告</el-button>
          <el-button
            v-if="isShowInterruptBtn(row)"
            type="primary"
            link
            style="color: #f56c6c"
            @click="interrupt(row.executionNo)"
          >
            中断运行
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { RunningState, TestPhase } from '@/api/enum'
import * as ExecutionService from '@/api/script/execution'
import * as TestplanService from '@/api/script/testplan'

const props = defineProps({
  planNo: { type: String, default: '' }
})
const router = useRouter()
const tableData = ref([])

onMounted(() => {
  queryTestplanExecutionAll()
})

const queryTestplanExecutionAll = () => {
  TestplanService.queryTestplanExecutionAll({ planNo: props.planNo }).then((response) => {
    tableData.value = response.result
  })
}

/**
 * 中断运行
 */
const interrupt = (executionNo) => {
  ElMessageBox.confirm('确定中断运行吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ExecutionService.interruptTestplanExecution({ executionNo: executionNo }).then(() => {
      ElMessage({ message: '中断成功', type: 'info', duration: 1 * 1000 })
    })
  })
}

/**
 * 判断是否展示中断按钮
 */
const isShowInterruptBtn = (row) => {
  return row.runningState == 'WAITING' || row.runningState == 'RUNNING' || row.runningState == 'ITERATING'
}

/**
 * 跳转至计划执行详情页
 */
const openDetails = (executionNo) => {
  router.push({ path: 'testplan/execution/details', query: { executionNo: executionNo } })
}

/**
 * 跳转至测试报告页
 */
const openReport = (reportNo) => {
  router.push({ path: 'report', query: { reportNo: reportNo } })
}
</script>

<style lang="scss" scoped>
:deep(.el-dialog__body) {
  padding: 20px;
  padding-bottom: 30px;
}
</style>
