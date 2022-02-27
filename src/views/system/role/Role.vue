<template>
  <div style="display: flex; flex-direction: column">
    <el-card shadow="hover" style="margin-bottom: 10px">
      <template #header><span>查询条件</span></template>
      <div class="conditions-container">
        <ConditionInput v-model="queryConditions.roleNo" label="角色编号" />
        <ConditionInput v-model="queryConditions.roleName" label="角色名称" />
        <ConditionInput v-model="queryConditions.roleCode" label="角色名称" />
        <ConditionInput v-model="queryConditions.roleDesc" label="角色备注" />
        <ConditionSelect v-model="queryConditions.state" :options="RoleState" label="角色状态" />
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
        <el-table-column prop="roleNo" label="角色编号" min-width="150" />
        <el-table-column prop="roleName" label="角色名称" min-width="150" />
        <el-table-column prop="roleCode" label="角色代码" min-width="150" />
        <el-table-column prop="roleRank" label="角色等级" min-width="150" />
        <el-table-column prop="roleDesc" label="角色备注" min-width="150" />
        <el-table-column prop="roleType" label="角色类型" min-width="150">
          <template #default="{ row }">{{ RoleType[row.roleType] }}</template>
        </el-table-column>
        <el-table-column prop="state" label="状态" min-width="150">
          <template #default="{ row }">{{ RoleState[row.state] }}</template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" min-width="150">
          <template #default="{ row }">
            <el-button type="text" @click="openModifyDialog(row)">编辑</el-button>
            <el-button type="text" @click="gotoPermissionManager(row)">权限管理</el-button>
            <template v-if="row.state === 'ENABLE'">
              <el-button type="text" @click="modifyRoleState(row, 'DISABLE')">禁用</el-button>
            </template>
            <template v-else>
              <el-button type="text" @click="modifyRoleState(row, 'ENABLE')">启用</el-button>
            </template>
            <el-button v-if="row.roleType == 'CUSTOM'" type="text" @click="deleteRole(row)">删除</el-button>
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

    <!-- 创建角色表单 -->
    <CreateDialog v-model="showCreateDialog" destroy-on-close @re-query="query" />
    <!-- 编辑角色表单 -->
    <ModifyDialog v-model="showModifyDialog" destroy-on-close :row="currentRow" @re-query="query" />
  </div>
</template>

<script setup>
import { RoleState, RoleType } from '@/api/enum'
import * as RoleService from '@/api/usercenter/role'
import ConditionInput from '@/components/query-condition/ConditionInput.vue'
import ConditionSelect from '@/components/query-condition/ConditionSelect.vue'
import useQueryConditions from '@/composables/useQueryConditions'
import CreateDialog from './RoleCreateDialog.vue'
import ModifyDialog from './RoleModifyDialog.vue'

// 查询条件
const { queryConditions, resetQueryConditions } = useQueryConditions({
  roleNo: '',
  roleName: '',
  roleCode: '',
  roleDesc: '',
  roleType: '',
  state: ''
})
</script>

<script>
export default {
  name: 'Role',
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
      RoleService.queryRoleList({ ...this.queryConditions, page: this.page, pageSize: this.pageSize }).then(
        (response) => {
          this.tableData = response.result['data']
          this.total = response.result['total']
        }
      )
    },

    /**
     * 修改角色状态
     */
    async modifyRoleState(row, state) {
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
      // 修改角色状态
      await RoleService.modifyRoleState({ roleNo: row.roleNo, state: state })
      // 成功提示
      this.$message({ message: `${stateMsg}角色成功`, type: 'info', duration: 2 * 1000 })
      // 重新查询列表
      this.query()
    },

    /**
     * 删除角色
     */
    async deleteRole(row) {
      // 二次确认
      const error = await this.$confirm('确定删除吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => false)
        .catch(() => true)
      if (error) return
      // 删除角色
      await RoleService.deleteRole({ roleNo: row.roleNo })
      // 成功提示
      this.$message({ message: '删除角色成功', type: 'info', duration: 2 * 1000 })
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
     * 跳转至角色权限管理页
     */
    gotoPermissionManager({ roleNo }) {
      this.$router.push({ path: 'role/permissions', query: { roleNo: roleNo } })
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
