<template>
  <div style="display: flex; flex-direction: column">
    <el-card shadow="hover" style="margin-bottom: 10px">
      <template #header><span>查询条件</span></template>
      <div class="conditions-container">
        <ConditionSelect v-model="queryConditions.matchMethod" :options="MatchMethod" label="匹配方法" />
        <ConditionSelect v-model="queryConditions.matchType" :options="MatchType" label="匹配类型" />
        <ConditionInput v-model="queryConditions.matchContent" label="匹配内容" />
        <ConditionInput v-model="queryConditions.exemptionUserName" label="豁免成员" />
        <ConditionInput v-model="queryConditions.exemptionGroupName" label="豁免分组" />
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
      <template #header>
        <span>
          <b style="color: #f56c6c">{{ workspaceName }}</b>
          的空间限制
        </span>
      </template>
      <el-table :data="tableData" style="width: 100%; height: 100%" fit border stripe highlight-current-row>
        <!-- 空数据提示 -->
        <template #empty><el-empty /></template>
        <!-- 列定义 -->
        <el-table-column prop="matchMethod" label="匹配方法" min-width="90" width="90" />
        <el-table-column prop="matchType" label="匹配类型" min-width="90" width="90">
          <template #default="{ row }">{{ MatchType[row.matchType] }}</template>
        </el-table-column>
        <el-table-column prop="matchContent" label="匹配内容" />
        <el-table-column prop="exemptionUserName" label="豁免成员">
          <template #default="{ row }">
            <div class="exemption-wrapper">
              <el-tag v-for="user in row.exemptionUserList" :key="user.userNo" type="danger">
                {{ user.userName }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="exemptionGroupName" label="豁免分组">
          <template #default="{ row }">
            <div class="exemption-wrapper">
              <el-tag v-for="group in row.exemptionGroupList" :key="group.groupNo" type="danger">
                {{ group.groupName }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="state" label="状态" min-width="60" width="60">
          <template #default="{ row }">{{ RestrictionState[row.state] }}</template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" min-width="160" width="160">
          <template #default="{ row }">
            <el-button type="primary" link @click="openModifyDialog(row)">编辑</el-button>
            <template v-if="row.state === 'ENABLE'">
              <el-button type="primary" link @click="disableRestriction(row)">禁用</el-button>
            </template>
            <template v-else>
              <el-button type="primary" link @click="enableRestriction(row)">启用</el-button>
            </template>
            <el-button type="primary" link @click="deleteRestriction(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分页组件 -->
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

    <div style="display: flex; justify-content: center; align-items: center">
      <el-button type="primary" style="margin-bottom: 20px" :icon="Back" @click="goBack()">返 回</el-button>
    </div>

    <!-- 创建空间限制表单 -->
    <CreateDialog v-if="showCreateDialog" v-model="showCreateDialog" @re-query="query" />
    <!-- 编辑空间限制表单 -->
    <ModifyDialog v-if="showModifyDialog" v-model="showModifyDialog" :row="currentRow" @re-query="query" />
  </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Back } from '@element-plus/icons-vue'
import { MatchMethod, MatchType, RestrictionState } from '@/api/enum'
import * as WorkspaceService from '@/api/public/workspace'
import ConditionInput from '@/components/query-condition/ConditionInput.vue'
import ConditionSelect from '@/components/query-condition/ConditionSelect.vue'
import useQueryConditions from '@/composables/useQueryConditions'
import CreateDialog from './WorkspaceRestrictionCreateDialog.vue'
import ModifyDialog from './WorkspaceRestrictionModifyDialog.vue'

const route = useRoute()
const router = useRouter()
const workspaceNo = ref(route.query.workspaceNo)
const workspaceName = ref('')
// 查询条件
const { queryConditions, resetQueryConditions } = useQueryConditions({
  workspaceNo: workspaceNo.value,
  matchMethod: '',
  matchType: '',
  matchContent: '',
  exemptionUserName: '',
  exemptionGroupName: ''
})
const tableData = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const currentRow = ref({})
const showCreateDialog = ref(false)
const showModifyDialog = ref(false)

onMounted(() => {
  if (!workspaceNo.value) goBack()
  query()
  queryWorkspaceInfo()
})

/**
 * 查询
 */
const query = () => {
  WorkspaceService.queryWorkspaceRestrictionList({
    ...queryConditions,
    page: page.value,
    pageSize: pageSize.value
  }).then((response) => {
    tableData.value = response.result['data']
    total.value = response.result['total']
  })
}

/**
 * 查询工作空间信息
 */
const queryWorkspaceInfo = () => {
  WorkspaceService.queryWorkspaceInfo({ workspaceNo: workspaceNo.value }).then((response) => {
    workspaceName.value = response.result.workspaceName
  })
}

/**
 * 启用
 */
const enableRestriction = ({ restrictionNo }) => {
  WorkspaceService.enableWorkspaceRestriction({ restrictionNo: restrictionNo }).then(() => {
    // 成功提示
    ElMessage({ message: '启用成功', type: 'info', duration: 2 * 1000 })
    // 重新查询列表
    query()
  })
}

/**
 * 禁用
 */
const disableRestriction = ({ restrictionNo }) => {
  WorkspaceService.disableWorkspaceRestriction({ restrictionNo: restrictionNo }).then(() => {
    // 成功提示
    ElMessage({ message: '禁用成功', type: 'info', duration: 2 * 1000 })
    // 重新查询列表
    query()
  })
}

/**
 * 删除用户
 */
const deleteRestriction = async ({ restrictionNo }) => {
  // 二次确认
  const error = await ElMessageBox.confirm('确定删除吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => false)
    .catch(() => true)
  if (error) return
  // 删除用户
  await WorkspaceService.deleteWorkspaceRestriction({ restrictionNo: restrictionNo })
  // 成功提示
  ElMessage({ message: '删除成功', type: 'info', duration: 2 * 1000 })
  // 重新查询列表
  query()
}

/**
 * 返回上一页
 */
const goBack = () => {
  window.history.length > 1 ? router.go(-1) : router.push('/system/workspace')
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

.exemption-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  align-items: center;

  .el-tag {
    margin-right: 5px;
    margin-bottom: 5px;
  }
}

.pagination-container {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
  padding-right: 10px;
}

:deep(.el-card__header) {
  padding: 10px 10px;
}

:deep(.el-card__body) {
  padding: 10px;
}
</style>
