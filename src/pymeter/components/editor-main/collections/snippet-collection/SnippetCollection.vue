<template>
  <div class="pymeter-component-container">
    <el-form
      ref="elformRef"
      label-position="right"
      label-width="100px"
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

      <!-- 设置类 Tabs -->
      <el-tabs v-model="activeTabName">
        <el-tab-pane name="PARAMETERS">
          <template #label>
            <el-badge :hidden="isEmpty(parametersData)" type="success" is-dot>参数定义</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="HTTP_SETTINGS">
          <template #label>
            <el-badge :hidden="elementInfo.property.useHTTPSession === 'false'" type="success" is-dot>
              HTTP配置
            </el-badge>
          </template>
        </el-tab-pane>
      </el-tabs>

      <!-- 参数设置 -->
      <div v-if="showParametersTab">
        <ParameterTable :data="parametersData" :edit-mode="editMode" />
      </div>

      <!-- HTTP 设置 -->
      <div v-if="showHttpSettingsTab">
        <!-- 是否使用 HTTP 会话 -->
        <el-form-item label="使用会话：">
          <el-switch
            v-model="elementInfo.property.useHTTPSession"
            active-color="#13ce66"
            active-value="true"
            inactive-value="false"
            :disabled="queryMode"
          />
        </el-form-item>
      </div>

      <!-- 操作按钮 -->
      <el-form-item v-if="queryMode">
        <el-button :icon="Edit" type="primary" @click="editNow()">编 辑</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
        <template v-if="!isEmpty(argumentsData)">
          <el-button type="danger" @click="showArgumentsDialog = true">
            <SvgIcon icon-name="pymeter-send" style="margin-right: 5px" />
            运 行
          </el-button>
        </template>
        <template v-else>
          <el-dropdown
            split-button
            trigger="click"
            type="danger"
            style="margin-left: 10px"
            placement="bottom"
            @click="executeSnippetCollection()"
          >
            <SvgIcon icon-name="pymeter-send" style="margin-right: 5px" />
            <span style="margin-left: 5px">运 行</span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="querySnippetsJson()">查看JSON</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-form-item>
      <el-form-item v-else-if="modifyMode">
        <el-button :icon="Check" type="danger" @click="modifyCollectionElement()">保 存</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
      </el-form-item>
      <el-form-item v-else-if="createMode">
        <el-button :icon="Check" type="primary" @click="createCollectionElement()">保 存</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
      </el-form-item>
    </el-form>

    <el-dialog v-model="showArgumentsDialog" width="60%" center>
      <template #title>
        <span style="color: #606266; font-family: inherit">设置片段参数</span>
      </template>

      <template #default>
        <ArgumentTable :data="argumentsData" />
        <el-tag type="danger" style="margin-top: 10px">注意：片段参数不支持函数</el-tag>
      </template>

      <template #footer>
        <el-button style="margin-right: 10px" :icon="Close" @click="showArgumentsDialog = false">取 消</el-button>
        <el-dropdown trigger="click" type="danger" placement="bottom" split-button @click="executeCollection()">
          <SvgIcon icon-name="pymeter-send" style="margin-right: 5px" />
          <span>运 行</span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="querySnippetsJson()">查看JSON</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </el-dialog>

    <el-dialog v-model="showJsonScriptDialog" title="Json脚本" width="80%" center>
      <MonacoEditor ref="jsonEditorRef" language="json" style="height: 400px" :read-only="true" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { Check, Close, Edit } from '@element-plus/icons-vue'
import { isEmpty } from 'lodash-es'
import { isBlank, isBlankAll } from '@/utils/string-util'
import * as ElementService from '@/api/script/element'
import * as ExecutionService from '@/api/script/execution'
import editorProps from '@/pymeter/composables/editor.props'
import useEditor from '@/pymeter/composables/useEditor'
import useWorkspaceState from '@/composables/useWorkspaceState'
import usePyMeterState from '@/pymeter/composables/usePyMeterState'
import useRunnableElement from '@/pymeter/composables/useRunnableElement'
import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'
import ArgumentTable from './SnippetCollectionArgumentTable.vue' // 实参
import ParameterTable from './SnippetCollectionParameterTable.vue' // 形参

