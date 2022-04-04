<template>
  <div class="pymeter-component-container">
    <el-form
      ref="elformRef"
      label-position="right"
      label-width="100px"
      style="width: 100%"
      inline-message
      :model="databaseInfo"
      :rules="databaseFormRules"
    >
      <!-- 名称 -->
      <el-form-item label="名称：" prop="databaseName">
        <el-input v-model="databaseInfo.databaseName" placeholder="数据库名称" clearable :readonly="queryMode" />
      </el-form-item>

      <!-- 备注 -->
      <el-form-item label="备注：" prop="databaseDesc">
        <el-input v-model="databaseInfo.databaseDesc" placeholder="数据库备注" clearable :readonly="queryMode" />
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
const databaseNo = ref(props.editorNo)
const databaseInfo = ref({
  databaseName: 'DatabaseEngine',
  databaseDesc: '',
  databaseType: '',
  variableName: '',
  driverName: '',
  username: '',
  password: '',
  host: '',
  port: '',
  query: '',
  database: '',
  connectTimeout: '10000'
})
const databaseFormRules = reactive({
  elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }]
})

onMounted(() => {
  // 查询或更新模式时，先拉取元素信息
  if (createMode.value) return
  DatabaseService.queryDatabaseEngineInfo({ databaseNo: databaseNo.value }).then((response) => {
    databaseInfo.value = response.result
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
  await DatabaseService.modifyDatabaseEngine({ databaseNo: databaseNo.value, ...databaseInfo.value })
  // 成功提示
  ElMessage({ message: '修改成功', type: 'info', duration: 2 * 1000 })
  // 修改tab标题
  updateTabName(databaseInfo.value.databaseName)
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
  await DatabaseService.createDatabaseEngine({ workspaceNo: workspaceNo.value, ...databaseInfo.value })
  // 成功提示
  ElMessage({ message: '新增成功', type: 'info', duration: 2 * 1000 })
  // 关闭tab
  closeTab()
  // 重新查询数据库引擎列表
  queryDatabaseEngineAll()
}
</script>

<style lang="scss" scoped></style>
