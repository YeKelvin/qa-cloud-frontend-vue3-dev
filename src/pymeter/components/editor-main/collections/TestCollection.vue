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

      <!-- 元素属性 -->
      <el-form-item label="顺序执行：" prop="property.TestCollection__serialize_groups">
        <el-switch
          v-model="elementInfo.property.TestCollection__serialize_groups"
          active-color="#13ce66"
          active-value="true"
          inactive-value="false"
          :disabled="true"
        />
      </el-form-item>

      <!-- 间隔时间 -->
      <el-form-item label="间隔时间：" prop="property.TestCollection__delay">
        <el-input
          v-model="elementInfo.property.TestCollection__delay"
          placeholder="间隔运行时间"
          clearable
          :disabled="true"
        >
          <template #append>ms</template>
        </el-input>
      </el-form-item>

      <!-- 操作按钮 -->
      <el-form-item v-if="queryMode">
        <el-button :icon="Edit" type="primary" @click="editNow()">编 辑</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
        <el-dropdown
          split-button
          trigger="click"
          type="danger"
          placement="bottom"
          style="margin-left: 10px"
          @click="executeTestCollection()"
        >
          <SvgIcon icon-name="pymeter-send" style="margin-right: 5px" />
          <span>运 行</span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="queryCollectionJson()">查看JSON</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
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

    <el-dialog v-model="showJsonScriptDialog" center title="Json脚本" width="80%">
      <MonacoEditor ref="jsonEditorRef" language="json" style="height: 400px" :read-only="true" />
    </el-dialog>
  </div>
</template>

<script setup>
import { isEmpty } from 'lodash-es'
import { ElMessage } from 'element-plus'
import { Check, Close, Edit } from '@element-plus/icons-vue'
import * as ElementService from '@/api/script/element'
import * as ExecutionService from '@/api/script/execution'
import editorProps from '@/pymeter/composables/editor.props'
import useEditor from '@/pymeter/composables/useEditor'
import useWorkspaceState from '@/composables/useWorkspaceState'
import usePyMeterState from '@/pymeter/composables/usePyMeterState'
import useRunnableElement from '@/pymeter/composables/useRunnableElement'
import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'

const props = defineProps(editorProps)
const {
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
  elementName: 'Collection',
  elementRemark: '',
  elementType: 'COLLECTION',
  elementClass: 'TestCollection',
  property: {
    TestCollection__serialize_groups: 'true',
    TestCollection__delay: '0'
  }
})
const elementFormRules = reactive({
  elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }]
})
const showJsonScriptDialog = ref(false)
const jsonEditorRef = ref()

onMounted(() => {
  // 查询或更新模式时，先拉取元素信息
  if (createMode.value) return
  ElementService.queryElementInfo({ elementNo: elementNo.value }).then((response) => {
    elementInfo.value = response.result
  })
})

/**
 * 修改元素
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
 * 查看 Json 脚本
 */
const queryCollectionJson = () => {
  ExecutionService.queryCollectionJson({
    collectionNo: elementNo.value,
    datasetNumberedList: selectedDatasetNumberList.value,
    useCurrentValue: useCurrentValue.value
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

const { executeTestCollection } = useRunnableElement(elementNo.value)
</script>

<style lang="scss" scoped></style>
