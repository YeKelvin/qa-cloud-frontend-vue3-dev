<template>
  <el-dialog title="执行记录" width="80%" center v-bind="$attrs" v-on="$listeners">
    <el-table
      :data="tableData"
      style="width:100%; height:100%;"
      fit
      stripe
      highlight-current-row
    >
      <!-- 空数据提示 -->
      <el-empty slot="empty" />
      <!-- 列定义 -->
      <el-table-column prop="executionNo" label="执行编号" min-width="100" />
      <el-table-column prop="testPhase" label="测试阶段">
        <template slot-scope="{row}">
          <span>{{ TestPhase[row.testPhase] }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="environment" label="测试环境" />
      <el-table-column prop="runningState" label="执行状态">
        <template slot-scope="{row}">{{ RunningState[row.runningState] }}</template>
      </el-table-column>
      <el-table-column prop="createdTime" label="执行时间" min-width="100">
        <template slot-scope="{row}">{{ row.createdTime?$dayjs(row.createdTime).format('YYYY-MM-DD HH:mm:ss'):'' }}</template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" min-width="100" width="100">
        <template slot-scope="{row}">
          <el-button type="text" @click="openDetails(row.executionNo)">详情</el-button>
          <el-button v-if="row.reportNo" type="text" @click="openReport(row.reportNo)">报告</el-button>
          <el-button
            v-if="row.runningState=='WAITING' || row.runningState=='RUNNING' || row.runningState=='ITERATING'"
            type="text"
            style="color:#F56C6C;"
            @click="interrupt(row.executionNo)"
          >中断</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script>
import { RunningState, TestPhase } from '@/api/enum'
import * as ExecutionService from '@/api/script/execution'
import * as TestplanService from '@/api/script/testplan'

export default {

  name: 'ExecutionRecordDialog',

  props: {
    planNo: { type: String, default: '' }
  },

  data() {
    return {
      RunningState: RunningState,
      TestPhase: TestPhase,
      tableData: []
    }
  },

  mounted() {
    this.queryTestplanExecutionAll()
  },

  methods: {
    queryTestplanExecutionAll() {
      TestplanService.queryTestplanExecutionAll({ planNo: this.planNo })
        .then(response => {
          this.tableData = response.result
        })
    },
    interrupt(executionNo) {
      this.$confirm(
        '确定中断运行吗？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
      ).then(() => {
        ExecutionService.interruptTestplanExecution({ executionNo: executionNo })
          .then(() => {
            this.$message({ message: '中断成功', type: 'info', duration: 1 * 1000 })
          })
      })
    },
    openDetails(executionNo) {
      this.$router.push({ path: 'testplan/execution/details', query: { executionNo: executionNo }})
    },
    openReport(reportNo) {
      this.$router.push({ path: 'report', query: { reportNo: reportNo }})
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-dialog__body{
  padding: 20px;
  padding-bottom: 30px;
}
</style>
