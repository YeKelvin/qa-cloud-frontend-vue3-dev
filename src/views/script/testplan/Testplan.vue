<template>
  <div style="display: flex; flex-direction: column">
    <el-card shadow="hover" style="margin-bottom: 10px">
      <template #header><span>查询条件</span></template>
      <div class="conditions-container">
        <ConditionInput v-model="queryConditions.planNo" label="计划编号" />
        <ConditionInput v-model="queryConditions.planName" label="计划名称" />
        <ConditionInput v-model="queryConditions.productRequirementsVersion" label="版本号" />
        <ConditionSelect v-model="queryConditions.testPhase" :options="TestPhase" label="测试阶段" />
        <ConditionSelect v-model="queryConditions.state" :options="TestplanState" label="计划状态" />
      </div>
      <div style="display: flex; justify-content: space-between">
        <div />
        <div style="display: flex; justify-content: center">
          <el-button type="primary" @click="queryList()">查询</el-button>
          <el-button @click="resetQueryConditions()">重置</el-button>
        </div>
        <el-button type="primary" @click="gotoTestplanEditor(null)">创建测试计划</el-button>
      </div>
    </el-card>

    <el-card shadow="hover" class="table-container">
      <template #header><span>查询结果</span></template>
      <el-table :data="tableData" style="width: 100%; height: 100%" fit border stripe highlight-current-row>
        <!-- 空数据提示 -->
        <template #empty><el-empty /></template>
        <!-- 列定义 -->
        <el-table-column prop="planNo" label="计划编号" min-width="150" />
        <el-table-column prop="planName" label="计划名称" min-width="150" />
        <el-table-column prop="productRequirementsVersion" label="版本号" min-width="150" />
        <el-table-column prop="collectionTotal" label="脚本数" min-width="150" />
        <el-table-column prop="testPhase" label="测试阶段" min-width="150">
          <template #default="{ row }">
            <span style="display: flex; justify-content: space-between; align-items: center">
              <span>{{ TestPhase[row.testPhase] }}</span>
              <el-popover :ref="'testphase-popover-' + row.planNo" trigger="click" placement="bottom" width="300">
                <span style="display: flex; justify-content: space-between; align-items: center">
                  <el-select v-model="row.tobeModifiedTestPhase" style="width: 100%; margin-right: 10px">
                    <el-option v-for="(value, key) in TestPhase" :key="key" :label="value" :value="key" />
                  </el-select>
                  <el-button type="danger" @click="modifyTestplanTestphase(row)">保存</el-button>
                </span>
                <template #reference>
                  <el-button v-if="row.testPhase != 'COMPLETED'" :icon="Edit" type="primary" size="small" round />
                </template>
              </el-popover>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="state" label="计划状态" min-width="150">
          <template #default="{ row }">
            <span style="display: flex; justify-content: space-between; align-items: center">
              <span>{{ TestplanState[row.state] }}</span>
              <el-popover :ref="'state-popover-' + row.planNo" trigger="click" placement="bottom" width="300">
                <span style="display: flex; justify-content: space-between; align-items: center">
                  <el-select v-model="row.tobeModifiedState" style="width: 100%; margin-right: 10px">
                    <el-option v-for="(value, key) in TestplanState" :key="key" :label="value" :value="key" />
                  </el-select>
                  <el-button type="danger" @click="modifyTestplanState(row)">保存</el-button>
                </span>
                <template #reference>
                  <el-button v-if="row.state != 'COMPLETED'" :icon="Edit" type="primary" size="small" round />
                </template>
              </el-popover>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" min-width="150">
          <template #default="{ row }">
            {{ row.startTime ? $dayjs(row.startTime).format('YYYY-MM-DD HH:mm:ss') : '' }}
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" min-width="150">
          <template #default="{ row }">
            {{ row.endTime ? $dayjs(row.endTime).format('YYYY-MM-DD HH:mm:ss') : '' }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" min-width="150">
          <template #default="{ row }">
            <template v-if="row.state != 'COMPLETED'">
              <el-button type="text" style="margin-left: 10px" @click="gotoTestplanEditor(row.planNo, 'QUERY')">
                计划详情
              </el-button>
              <el-button type="text" @click="openExecutionRecordDialog(row)">执行记录</el-button>
              <el-button type="text" style="color: #f56c6c; font-weight: bold" @click="executeTestplan(row)">
                立即执行
              </el-button>
            </template>
            <template v-else>
              <el-button type="text" style="margin-left: 10px" @click="openExecutionRecordDialog(row)">
                执行记录
              </el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 翻页组件 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="page"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 25, 50, 100]"
        :page-size="pageSize"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <TestplanExecutionRecordDialog v-if="showRecordDialog" v-model="showRecordDialog" :plan-no="currentRowPlanNo" />
  </div>
</template>

