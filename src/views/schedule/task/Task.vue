<template>
  <div style="display: flex; flex-direction: column">
    <el-card shadow="hover" style="margin-bottom: 10px">
      <template #header><span>查询条件</span></template>
      <div class="conditions-container">
        <ConditionInput v-model="queryConditions.jobNo" label="作业编号" />
        <ConditionInput v-model="queryConditions.jobName" label="作业名称" />
        <ConditionSelect v-model="queryConditions.jobType" :options="JobType" label="作业类型" />
        <ConditionSelect v-model="queryConditions.triggerType" :options="TriggerType" label="触发类型" />
        <ConditionSelect v-model="queryConditions.state" :options="JobState" label="状态" />
      </div>
      <div style="display: flex; justify-content: space-between">
        <div />
        <div style="display: flex; justify-content: center">
          <el-button type="primary" :icon="Search" @click="query()">查 询</el-button>
          <el-button :icon="Refresh" @click="resetQueryConditions()">重 置</el-button>
        </div>
        <el-button type="primary" :icon="Plus" @click="showCreateDialog = true">新 增</el-button>
      </div>
    </el-card>

    <el-card shadow="hover" class="table-container">
      <template #header><span>查询结果</span></template>
      <el-table :data="tableData" style="width: 100%; height: 100%" fit border stripe highlight-current-row>
        <!-- 空数据提示 -->
        <template #empty><el-empty /></template>
        <!-- 列定义 -->
        <el-table-column prop="jobNo" label="作业编号" min-width="180" width="180" />
        <el-table-column prop="jobName" label="作业名称" min-width="150" />
        <el-table-column prop="jobType" label="作业类型" min-width="100" width="100">
          <template #default="{ row }">{{ JobType[row.jobType] }}</template>
        </el-table-column>
        <el-table-column prop="triggerType" label="触发类型" min-width="100" width="100">
          <template #default="{ row }">{{ TriggerType[row.triggerType] }}</template>
        </el-table-column>
        <el-table-column prop="state" label="状态" min-width="80" width="80">
          <template #default="{ row }">{{ JobState[row.state] }}</template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" min-width="200" width="200">
          <template #default="{ row }">
            <el-button type="text" @click="openDetailDialog(row)">详情</el-button>
            <el-button type="text" @click="openModifyDialog(row)">编辑</el-button>
            <template v-if="row.state == 'NORMAL'">
              <el-button type="text" @click="pauseTask(row)">暂停</el-button>
            </template>
            <template v-if="row.state == 'PAUSED'">
              <el-button type="text" @click="resumeTask(row)">恢复</el-button>
            </template>
            <template v-if="row.state != 'CLOSED'">
              <el-button type="text" @click="removeTask(row)">关闭</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

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

    <!-- 任务详情 -->
    <TaskDetailDialog v-if="showDetailDialog" v-model="showDetailDialog" />
    <!-- 创建任务表单 -->
    <TaskCreateDialog v-if="showCreateDialog" v-model="showCreateDialog" @re-query="query" />
    <!-- 编辑任务表单 -->
    <TaskModifyDialog v-if="showModifyDialog" v-model="showModifyDialog" :row="currentRow" @re-query="query" />
  </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { JobState, JobType, TriggerType } from '@/api/enum'
import * as ScheduleService from '@/api/schedule/task'
import ConditionInput from '@/components/query-condition/ConditionInput.vue'
import ConditionSelect from '@/components/query-condition/ConditionSelect.vue'
import useQueryConditions from '@/composables/useQueryConditions'
import useWorkspaceState from '@/composables/useWorkspaceState'
import TaskDetailDialog from './TaskDetailDialog.vue'
import TaskCreateDialog from './TaskCreateDialog.vue'
import TaskModifyDialog from './TaskModifyDialog.vue'

const { workspaceNo } = useWorkspaceState()
const { queryConditions, resetQueryConditions } = useQueryConditions({
  workspaceNo: workspaceNo.value,
  jobNo: '',
  jobName: '',
  jobDesc: '',
  jobType: '',
  triggerType: '',
  state: ''
})
const tableData = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const currentRow = ref({})
const showDetailDialog = ref(false)
const showCreateDialog = ref(false)
const showModifyDialog = ref(false)

watch(workspaceNo, (val) => {
  if (val) query()
})

onMounted(() => {
  query()
})

/**
 * 查询
 */
const query = () => {
  ScheduleService.queryTaskList({ ...queryConditions, page: page.value, pageSize: pageSize.value }).then((response) => {
    tableData.value = response.result['data']
    total.value = response.result['total']
  })
}

/**
 * 暂停作业
 */
const pauseTask = async (row) => {
  // 二次确认
  const error = await ElMessageBox.confirm('确定暂停吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => false)
    .catch(() => true)
  if (error) return
  // 暂停作业
  await ScheduleService.pauseTask({ jobNo: row.jobNo })
  // 成功提示
  ElMessage({ message: `暂停作业成功`, type: 'info', duration: 2 * 1000 })
  // 重新查询列表
  query()
}

/**
 * 恢复作业
 */
const resumeTask = async (row) => {
  // 二次确认
  const error = await ElMessageBox.confirm('确定恢复吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => false)
    .catch(() => true)
  if (error) return
  // 恢复作业
  await ScheduleService.resumeTask({ jobNo: row.jobNo })
  // 成功提示
  ElMessage({ message: `恢复作业成功`, type: 'info', duration: 2 * 1000 })
  // 重新查询列表
  query()
}

/**
 * 关闭作业
 */
const removeTask = async (row) => {
  // 二次确认
  const error = await ElMessageBox.confirm('确定关闭吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => false)
    .catch(() => true)
  if (error) return
  // 关闭作业
  await ScheduleService.removeTask({ jobNo: row.jobNo })
  // 成功提示
  ElMessage({ message: '关闭作业成功', type: 'info', duration: 2 * 1000 })
  // 重新查询列表
  query()
}

/**
 * 打开详情对话框
 */
const openDetailDialog = (row) => {
  showDetailDialog.value = true
  currentRow.value = row
}

/**
 * 打开编辑对话框
 */
const openModifyDialog = (row) => {
  showModifyDialog.value = true
  currentRow.value = row
}

/**
 * pagination handler
 */
const handleSizeChange = (val) => {
  pageSize.value = val
  query()
}

/**
 * pagination handler
 */
const handleCurrentChange = (val) => {
  page.value = val
  query()
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
