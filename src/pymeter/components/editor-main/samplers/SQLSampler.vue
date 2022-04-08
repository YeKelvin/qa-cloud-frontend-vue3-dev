<template>
  <div class="pymeter-component-container">
    <el-form
      ref="elformRef"
      label-position="right"
      label-width="120px"
      style="width: 100%"
      inline-message
      :model="elementInfo"
      :rules="elementFormRules"
    >
      <!-- 元素名称 -->
      <el-form-item label="名称：" prop="elementName">
        <el-input v-model="elementInfo.elementName" placeholder="元素名称" clearable :readonly="queryMode" />
      </el-form-item>

      <!-- 元素备注 -->
      <el-form-item label="备注：" prop="elementRemark">
        <el-input v-model="elementInfo.elementRemark" placeholder="元素备注" clearable :readonly="queryMode" />
      </el-form-item>

      <!-- 数据库引擎下拉框 -->
      <el-form-item label="数据库引擎：" prop="property.engineNo">
        <el-select v-model="elementInfo.property.engineNo" style="width: 100%" :disabled="queryMode">
          <el-option v-for="item in engineList" :key="item.configNo" :label="item.configName" :value="item.configNo">
            <span class="database-type-option">
              <span>{{ item.configName }}</span>
              <el-tag type="danger" size="small">{{ DatabaseType[item.databaseType] }}</el-tag>
            </span>
          </el-option>
        </el-select>
      </el-form-item>

      <!-- 结果变量名称 -->
      <el-form-item label="结果名称：" prop="property.SQLSampler__result_name">
        <el-input
          v-model="elementInfo.property.SQLSampler__result_name"
          placeholder="查询结果变量名称，默认：rows"
          clearable
          :readonly="queryMode"
        />
      </el-form-item>

      <!-- 超时时间 -->
      <el-form-item label="超时时间：" prop="property.SQLSampler__query_timeout">
        <el-input
          v-model="elementInfo.property.SQLSampler__query_timeout"
          placeholder="查询超时时间，默认：10000"
          clearable
          :readonly="queryMode"
        >
          <template #append>ms</template>
        </el-input>
      </el-form-item>

      <!-- SQL语句 -->
      <MonacoEditor
        ref="codeEditorRef"
        v-model="elementInfo.property.SQLSampler__statement"
        language="sql"
        :read-only="queryMode"
      />

      <!-- 操作按钮 -->
      <el-form-item v-if="queryMode">
        <el-button :icon="Edit" type="primary" @click="editNow()">编 辑</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
      </el-form-item>
      <el-form-item v-else-if="modifyMode">
        <el-button :icon="Check" type="danger" @click="modifySamplerElement()">保 存</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
      </el-form-item>
      <el-form-item v-else-if="createMode">
        <el-button :icon="Check" type="primary" @click="createSamplerElement()">保 存</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { Check, Close, Edit } from '@element-plus/icons-vue'
import { DatabaseType } from '@/api/enum'
import * as ElementService from '@/api/script/element'
import * as DatabaseService from '@/api/script/database'
import editorProps from '@/pymeter/composables/editor.props'
import useEditor from '@/pymeter/composables/useEditor'
import useWorkspaceState from '@/composables/useWorkspaceState'
import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'

const props = defineProps(editorProps)
const { workspaceNo } = useWorkspaceState()
const { queryMode, modifyMode, createMode, editNow, setReadonly, updateTabName, closeTab, refreshElementTree } =
  useEditor(props)
const elformRef = ref()
const elementNo = ref(props.editorNo)
const elementInfo = ref({
  elementName: 'SQL Sampler',
  elementRemark: '',
  elementType: 'SAMPLER',
  elementClass: 'SQLSampler',
  property: {
    engineNo: '',
    SQLSampler__statement: '',
    SQLSampler__result_name: '',
    SQLSampler__query_timeout: ''
  }
})
const elementFormRules = reactive({
  elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }],
  'property.engineNo': [{ required: true, message: '数据库引擎编号不能为空', trigger: 'blur' }],
  'property.SQLSampler__statement': [{ required: true, message: 'SQL不能为空', trigger: 'blur' }]
})
const engineList = ref([])
const codeEditorRef = ref()

onMounted(() => {
  // 查询所有数据库引擎
  DatabaseService.queryDatabaseEngineAll({ workspaceNo: workspaceNo.value }).then((response) => {
    engineList.value = response.result
  })

  // 查询或更新模式时，先拉取元素信息
  if (createMode.value) return
  ElementService.queryElementInfo({ elementNo: elementNo.value }).then((response) => {
    elementInfo.value = response.result
    codeEditorRef.value.setValue(response.result.property.SQLSampler__statement)
  })
})

/**
 * 修改元素信息
 */
const modifySamplerElement = async () => {
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
  await ElementService.modifyElement({ elementNo: elementNo.value, ...elementInfo.value })
  // 成功提示
  ElMessage({ message: '修改元素成功', type: 'info', duration: 2 * 1000 })
  // 修改tab标题
  updateTabName(elementInfo.value.elementName)
  // 重新查询脚本列表
  refreshElementTree()
  // 设置为只读模式
  setReadonly()
}

/**
 * 创建元素
 */
const createSamplerElement = async () => {
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
  await ElementService.createElementChildren({
    rootNo: props.metadata.rootNo,
    parentNo: props.metadata.parentNo,
    children: [elementInfo.value]
  })
  //  成功提示
  ElMessage({ message: '新增元素成功', type: 'info', duration: 2 * 1000 })
  // 关闭tab
  closeTab()
  // 重新查询脚本列表
  refreshElementTree()
}
</script>

<style lang="scss" scoped>
.database-type-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-textarea.is-disabled .el-textarea__inner) {
  cursor: auto;
}
</style>
