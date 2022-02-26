<template>
  <div style="display: flex; flex-direction: column">
    <el-card shadow="hover" style="margin-bottom: 10px">
      <template #header><span>角色权限过滤</span></template>
      <div class="conditions-container">
        <ConditionInput v-model="queryConditions.permissionNo" label="权限编号" />
        <ConditionInput v-model="queryConditions.permissionName" label="权限名称" />
        <ConditionInput v-model="queryConditions.endpoint" label="请求路由" />
        <ConditionSelect v-model="queryConditions.method" :options="HttpMethods" label="请求方法" />
      </div>
      <div style="display: flex; justify-content: space-between">
        <div />
        <div style="display: flex; justify-content: center">
          <el-button type="primary" @click="query()">查 询</el-button>
          <el-button @click="resetQueryConditions()">重 置</el-button>
        </div>
        <div>
          <el-button v-if="!modifyMode" type="primary" @click="editMode = 'DELETE'">批量删除</el-button>
          <el-button v-if="!modifyMode" type="primary" @click="editMode = 'CREATE'">批量新增</el-button>
          <el-button v-if="modifyMode" @click="editMode = 'QUERY'">取 消</el-button>
          <el-button v-if="createMode" type="danger" @click="createPermissions()">提 交</el-button>
          <el-button v-if="deleteMode" type="danger" @click="deletePermissions()">提 交</el-button>
        </div>
      </div>
    </el-card>

    <el-card shadow="hover" class="table-container">
      <template #header>
        <span v-if="queryMode">
          <b style="color: #f56c6c">{{ roleInfo.roleName }}</b>
          已绑定的权限
        </span>
        <span v-if="createMode">{{ roleInfo.roleName }} 未绑定的权限</span>
      </template>
      <el-table
        :data="tableData"
        style="width: 100%; height: 100%"
        fit
        stripe
        highlight-current-row
        @selection-change="handleSelectionChange"
      >
        <!-- 空数据提示 -->
        <template #empty><el-empty /></template>
        <!-- 列定义 -->
        <el-table-column v-if="modifyMode" key="selection" type="selection" min-width="20" width="50" />
        <el-table-column prop="permissionNo" label="权限编号" />
        <el-table-column prop="permissionName" label="权限名称" />
        <el-table-column prop="endpoint" label="请求路由" />
        <el-table-column prop="method" label="请求方法" />
        <el-table-column v-if="queryMode" key="operation" fixed="right" label="操作" min-width="40" width="80">
          <template #default="{ row }">
            <el-button type="text" @click="deletePermission(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <div style="display: flex; justify-content: flex-end; padding: 10px">
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
      <el-button type="primary" style="margin-bottom: 20px" @click="goBack">返回</el-button>
    </div>
  </div>
</template>

<script setup>
import { HttpMethods } from '@/api/enum'
import * as RoleService from '@/api/usercenter/role'
import ConditionInput from '@/components/query-condition/ConditionInput.vue'
import ConditionSelect from '@/components/query-condition/ConditionSelect.vue'
import useQueryConditions from '@/composables/useQueryConditions'

// 查询条件
const { queryConditions, resetQueryConditions } = useQueryConditions({
  permissionNo: '',
  permissionName: '',
  endpoint: '',
  method: ''
})
</script>

<script>
export default {
  name: 'RolePermissions',
  data() {
    return {
      roleNo: this.$route.query.roleNo,
      roleInfo: {},
      // 表格数据
      tableData: [],
      // 分页信息
      page: 1,
      pageSize: 10,
      total: 0,
      // 对话框打开关闭标识
      showCreateDialog: false,
      // 多选数据
      multipleSelection: [],
      // 编辑模式
      editMode: 'QUERY'
    }
  },

  computed: {
    queryMode() {
      return this.editMode === 'QUERY'
    },
    createMode() {
      return this.editMode === 'CREATE'
    },
    deleteMode() {
      return this.editMode === 'DELETE'
    },
    modifyMode() {
      return this.createMode || this.deleteMode
    }
  },

  watch: {
    editMode() {
      this.page = 1
      this.query()
    }
  },

  mounted() {
    this.queryRoleData()
    this.query()
  },

  methods: {
    /**
     * 查询
     */
    query() {
      if (this.createMode) {
        RoleService.queryRolePermissionUnboundList({
          ...this.queryConditions,
          roleNo: this.roleNo,
          page: this.page,
          pageSize: this.pageSize
        }).then((response) => {
          this.tableData = response.result['data']
          this.total = response.result['total']
        })
      } else {
        RoleService.queryRolePermissionList({
          ...this.queryConditions,
          roleNo: this.roleNo,
          page: this.page,
          pageSize: this.pageSize
        }).then((response) => {
          this.tableData = response.result['data']
          this.total = response.result['total']
        })
      }
    },

    /**
     * 查询角色信息
     */
    queryRoleData() {
      RoleService.queryRoleInfo({ roleNo: this.roleNo }).then((response) => {
        this.roleInfo = response.result
      })
    },

    /**
     * 删除角色权限
     */
    deletePermission({ roleNo, permissionNo }) {
      this.$confirm('确定删除吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        RoleService.deleteRolePermission({ roleNo: roleNo, permissionNo: permissionNo }).then(() => {
          this.$message({ message: '删除成功', type: 'info', duration: 2 * 1000 })
          // 重新查询列表
          this.query()
        })
      })
    },

    /**
     * 批量创建角色权限
     */
    createPermissions() {
      if (this.multipleSelection.length === 0) {
        this.$message({ message: '请先勾选权限', type: 'error', duration: 2 * 1000 })
        return
      }
      RoleService.createRolePermissions({
        roleNo: this.roleNo,
        permissionNumberList: this.multipleSelection.map((item) => item.permissionNo)
      }).then(() => {
        // 成功提示
        this.$message({ message: '批量新增成功', type: 'info', duration: 2 * 1000 })
        // 设置为查询模式
        this.editMode = 'QUERY'
      })
    },

    /**
     * 批量删除角色权限
     */
    deletePermissions() {
      if (this.multipleSelection.length === 0) {
        this.$message({ message: '请先勾选权限', type: 'error', duration: 2 * 1000 })
        return
      }
      RoleService.deleteRolePermissions({
        roleNo: this.roleNo,
        permissionNumberList: this.multipleSelection.map((item) => item.permissionNo)
      }).then(() => {
        // 成功提示
        this.$message({ message: '批量删除成功', type: 'info', duration: 2 * 1000 })
        // 设置为查询模式
        this.editMode = 'QUERY'
      })
    },

    /**
     * 返回上一页
     */
    goBack() {
      window.history.length > 1 ? this.$router.go(-1) : this.$router.push('/')
    },

    /**
     * table handler
     */
    handleSelectionChange(val) {
      this.multipleSelection = val
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

:deep(.el-card__header) {
  padding: 10px 10px;
}

:deep(.el-card__body) {
  padding: 10px;
}
</style>
