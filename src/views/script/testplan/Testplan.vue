<template>
  <div style="display: flex; flex-direction: column">
    <el-card shadow="hover" style="margin-bottom: 10px">
      <span slot="header">查询条件</span>
      <div class="conditions-container">
        <condition-input v-model="queryConditions.planNo" label="计划编号" />
        <condition-input v-model="queryConditions.planName" label="计划名称" />
        <condition-input v-model="queryConditions.productRequirementsVersion" label="版本号" />
        <condition-select v-model="queryConditions.testPhase" :options="TestPhase" label="测试阶段" />
        <condition-select v-model="queryConditions.state" :options="TestplanState" label="计划状态" />
      </div>
      <div style="display: flex; justify-content: space-between">
        <div />
        <div style="display: flex; justify-content: center">
          <el-button type="primary" size="small" @click="queryList">查询</el-button>
          <el-button size="small" @click="resetQueryConditions">重置</el-button>
        </div>
        <el-button type="primary" size="small" @click="gotoTestplan(null)">创建测试计划</el-button>
      </div>
    </el-card>

    <el-card shadow="hover" class="table-container">
      <span slot="header">查询结果</span>
      <el-table :data="tableData" style="width: 100%; height: 100%" fit border stripe highlight-current-row>
        <!-- 空数据提示 -->
        <el-empty slot="empty" />
        <!-- 列定义 -->
        <el-table-column prop="planNo" label="计划编号" min-width="150" />
        <el-table-column prop="planName" label="计划名称" min-width="150" />
        <el-table-column prop="productRequirementsVersion" label="版本号" min-width="150" />
        <el-table-column prop="collectionTotal" label="脚本数" min-width="150" />
        <el-table-column prop="testPhase" label="测试阶段" min-width="150">
          <template #default="{ row }">
            <span style="display: flex; justify-content: space-between; align-items: center">
              <span>{{ TestPhase[row.testPhase] }}</span>
              <el-popover :ref="'testphase-popover-' + row.planNo" placement="bottom-end" width="300">
                <span style="display: flex; justify-content: space-between; align-items: center">
                  <el-select v-model="row.tobeModifiedTestPhase" size="small" style="width: 100%; margin-right: 10px">
                    <el-option v-for="(value, key) in TestPhase" :key="key" :label="value" :value="key" />
                  </el-select>
                  <el-button type="danger" size="mini" @click="modifyTestplanTestphase(row)">保存</el-button>
                </span>
                <el-button
                  v-if="row.testPhase != 'COMPLETED'"
                  slot="reference"
                  icon="el-icon-edit"
                  type="primary"
                  size="mini"
                  round
                />
              </el-popover>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="state" label="计划状态" min-width="150">
          <template #default="{ row }">
            <span style="display: flex; justify-content: space-between; align-items: center">
              <span>{{ TestplanState[row.state] }}</span>
              <el-popover :ref="'state-popover-' + row.planNo" placement="bottom-end" width="300">
                <span style="display: flex; justify-content: space-between; align-items: center">
                  <el-select v-model="row.tobeModifiedState" size="small" style="width: 100%; margin-right: 10px">
                    <el-option v-for="(value, key) in TestplanState" :key="key" :label="value" :value="key" />
                  </el-select>
                  <el-button type="danger" size="mini" @click="modifyTestplanState(row)">保存</el-button>
                </span>
                <el-button
                  v-if="row.state != 'COMPLETED'"
                  slot="reference"
                  icon="el-icon-edit"
                  type="primary"
                  size="mini"
                  round
                />
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
              <el-button type="text" style="margin-left: 10px" @click="gotoTestplan(row.planNo, 'QUERY')">
                计划详情
              </el-button>
              <el-button type="text" @click="openExecutionRecord(row)">执行记录</el-button>
              <el-button type="text" style="color: #f56c6c; font-weight: bold" @click="executeTestplan(row)">
                立即执行
              </el-button>
            </template>
            <template v-else>
              <el-button type="text" style="margin-left: 10px" @click="openExecutionRecord(row)">执行记录</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 翻页组件 -->
    <div class="pagination-container">
      <el-pagination
        layout="total, sizes, prev, pager, next, jumper"
        :current-page="page"
        :page-sizes="[10, 25, 50, 100]"
        :page-size="pageSize"
        :total="total"
        @size-change="handlePageSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <execution-record-dialog
      v-if="showExecutionRecord"
      v-model:visible="showExecutionRecord"
      :plan-no="selectedRowPlanNo"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { TestplanState, TestPhase } from '@/api/enum'
