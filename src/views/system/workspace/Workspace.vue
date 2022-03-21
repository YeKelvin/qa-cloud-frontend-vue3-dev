<template>
  <div style="display: flex; flex-direction: column">
    <el-card shadow="hover" style="margin-bottom: 10px">
      <template #header><span>查询条件</span></template>
      <div class="conditions-container">
        <ConditionInput v-model="queryConditions.workspaceNo" label="空间编号" />
        <ConditionInput v-model="queryConditions.workspaceName" label="空间名称" />
        <ConditionInput v-model="queryConditions.workspaceScope" label="空间作用域" />
        <ConditionInput v-model="queryConditions.workspaceDesc" label="空间描述" />
      </div>
      <div style="display: flex; justify-content: space-between">
        <div />
        <div style="display: flex; justify-content: center">
          <el-button type="primary" @click="query()">查 询</el-button>
          <el-button @click="resetQueryConditions()">重 置</el-button>
        </div>
        <el-button type="primary" @click="showCreateDialog = true">新 增</el-button>
      </div>
    </el-card>

    <el-card shadow="hover" class="table-container">
      <template #header><span>查询结果</span></template>
      <el-table :data="tableData" style="width: 100%; height: 100%" fit border stripe highlight-current-row>
        <!-- 空数据提示 -->
        <template #empty><el-empty /></template>
        <!-- 列定义 -->
        <el-table-column prop="workspaceNo" label="空间编号" min-width="150" />
        <el-table-column prop="workspaceName" label="空间名称" min-width="150" />
        <el-table-column prop="workspaceScope" label="空间作用域" min-width="150" />
        <el-table-column prop="workspaceDesc" label="空间描述" min-width="150" />
        <el-table-column fixed="right" label="操作" min-width="150">
          <template #default="{ row }">
            <template v-if="row.workspaceScope == 'PROTECTED'">
              <el-button type="text" @click="openMemberDialog(row)">成员管理</el-button>
            </template>
            <template v-if="row.workspaceScope != 'PRIVATE'">
              <el-button type="text" @click="openModifyDialog(row)">编辑</el-button>
              <el-button type="text" @click="deleteWorkspace(row)">删除</el-button>
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

    <!-- 创建空间表单 -->
    <CreateDialog v-if="showCreateDialog" v-model="showCreateDialog" @re-query="query" />
    <!-- 编辑空间表单 -->
    <ModifyDialog v-if="showModifyDialog" v-model="showModifyDialog" :row="currentRow" @re-query="query" />
    <!-- 空间成员管理列表 -->
    <MemberDialog v-if="showMemberDialog" v-model="showMemberDialog" :row="currentRow" @re-query="query" />
  </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import * as WorkspaceService from '@/api/public/workspace'
import ConditionInput from '@/components/query-condition/ConditionInput.vue'
import useQueryConditions from '@/composables/useQueryConditions'
import CreateDialog from './WorkspaceCreateDialog.vue'
import ModifyDialog from './WorkspaceModifyDialog.vue'
import MemberDialog from './WorkspaceMemberDialog.vue'

// 查询条件
const { queryConditions, resetQueryConditions } = useQueryConditions({
  workspaceNo: '',
  workspaceName: '',
  workspaceScope: '',
  workspaceDesc: ''
})
const tableData = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const currentRow = ref({})
const showCreateDialog = ref(false)
const showModifyDialog = ref(false)
const showMemberDialog = ref(false)

onMounted(() => {
  query()
})

/**
 * 查询
 */
const query = () => {
  WorkspaceService.queryWorkspaceList({ ...queryConditions.value, page: page.value, pageSize: pageSize.value }).then(
    (response) => {
      tableData.value = response.result['data']
      total.value = response.result['total']
    }
  )
}

/**
 * 删除空间
 */
const deleteWorkspace = async (row) => {
  // 二次确认
  const error = await ElMessageBox.confirm('确定删除吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => false)
    .catch(() => true)
  if (error) return
  // 删除空间
  await WorkspaceService.deleteWorkspace({ workspaceNo: row.workspaceNo })
  // 成功提示
  ElMessage({ message: '删除工作空间成功', type: 'info', duration: 2 * 1000 })
  // 重新查询列表
  query()
}

/**
 * 打开编辑对话框
 */
const openModifyDialog = (row) => {
  showModifyDialog.value = true
  currentRow.value = row
}

/**
 * 打开成员管理对话框
 */
const openMemberDialog = (row) => {
  showMemberDialog.value = true
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
