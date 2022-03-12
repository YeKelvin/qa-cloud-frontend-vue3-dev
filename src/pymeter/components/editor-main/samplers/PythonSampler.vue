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

      <!-- 说明 -->
      <el-form-item label="内置变量：">
        <span style="display: inline-flex; flex-wrap: wrap; align-items: center">
          <el-tag size="small" style="margin-right: 10px">log</el-tag>
          <el-tag size="small" style="margin-right: 10px">ctx</el-tag>
          <el-tag size="small" style="margin-right: 10px">vars</el-tag>
          <el-tag size="small" style="margin-right: 10px">props</el-tag>
          <el-tag size="small" style="margin-right: 10px">prev</el-tag>
          <el-tag size="small" style="margin-right: 10px">result</el-tag>
        </span>
      </el-form-item>

      <!-- 元素脚本 -->
      <MonacoEditor
        ref="codeEditorRef"
        v-model="elementInfo.property.PythonSampler__script"
        language="python"
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
import * as ElementService from '@/api/script/element'
import editorProps from '@/pymeter/composables/editor.props'
import useEditor from '@/pymeter/composables/useEditor'
import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'

const props = defineProps(editorProps)
const { queryMode, modifyMode, createMode, editNow, setReadonly, updateTabName, closeTab, refreshElementTree } =
  useEditor(props)
const elformRef = ref()
const elementNo = ref(props.editorNo)
const elementInfo = ref({
  elementName: 'Python Sampler',
  elementRemark: '',
  elementType: 'SAMPLER',
  elementClass: 'PythonSampler',
  property: {
    PythonSampler__script: ''
  }
})
const elementFormRules = reactive({
  elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }]
})
const codeEditorRef = ref()

onMounted(() => {
  // 查询或更新模式时，先拉取元素信息
  if (createMode.value) return
  ElementService.queryElementInfo({ elementNo: elementNo.value }).then((response) => {
    elementInfo.value = response.result
    codeEditorRef.value.setValue(response.result.property.PythonSampler__script)
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
:deep(.el-textarea.is-disabled .el-textarea__inner) {
  cursor: auto;
}
</style>