import * as ExecutionService from '@/api/script/execution'
import * as TestplanService from '@/api/script/testplan'
import ConditionInput from '@/components/QueryCondition/condition-input'
import ConditionSelect from '@/components/QueryCondition/condition-select'
import DatasetSelector from './dataset-selector'
import ExecutionRecordDialog from './execution-record-dialog'

export default {
  name: 'TestPlanManager',

  // eslint-disable-next-line
  components: { ConditionInput, ConditionSelect, DatasetSelector, ExecutionRecordDialog },

  data() {
    return {
      TestplanState: TestplanState,
      TestPhase: TestPhase,
      // 查询条件
      queryConditions: {
        planNo: '',
        planName: '',
        productRequirementsVersion: '',
        testPhase: '',
        state: ''
      },
      // 表格数据
      tableData: [],
      // 分页信息
      page: 1,
      pageSize: 10,
      total: 0,
      showExecutionRecord: false,
      selectedRowPlanNo: ''
    }
  },

  computed: {
    ...mapState('workspace', {
      workspaceNo: (state) => state.workspaceNo
    })
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
    queryList() {
      TestplanService.queryTestplanList({
        ...this.queryConditions,
        workspaceNo: this.workspaceNo,
        page: this.page,
        pageSize: this.pageSize
      }).then((response) => {
        const { data, total } = response.result
        this.tableData = data
        this.total = total
      })
    },
    resetQueryConditions() {
      Object.keys(this.queryConditions).forEach((key) => {
        this.queryConditions[key] = ''
      })
    },
    handlePageSizeChange(val) {
      this.pageSize = val
      this.queryList()
    },
    handlePageChange(val) {
      this.page = val
      this.queryList()
    },
    executeTestplan({ planNo, testPhase }) {
      let datasetNumberList = []
      let useCurrentValue = false
      this.$confirm(null, {
        title: '请选择测试环境',
        message: (
          <dataset-selector
            key={new Date().getTime()}
            workspaceNo={this.workspaceNo}
            testPhase={this.TestPhase[testPhase]}
            on-change-dataset-number-list={(val) => {
              datasetNumberList = val
            }}
            on-change-use-current-value={(val) => {
              useCurrentValue = val
            }}
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
    gotoTestplan(planNo, editorMode) {
      this.$router.push({
        path: 'testplan/editor',
        query: planNo ? { planNo: planNo } : null,
        name: 'TestplanEditor',
        params: { editorMode: planNo ? editorMode : 'CREATE' }
      })
    },
    openExecutionRecord({ planNo }) {
      this.selectedRowPlanNo = planNo
      this.showExecutionRecord = true
    },

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

    modifyTestplanState({ planNo, tobeModifiedState }) {
      if (!tobeModifiedState || tobeModifiedState === '') {
        // 错误提示
        this.$message({ message: '无效的状态', type: 'error', duration: 1 * 1000 })
        // 关闭popover
        this.$refs[`state-popover-${planNo}`].doClose()
        return
      }
      // 修改测试计划状态
      TestplanService.modifyTestplanState({ planNo: planNo, state: tobeModifiedState })
        .then(() => {
          // 重新查询列表
          this.queryList()
        })
        .finally(() => {
          // 关闭popover
          this.$refs[`state-popover-${planNo}`].doClose()
        })
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
