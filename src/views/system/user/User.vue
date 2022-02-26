<template>
  <div style="display: flex; flex-direction: column">
    <el-card shadow="hover" style="margin-bottom: 10px">
      <template #header><span>查询条件</span></template>
      <div class="conditions-container">
        <ConditionInput v-model="queryConditions.userNo" label="用户编号" />
        <ConditionInput v-model="queryConditions.userName" label="用户名称" />
        <ConditionInput v-model="queryConditions.loginName" label="登录账号" />
        <ConditionInput v-model="queryConditions.mobileNo" label="手机号" />
        <ConditionInput v-model="queryConditions.email" label="邮箱地址" />
        <ConditionSelect v-model="queryConditions.state" :options="UserState" label="用户状态" />
      </div>
      <div style="display: flex; justify-content: space-between">
        <div />
        <div style="display: flex; justify-content: center">
          <el-button type="primary" @click="query">查 询</el-button>
          <el-button @click="resetQueryConditions">重 置</el-button>
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
        <el-table-column prop="userNo" label="用户编号" min-width="150" />
        <el-table-column prop="userName" label="用户名称" min-width="150" />
        <el-table-column prop="loginName" label="登录账号" min-width="150" />
        <el-table-column prop="mobileNo" label="手机号" min-width="150" />
        <el-table-column prop="email" label="邮箱" min-width="150" />
        <el-table-column prop="state" label="状态" min-width="150">
          <template #default="{ row }">{{ UserState[row.state] }}</template>
        </el-table-column>
        <el-table-column prop="roles" label="角色" min-width="150">
          <template #default="{ row }">
            <el-tag v-for="role in row.roles" :key="role.roleNo">{{ role.roleName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" min-width="150">
          <template #default="{ row }">
            <el-button type="text" @click="openModifyDialog(row)">编辑</el-button>
            <el-button type="text" @click="resetPassword(row)">重置密码</el-button>
            <template v-if="row.state === 'ENABLE'">
              <el-button type="text" @click="modifyUserState(row, 'DISABLE')">禁用</el-button>
            </template>
            <template v-else>
              <el-button type="text" @click="modifyUserState(row, 'ENABLE')">启用</el-button>
            </template>
            <el-button type="text" @click="deleteUser(row)">删除</el-button>
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

    <!-- 创建用户表单 -->
    <CreateDialog v-model="showCreateDialog" destroy-on-close @re-query="query" />
    <!-- 编辑用户表单 -->
    <ModifyDialog v-model="showModifyDialog" destroy-on-close :row="currentRow" @re-query="query" />
  </div>
</template>

<script setup>
import { UserState } from '@/api/enum'
import * as UserService from '@/api/usercenter/user'
import ConditionInput from '@/components/query-condition/ConditionInput.vue'
import ConditionSelect from '@/components/query-condition/ConditionSelect.vue'
import useQueryConditions from '@/composables/useQueryConditions'
import CreateDialog from './UserCreateDialog.vue'
import ModifyDialog from './UserModifyDialog.vue'

// 查询条件
const { queryConditions, resetQueryConditions } = useQueryConditions({
  userNo: '',
  userName: '',
  loginName: '',
  mobileNo: '',
  email: '',
  state: '',
  roles: []
})
</script>

<script>
export default {
  name: 'User',
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
      UserService.queryUserList({ ...this.queryConditions, page: this.page, pageSize: this.pageSize }).then(
        (response) => {
          this.tableData = response.result['data']
          this.total = response.result['total']
        }
      )
    },

    /**
     * 修改用户状态
     */
    async modifyUserState(row, state) {
      try {
        const message = state === 'DISABLE' ? '禁用' : '启用'
        // 二次确认
        await this.$confirm(`确定${message}吗？`, '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        // 修改用户状态
        await UserService.modifyUserState({ userNo: row.userNo, state: state })
        // 成功提示
        this.$message({ message: `${message}成功`, type: 'info', duration: 2 * 1000 })
        // 重新查询列表
        this.query()
      } catch {
        return
      }
    },

    /**
     * 重置用户密码
     */
    async resetPassword(row) {
      try {
        // 二次确认
        await this.$confirm('确定重置密码吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        // 重置用户密码
        await UserService.resetPassword({ userNo: row.userNo })
        // 成功提示
        this.$message({ message: '重置用户密码成功', type: 'info', duration: 2 * 1000 })
      } catch {
        return
      }
    },

    /**
     * 删除用户
     */
    async deleteUser(row) {
      try {
        // 二次确认
        await this.$confirm('确定删除吗？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        // 删除用户
        UserService.deleteUser({ userNo: row.userNo })
        // 成功提示
        this.$message({ message: '删除用户成功', type: 'info', duration: 2 * 1000 })
        // 重新查询列表
        this.query()
      } catch {
        return
      }
    },

    /**
     * 打开编辑对话框
     */
    openModifyDialog(row) {
      this.showModifyDialog = true
      this.currentRow = row
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.query()
    },
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
