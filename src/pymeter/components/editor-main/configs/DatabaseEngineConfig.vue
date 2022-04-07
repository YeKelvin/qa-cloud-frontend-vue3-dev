<template>
  <div class="pymeter-component-container">
    <el-form
      ref="elformRef"
      label-position="right"
      label-width="120px"
      style="width: 100%"
      inline-message
      :model="engineInfo"
      :rules="engineFormRules"
    >
      <!-- 名称 -->
      <el-form-item label="配置名称：" prop="configName">
        <el-input v-model="engineInfo.configName" placeholder="配置名称" clearable :readonly="queryMode" />
      </el-form-item>

      <!-- 备注 -->
      <el-form-item label="配置备注：" prop="configDesc">
        <el-input v-model="engineInfo.configDesc" placeholder="配置备注" clearable :readonly="queryMode" />
      </el-form-item>

      <!-- 变量名称 -->
      <el-form-item label="变量名称：" prop="variableName">
        <el-input v-model="engineInfo.variableName" placeholder="变量名称" clearable :readonly="queryMode" />
      </el-form-item>

      <!-- 数据库类型 -->
      <el-form-item label="数据库类型：" prop="databaseType">
        <el-select v-model="engineInfo.databaseType" :disabled="queryMode" style="width: 100%">
          <el-option label="Oracle" value="ORACLE" />
          <el-option label="MySQL" value="MYSQL" />
          <el-option label="PostgreSQL" value="POSTGRESQL" />
          <el-option label="Microsoft SQL Server" value="Microsoft_SQL_SERVER" />
        </el-select>
      </el-form-item>

      <!-- 用户名称 -->
      <el-form-item label="用户名称：" prop="username">
        <el-input v-model="engineInfo.username" placeholder="用户名称" clearable :readonly="queryMode" />
      </el-form-item>

      <!-- 用户密码 -->
      <el-form-item label="用户密码：" prop="password">
        <el-input v-model="engineInfo.password" placeholder="用户密码" clearable :readonly="queryMode" />
      </el-form-item>

      <!-- 数据库地址 -->
      <el-form-item label="主机：" prop="host">
        <el-input v-model="engineInfo.host" placeholder="数据库地址" clearable :readonly="queryMode" />
      </el-form-item>

      <!-- 数据库端口 -->
      <el-form-item label="端口：" prop="port">
        <el-input v-model="engineInfo.port" placeholder="数据库端口" clearable :readonly="queryMode" />
      </el-form-item>

      <!-- 连接串query参数 -->
      <el-form-item label="连接参数：" prop="query">
        <el-input v-model="engineInfo.query" placeholder="连接串 query 参数" clearable :readonly="queryMode" />
      </el-form-item>

      <!-- 库名 -->
      <el-form-item label="库名：" prop="database">
        <el-input v-model="engineInfo.database" placeholder="库名" clearable :readonly="queryMode" />
      </el-form-item>

      <!-- 超时时间 -->
      <el-form-item label="超时时间：" prop="connectTimeout">
        <el-input v-model="engineInfo.connectTimeout" placeholder="连接超时时间（ms）" clearable :readonly="queryMode">
          <template #append>ms</template>
        </el-input>
      </el-form-item>

      <!-- 操作按钮 -->
      <el-form-item v-if="queryMode">
        <el-button :icon="Edit" type="primary" @click="editNow()">编 辑</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
      </el-form-item>
      <el-form-item v-else-if="modifyMode">
        <el-button :icon="Check" type="danger" @click="modifyDatabaseEngine()">保 存</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
      </el-form-item>
      <el-form-item v-else-if="createMode">
        <el-button :icon="Check" type="primary" @click="createDatabaseEngine()">保 存</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { isEmpty } from 'lodash-es'
import { ElMessage } from 'element-plus'
import { Check, Close, Edit } from '@element-plus/icons-vue'
import editorProps from '@/pymeter/composables/editor.props'
import useEditor from '@/pymeter/composables/useEditor'
import useWorkspaceState from '@/composables/useWorkspaceState'
import * as DatabaseService from '@/api/script/database'

const props = defineProps(editorProps)
const { queryMode, modifyMode, createMode, editNow, setReadonly, updateTabName, closeTab, queryDatabaseEngineAll } =
  useEditor(props)
const { workspaceNo } = useWorkspaceState()
const elformRef = ref()
const configNo = ref(props.editorNo)
const engineInfo = ref({
  configName: 'DatabaseEngine',
  configDesc: '',
  databaseType: '',
  username: '',
  password: '',
  host: '',
  port: '',
  query: '',
  database: '',
  connectTimeout: '10000',
  variableName: ''
})
const engineFormRules = reactive({
  configName: [{ required: true, message: '配置名称不能为空', trigger: 'blur' }],
  variableName: [{ required: true, message: '变量名称不能为空', trigger: 'blur' }],
  databaseType: [{ required: true, message: '数据库类型不能为空', trigger: 'blur' }],
  username: [{ required: true, message: '用户名称不能为空', trigger: 'blur' }],
  password: [{ required: true, message: '用户密码不能为空', trigger: 'blur' }],
  host: [{ required: true, message: '主机不能为空', trigger: 'blur' }],
  port: [{ required: true, message: '端口不能为空', trigger: 'blur' }],
  database: [{ required: true, message: '库名不能为空', trigger: 'blur' }]
})

watch(
  () => engineInfo.value.databaseType,
  (val) => {
    if (val === 'ORACLE') {
      engineInfo.value.port = '1521'
      return
    }
    if (val === 'MYSQL') {
      engineInfo.value.port = '3306'
      return
    }
    if (val === 'POSTGRESQL') {
      engineInfo.value.port = '5432'
      return
    }
    if (val === 'Microsoft_SQL_SERVER') {
      engineInfo.value.port = '1433'
      return
    }
  }
)

onMounted(() => {
  // 查询或更新模式时，先拉取元素信息
  if (createMode.value) return
  DatabaseService.queryDatabaseEngineInfo({ configNo: configNo.value }).then((response) => {
    engineInfo.value = response.result
  })
})

/**
 * 修改元素
 */
const modifyDatabaseEngine = async () => {
  // 表单校验
  const error = await elformRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  if (error) {
    ElMessage({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
    return
  }
  // 修改元素
  await DatabaseService.modifyDatabaseEngine({ configNo: configNo.value, ...engineInfo.value })
  // 成功提示
  ElMessage({ message: '修改成功', type: 'info', duration: 2 * 1000 })
  // 修改tab标题
  updateTabName(engineInfo.value.configName)
  // 重新查询数据库引擎列表
  queryDatabaseEngineAll()
  // 设置为只读模式
  setReadonly()
}

/**
 * 创建元素
 */
const createDatabaseEngine = async () => {
  // 工作空间非空校验
  if (isEmpty(workspaceNo.value)) {
    ElMessage({ message: '请先选择工作空间', type: 'error', duration: 2 * 1000 })
    return
  }
  // 表单校验
  const error = await elformRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  if (error) {
    ElMessage({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
    return
  }
  // 新增元素
  await DatabaseService.createDatabaseEngine({ workspaceNo: workspaceNo.value, ...engineInfo.value })
  // 成功提示
  ElMessage({ message: '新增成功', type: 'info', duration: 2 * 1000 })
  // 关闭tab
  closeTab()
  // 重新查询数据库引擎列表
  queryDatabaseEngineAll()
}
</script>

<style lang="scss" scoped></style>