<script lang="jsx" setup>
import { TestplanState, TestPhase } from '@/api/enum'
import { Edit } from '@element-plus/icons-vue'
import * as ExecutionService from '@/api/script/execution'
import * as TestplanService from '@/api/script/testplan'
import useQueryConditions from '@/composables/useQueryConditions'
import useWorkspaceState from '@/composables/useWorkspaceState'
import ConditionInput from '@/components/query-condition/ConditionInput.vue'
import ConditionSelect from '@/components/query-condition/ConditionSelect.vue'
import TestplanDatasetSelect from './TestplanDatasetSelect.vue'
import TestplanExecutionRecordDialog from './TestplanExecutionRecordDialog.vue'

// 查询条件
const { queryConditions, resetQueryConditions } = useQueryConditions({
  planNo: '',
  planName: '',
  productRequirementsVersion: '',
  testPhase: '',
  state: ''
})
const { workspaceNo } = useWorkspaceState()
</script>

<script lang="jsx">
export default {
  name: 'TestPlan',

  data() {
    return {
      // 表格数据
      tableData: [],
      // 分页信息
      page: 1,
      pageSize: 10,
      total: 0,
      // 对话框打开关闭标识
      showRecordDialog: false,
      currentRowPlanNo: ''
    }
  },

  watch: {
    workspaceNo() {
      this.queryList()
    }
  },

  mounted() {
    this.queryList()
  },

  methods: {
    /**
     * 查询
     */
    queryList() {
      TestplanService.queryTestplanList({
        ...this.queryConditions,
        workspaceNo: this.workspaceNo,
        page: this.page,
        pageSize: this.pageSize
      }).then((response) => {
        this.tableData = response.result.data
        this.total = response.result.total
      })
    },

    /**
     * 执行测试计划
     */
    executeTestplan({ planNo, testPhase }) {
      let datasetNumberList = []
      let useCurrentValue = false
      this.$confirm(null, {
        title: '请选择测试环境',
        message: (
          <TestplanDatasetSelect
            key={new Date().getTime()}
            workspaceNo={this.workspaceNo}
            testPhase={this.TestPhase[testPhase]}
            on-change-dataset-number-list={(val) => (datasetNumberList = val)}
            on-change-use-current-value={(val) => (useCurrentValue = val)}
          />
        ),
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        ExecutionService.executeTestPlan({
          planNo: planNo,
          datasetNumberList: datasetNumberList,
          useCurrentValue: useCurrentValue
        }).then((response) => {
          this.$notify({
            message: `开始执行测试计划，总 ${response.result.total} 个脚本，请稍等片刻`,
            type: 'success',
            duration: 2 * 1000
          })
        })
      })
    },

    /**
     * 修改测试阶段
     */
    modifyTestplanTestphase({ planNo, tobeModifiedTestPhase }) {
      if (!tobeModifiedTestPhase || tobeModifiedTestPhase === '') {
        // 错误提示
        this.$message({ message: '无效的测试阶段', type: 'error', duration: 1 * 1000 })
        // 关闭popover
        this.$refs[`testphase-popover-${planNo}`].doClose()
        return
      }
      // 修改测试阶段
      TestplanService.modifyTestplanTestphase({ planNo: planNo, testPhase: tobeModifiedTestPhase })
        .then(() => {
          // 重新查询列表
          this.queryList()
        })
        .finally(() => {
          // 关闭popover
          this.$refs[`testphase-popover-${planNo}`].doClose()
        })
    },

    /**
     * 修改计划状态
     */
    modifyTestplanState({ planNo, tobeModifiedState }) {
      if (!tobeModifiedState || tobeModifiedState === '') {
        // 错误提示
        this.$message({ message: '无效的状态', type: 'error', duration: 1 * 1000 })
        // 关闭popover
        this.$refs[`state-popover-${planNo}`].doClose()
        return
      }
      // 修改计划状态
      TestplanService.modifyTestplanState({ planNo: planNo, state: tobeModifiedState })
        .then(() => {
          // 重新查询列表
          this.queryList()
        })
        .finally(() => {
          // 关闭popover
          this.$refs[`state-popover-${planNo}`].doClose()
        })
    },

    /**
     * 跳转至测试计划 新增/编辑 页
     */
    gotoTestplanEditor(planNo, editorMode) {
      this.$router.push({
        path: 'testplan/editor',
        query: planNo ? { planNo: planNo } : null,
        name: 'TestplanEditor',
        params: { editorMode: planNo ? editorMode : 'CREATE' }
      })
    },

    /**
     * 打开执行记录对话框
     */
    openExecutionRecordDialog({ planNo }) {
      this.currentRowPlanNo = planNo
      this.showRecordDialog = true
    },

    /**
     * pagination handler
     */
    handleSizeChange(val) {
      this.pageSize = val
      this.queryList()
    },

    /**
     * pagination handler
     */
    handleCurrentChange(val) {
      this.page = val
      this.queryList()
    }
  }
}
</script>

<style lang="scss" scoped>
.conditions-container {
  display: flex;
  flex: none;
  flex-wrap: wrap;
}

.table-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
}

.pagination-container {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
}

:deep(.el-card__header) {
  padding: 10px 10px;
}

:deep(.el-card__body) {
  padding: 10px;
}
</style>
