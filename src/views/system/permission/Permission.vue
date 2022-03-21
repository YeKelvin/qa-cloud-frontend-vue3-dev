<template>
  <div style="display: flex; flex-direction: column">
    <el-card shadow="hover" style="margin-bottom: 10px">
      <template #header><span>查询条件</span></template>
      <div class="conditions-container">
        <ConditionInput v-model="queryConditions.permissionNo" label="权限编号" />
        <ConditionInput v-model="queryConditions.permissionName" label="权限名称" />
        <ConditionInput v-model="queryConditions.permissionDesc" label="权限描述" />
        <ConditionInput v-model="queryConditions.endpoint" label="请求路由" />
        <ConditionSelect v-model="queryConditions.method" :options="HttpMethods" label="请求方法" />
        <ConditionSelect v-model="queryConditions.state" :options="PermissionState" label="权限状态" />
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
        <el-table-column prop="permissionNo" label="权限编号" min-width="150" />
        <el-table-column prop="permissionName" label="权限名称" min-width="150" />
        <el-table-column prop="permissionDesc" label="权限描述" min-width="150" />
        <el-table-column prop="endpoint" label="请求路由" min-width="150" />
        <el-table-column prop="method" label="请求方法" min-width="150" />
        <el-table-column prop="state" label="状态" min-width="150">
          <template #default="{ row }">{{ PermissionState[row.state] }}</template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" min-width="150">
          <template #default="{ row }">
            <el-button type="text" @click="openModifyDialog(row)">编辑</el-button>
            <template v-if="row.state === 'ENABLE'">
              <el-button type="text" @click="modifyPermissionState(row, 'DISABLE')">禁用</el-button>
            </template>
            <template v-else>
              <el-button type="text" @click="modifyPermissionState(row, 'ENABLE')">启用</el-button>
            </template>
            <el-button type="text" @click="disablePermission(row)">删除</el-button>
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

    <!-- 创建权限表单 -->
    <CreateDialog v-if="showCreateDialog" v-model="showCreateDialog" @re-query="query" />
    <!-- 编辑权限表单 -->
    <ModifyDialog v-if="showModifyDialog" v-model="showModifyDialog" :row="currentRow" @re-query="query" />
  </div>
</template>

<script setup>
import { PermissionState, HttpMethods } from '@/api/enum'
import * as PermissionService from '@/api/usercenter/permission'
import ConditionInput from '@/components/query-condition/ConditionInput.vue'
import ConditionSelect from '@/components/query-condition/ConditionSelect.vue'
import useQueryConditions from '@/composables/useQueryConditions'
import CreateDialog from './PermissionCreateDialog.vue'
import ModifyDialog from './PermissionModifyDialog.vue'

// 查询条件
const { queryConditions, resetQueryConditions } = useQueryConditions({
  permissionNo: '',
  permissionName: '',
  permissionDesc: '',
  endpoint: '',
  method: '',
  state: ''
})
</script>

<script>
export default {
  name: 'Permission',
  data() {
    return {
      // 表格数据
      tableData: [],
      // 分页信息
      page: 1,
      pageSize: 10,
      total: 0,
      // 当前操作的行数据
      currentRow: {},
      // 对话框打开关闭标识
      showCreateDialog: false,
      showModifyDialog: false
    }
  },
  mounted() {
    this.query()
  },
  methods: {
    /**
     * 查询
     */
    query() {
      PermissionService.queryPermissionList({ ...this.queryConditions, page: this.page, pageSize: this.pageSize }).then(
        (response) => {
          this.tableData = response.result['data']
          this.total = response.result['total']
        }
      )
    },

    /**
     * 修改权限状态
     */
    async modifyPermissionState(row, state) {
      const stateMsg = state === 'DISABLE' ? '禁用' : '启用'
      // 二次确认
      const error = await this.$confirm(`确定${stateMsg}吗？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => false)
        .catch(() => true)
      if (error) return
      // 修改权限状态
      await PermissionService.modifyPermissionState({ permissionNo: row.permissionNo, state: state })
      // 成功提示
      this.$message({ message: `${stateMsg}权限成功`, type: 'info', duration: 2 * 1000 })
      // 重新查询列表
      this.query()
    },

    /**
     * 删除权限
     */
    async disablePermission(row) {
      // 二次确认
      const error = await this.$confirm('确定删除吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => false)
        .catch(() => true)
      if (error) return
      // 删除权限
      await PermissionService.deletePermission({ permissionNo: row.permissionNo })
      // 成功提示
      this.$message({ message: '删除权限成功', type: 'info', duration: 2 * 1000 })
      // 重新查询列表
      this.query()
    },

    /**
     * 打开编辑对话框
     */
    openModifyDialog(row) {
      this.showModifyDialog = true
      this.currentRow = row
    },

    /**
     * pagination handler
     */
    handleSizeChange(val) {
      this.pageSize = val
      this.query()
    },

    /**
     * pagination handler
     */
    handleCurrentChange(val) {
      this.page = val
      this.query()
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
