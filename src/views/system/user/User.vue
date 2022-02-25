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
        <el-button type="primary" @click="showRegisterDialog = true">新 增</el-button>
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
            <el-button v-if="row.state === 'ENABLE'" type="text" @click="modifyUserState(row, 'DISABLE')">
              禁用
            </el-button>
            <el-button v-else type="text" @click="modifyUserState(row, 'ENABLE')">启用</el-button>
            <el-button type="text" @click="deleteUser(row)">删除</el-button>
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

    <!-- 注册用户表单 -->
    <!-- <register-form v-if="showRegisterDialog" key="create" v-model:visible="showRegisterDialog" @re-query="query" /> -->

    <!-- 编辑用户表单 -->
    <!-- <modify-form
      v-if="showModifyDialog"
      key="modify"
      v-model:visible="showModifyDialog"
      :row="currentRowData"
      @re-query="query"
    /> -->
  </div>
</template>

<script setup>
import ConditionInput from '@/components/query-condition/ConditionInput.vue'
import ConditionSelect from '@/components/query-condition/ConditionSelect.vue'
// import RegisterForm from './components/register-form'
// import ModifyForm from './components/modify-form'
</script>

<script>
import * as UserService from '@/api/usercenter/user'
import { UserState } from '@/api/enum'

export default {
  name: 'User',
  data() {
    return {
      // 查询条件
      UserState: UserState,
      queryConditions: {
        userNo: '',
        userName: '',
        loginName: '',
        mobileNo: '',
        email: '',
        state: '',
        roles: []
      },
      // 表格数据
      tableData: [],
      // 分页信息
      page: 1,
      pageSize: 10,
      total: 0,
      currentRowData: {},
      showRegisterDialog: false,
      showModifyDialog: false
    }
  },
  mounted() {
    this.query()
  },
  methods: {
    query() {
      UserService.queryUserList({ ...this.queryConditions, page: this.page, pageSize: this.pageSize }).then(
        (response) => {
          this.tableData = response.result['data']
          this.total = response.result['total']
        }
      )
    },
    resetQueryConditions() {
      Object.keys(this.queryConditions).forEach((key) => {
        this.queryConditions[key] = ''
      })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.query()
    },
    handleCurrentChange(val) {
      this.page = val
      this.query()
    },
    modifyUserState(row, state) {
      const message = state === 'DISABLE' ? '禁用' : '启用'
      this.$confirm(`确定${message}吗？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        UserService.modifyUserState({ userNo: row.userNo, state: state }).then(() => {
          // 成功提示
          this.$message({ message: `${message}成功`, type: 'info', duration: 2 * 1000 })
          // 重新查询列表
          this.query()
        })
      })
    },
    resetPassword(row) {
      this.$confirm('确定重置密码吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        UserService.resetPassword({ userNo: row.userNo }).then(() => {
          // 成功提示
          this.$message({ message: '重置用户密码成功', type: 'info', duration: 2 * 1000 })
        })
      })
    },
    deleteUser(row) {
      this.$confirm('确定删除吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        UserService.deleteUser({ userNo: row.userNo }).then(() => {
          // 成功提示
          this.$message({ message: '删除用户成功', type: 'info', duration: 2 * 1000 })
          // 重新查询列表
          this.query()
        })
      })
    },
    openModifyDialog(row) {
      this.showModifyDialog = true
      this.currentRowData = { ...row }
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
