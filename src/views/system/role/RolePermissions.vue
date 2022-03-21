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
      <el-button type="primary" style="margin-bottom: 20px" @click="goBack()">返回</el-button>
    </div>
  </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { HttpMethods } from '@/api/enum'
import * as RoleService from '@/api/usercenter/role'
import ConditionInput from '@/components/query-condition/ConditionInput.vue'
import ConditionSelect from '@/components/query-condition/ConditionSelect.vue'
import useQueryConditions from '@/composables/useQueryConditions'

const route = useRoute()
const router = useRouter()
const { queryConditions, resetQueryConditions } = useQueryConditions({
  permissionNo: '',
  permissionName: '',
  endpoint: '',
  method: ''
})
const roleNo = ref(route.query.roleNo)
const roleInfo = ref({})
const tableData = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const multipleSelection = ref([])
const editMode = ref('QUERY')
const queryMode = computed(() => editMode.value === 'QUERY')
const createMode = computed(() => editMode.value === 'CREATE')
const deleteMode = computed(() => editMode.value === 'DELETE')
const modifyMode = computed(() => createMode.value || deleteMode.value)

watch(editMode, () => {
  page.value = 1
  query()
})

onMounted(() => {
  queryRoleData()
  query()
})

/**
 * 查询
 */
const query = () => {
  if (createMode.value) {
    RoleService.queryRolePermissionUnboundList({
      ...queryConditions,
      roleNo: roleNo.value,
      page: page.value,
      pageSize: pageSize.value
    }).then((response) => {
      tableData.value = response.result['data']
      total.value = response.result['total']
    })
  } else {
    RoleService.queryRolePermissionList({
      ...queryConditions,
      roleNo: roleNo.value,
      page: page.value,
      pageSize: pageSize.value
    }).then((response) => {
      tableData.value = response.result['data']
      total.value = response.result['total']
    })
  }
}

/**
 * 查询角色信息
 */
const queryRoleData = () => {
  RoleService.queryRoleInfo({ roleNo: roleNo.value }).then((response) => {
    roleInfo.value = response.result
  })
}

/**
 * 删除角色权限
 */
const deletePermission = ({ roleNo, permissionNo }) => {
  ElMessageBox.confirm('确定删除吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    RoleService.deleteRolePermission({ roleNo: roleNo, permissionNo: permissionNo }).then(() => {
      ElMessage({ message: '删除成功', type: 'info', duration: 2 * 1000 })
      // 重新查询列表
      query()
    })
  })
}

/**
 * 批量创建角色权限
 */
const createPermissions = () => {
  if (multipleSelection.value.length === 0) {
    ElMessage({ message: '请先勾选权限', type: 'error', duration: 2 * 1000 })
    return
  }
  RoleService.createRolePermissions({
    roleNo: roleNo.value,
    permissionNumberList: multipleSelection.value.map((item) => item.permissionNo)
  }).then(() => {
    // 成功提示
    ElMessage({ message: '批量新增成功', type: 'info', duration: 2 * 1000 })
    // 设置为查询模式
    editMode.value = 'QUERY'
  })
}

/**
 * 批量删除角色权限
 */
const deletePermissions = () => {
  if (multipleSelection.value.length === 0) {
    ElMessage({ message: '请先勾选权限', type: 'error', duration: 2 * 1000 })
    return
  }
  RoleService.deleteRolePermissions({
    roleNo: roleNo.value,
    permissionNumberList: multipleSelection.value.map((item) => item.permissionNo)
  }).then(() => {
    // 成功提示
    ElMessage({ message: '批量删除成功', type: 'info', duration: 2 * 1000 })
    // 设置为查询模式
    editMode.value = 'QUERY'
  })
}

/**
 * 返回上一页
 */
const goBack = () => {
  window.history.length > 1 ? router.go(-1) : router.push('/')
}

/**
 * table handler
 */
const handleSelectionChange = (val) => {
  multipleSelection.value = val
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

:deep(.el-card__header) {
  padding: 10px 10px;
}

:deep(.el-card__body) {
  padding: 10px;
}
</style>