const props = defineProps(editorProps)
const {
  editMode,
  queryMode,
  modifyMode,
  createMode,
  editNow,
  setReadonly,
  updateTabName,
  closeTab,
  refreshCollections,
  addSelectedCollectionNumberedList,
  scrollToElementTreeBottom
} = useEditor(props)
const { workspaceNo } = useWorkspaceState()
const { selectedDatasetNumberList, useCurrentValue } = usePyMeterState()
const elformRef = ref()
const elementNo = ref(props.editorNo)
const elementInfo = ref({
  elementName: 'Snippet',
  elementRemark: '',
  elementType: 'COLLECTION',
  elementClass: 'SnippetCollection',
  property: {
    parameters: [],
    useHTTPSession: 'false'
  }
})
const elementFormRules = reactive({
  elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }]
})
const activeTabName = ref('PARAMETERS')
const parametersData = ref([]) // 形参
const argumentsData = ref([]) // 实参
const showArgumentsDialog = ref(false)
const showJsonScriptDialog = ref(false)
const jsonEditorRef = ref()
const showParametersTab = computed(() => activeTabName.value === 'PARAMETERS')
const showHttpSettingsTab = computed(() => activeTabName.value === 'HTTP_SETTINGS')
const additionalVariables = computed(() => {
  if (argumentsData.value.length === 0) return {}
  const vars = {}
  argumentsData.value.forEach((item) => {
    vars[item.name] = item.default
  })
  return vars
})

onMounted(() => {
  // 查询或更新模式时，先拉取元素信息
  if (createMode.value) return
  ElementService.queryElementInfo({ elementNo: elementNo.value }).then((response) => {
    elementInfo.value = response.result
    parametersData.value = response.result.property.parameters
    argumentsData.value = response.result.property.parameters
  })
})

/**
 * 修改元素信息
 */
const modifyCollectionElement = async () => {
  // 表单校验
  const error = await elformRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  if (error) {
    ElMessage({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
    return
  }
  // 更新元素属性
  updateElementProperty()
  // 校验参数名称不能为空
  if (!checkParameter()) return
  // 修改元素
  await ElementService.modifyElement({ elementNo: elementNo.value, ...elementInfo.value })
  // 成功提示
  ElMessage({ message: '修改元素成功', type: 'info', duration: 2 * 1000 })
  // 修改tab标题
  updateTabName(elementInfo.value.elementName)
  // 重新查询集合列表
  refreshCollections()
  // 设置为只读模式
  setReadonly()
}

/**
 * 创建元素
 */
const createCollectionElement = async () => {
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
  // 更新元素属性
  updateElementProperty()
  // 校验参数名称不能为空
  if (!checkParameter()) return
  // 新增元素
  const response = await ElementService.createCollection({ workspaceNo: workspaceNo.value, ...elementInfo.value })
  // 成功提示
  ElMessage({ message: '新增元素成功', type: 'info', duration: 2 * 1000 })
  // 关闭tab
  closeTab()
  // 重新查询集合列表
  refreshCollections()
  // 新增成功后立即在列表中展示
  addSelectedCollectionNumberedList(response.result.elementNo)
  // 滚动至底部
  scrollToElementTreeBottom()
}

/**
 * 更新元素属性
 */
const updateElementProperty = () => {
  elementInfo.value.property.parameters = parametersData.value.filter(
    (item) => !isBlankAll(item.name, item.default, item.desc)
  )
}

/**
 * 校验参数名称是否为空
 */
const checkParameter = () => {
  let pass = true
  elementInfo.value.property.parameters.forEach((item) => {
    if (isBlank(item.name)) {
      pass = false
      return
    }
  })
  if (!pass) ElMessage({ message: '参数名称不能为空', type: 'error' })
  return pass
}

/**
 * 根据 collectionNo 执行脚本
 */
const executeCollection = async () => {
  showArgumentsDialog.value = false
  await executeSnippetCollection(additionalVariables.value)
}

/**
 * 查看 Json 脚本
 */
const querySnippetsJson = () => {
  showArgumentsDialog.value = false
  ExecutionService.querySnippetsJson({
    collectionNo: elementNo.value,
    dataSetNumberList: selectedDatasetNumberList.value,
    useCurrentValue: useCurrentValue.value,
    variables: additionalVariables.value
  }).then((response) => {
    showJsonScriptDialog.value = true
    nextTick(() => {
      jsonEditorRef.value.setValue(JSON.stringify(response.result))
      setTimeout(() => {
        jsonEditorRef.value.formatDocument()
      }, 200)
    })
  })
}

const { executeSnippetCollection } = useRunnableElement(elementNo.value)
</script>

<style lang="scss" scoped>
:deep(.el-badge__content) {
  top: 20px;
}

:deep(.el-badge__content.is-fixed.is-dot) {
  right: -4px;
}
</style>
