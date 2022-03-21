<template>
  <div style="display: flex; flex-direction: column">
    <el-card shadow="hover" style="margin-bottom: 10px">
      <template #header><span>查询条件</span></template>
      <div class="conditions-container">
        <ConditionInput v-model="queryConditions.actionDesc" label="操作描述" />
        <ConditionInput v-model="queryConditions.actionMethod" label="操作方法" />
        <ConditionInput v-model="queryConditions.actionEndpoint" label="操作路由" />
        <ConditionInput v-model="queryConditions.createdBy" label="操作人" />
        <ConditionDatetimePicker v-model="queryConditions.startTime" label="开始时间" />
        <ConditionDatetimePicker v-model="queryConditions.endTime" label="结束时间" />
      </div>
      <div style="display: flex; justify-content: center">
        <el-button type="primary" @click="query()">查 询</el-button>
        <el-button @click="resetQueryConditions()">重 置</el-button>
      </div>
    </el-card>

    <el-card shadow="hover" class="table-container">
      <template #header><span>查询结果</span></template>
      <el-table :data="tableData" style="width: 100%; height: 100%" fit border stripe highlight-current-row>
        <!-- 空数据提示 -->
        <template #empty><el-empty /></template>
        <!-- 列定义 -->
        <el-table-column prop="actionDesc" label="操作描述" min-width="150" />
        <el-table-column prop="actionMethod" label="请求方法" min-width="150" />
        <el-table-column prop="actionEndpoint" label="请求路由" min-width="150" />
        <el-table-column prop="oldValue" label="旧值" min-width="150" />
        <el-table-column prop="newValue" label="新值" min-width="150" />
        <el-table-column prop="createdBy" label="操作人" min-width="150" />
        <el-table-column prop="createdTime" label="操作时间" min-width="150" />
      </el-table>
    </el-card>

    <!-- 分页组件 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 25, 50, 100]"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import * as LogService from '@/api/system/log'
import useQueryConditions from '@/composables/useQueryConditions'
import ConditionInput from '@/components/query-condition/ConditionInput.vue'
import ConditionDatetimePicker from '@/components/query-condition/ConditionDatetimePicker.vue'

// 查询条件
const { queryConditions, resetQueryConditions } = useQueryConditions({
  actionDesc: '',
  actionMethod: '',
  actionEndpoint: '',
  createdBy: '',
  startTime: '',
  endTime: ''
})
const tableData = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

/**
 * 查询
 */
const query = () => {
  LogService.queryActionLogList({ ...queryConditions, page: page.value, pageSize: pageSize.value }).then((response) => {
    tableData.value = response.result['data']
    total.value = response.result['total']
  })
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
