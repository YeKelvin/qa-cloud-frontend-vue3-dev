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

      <el-form-item label="变量名称：" prop="property.ForInController__iterating_variables">
        <el-input
          v-model="elementInfo.property.ForInController__iterating_variables"
          placeholder="定义迭代变量的名称"
          clearable
          :readonly="queryMode"
        >
          <template #prepend>for</template>
        </el-input>
      </el-form-item>

      <el-form-item label="使用对象：" prop="property.ForInController__use_variable">
        <el-switch
          v-model="elementInfo.property.ForInController__use_variable"
          active-color="#13ce66"
          active-value="true"
          inactive-value="false"
          :disabled="queryMode"
        />
      </el-form-item>

      <el-form-item v-if="useVariable" label="对象名称：" prop="property.ForInController__statements">
        <el-input
          v-model="elementInfo.property.ForInController__statements"
          placeholder="遍历的对象名称"
          clearable
          :readonly="queryMode"
        >
          <template #prepend>in&nbsp;&nbsp;${</template>
          <template #append>}</template>
        </el-input>
      </el-form-item>

      <el-form-item v-else label="遍历代码：" prop="property.ForInController__statements">
        <MonacoEditor
          ref="codeEditorRef"
          v-model="elementInfo.property.ForInController__statements"
          style="height: 100px"
          :read-only="queryMode"
        />
      </el-form-item>

      <!-- 循环延迟时间 -->
      <el-form-item label="延迟时间：" prop="property.ForInController__delay">
        <el-input
          v-model="elementInfo.property.ForInController__delay"
          placeholder="延迟下一个迭代的开始时间"
          clearable
          :readonly="queryMode"
        >
          <template #prepend>delay</template>
          <template #append>ms</template>
        </el-input>
      </el-form-item>

      <!-- 操作按钮 -->
      <el-form-item v-if="queryMode">
        <el-button :icon="Edit" type="primary" @click="editNow()">编 辑</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
      </el-form-item>
      <el-form-item v-else-if="modifyMode">
        <el-button :icon="Check" type="danger" @click="modifyControllerElement()">保 存</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
      </el-form-item>
      <el-form-item v-else-if="createMode">
        <el-button :icon="Check" type="primary" @click="createControllerElement()">保 存</el-button>
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
  elementName: 'For-In Controller',
  elementRemark: '',
  elementType: 'CONTROLLER',
  elementClass: 'ForInController',
  property: {
    ForInController__iterating_variables: '',
    ForInController__statements: '',
    ForInController__use_variable: 'true',
    ForInController__delay: ''
  }
})
const elementFormRules = reactive({
  elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }],
  'property.ForInController__iterating_variables': [{ required: true, message: '变量名称不能为空', trigger: 'blur' }],
  'property.ForInController__statements': [{ required: true, message: '迭代对象或代码不能为空', trigger: 'blur' }],
  'property.ForInController__use_variable': [{ required: true, message: '是否使用对象不能为空', trigger: 'blur' }]
})
const codeEditorRef = ref()
const useVariable = computed(() => elementInfo.value.property.ForInController__use_variable.toLowerCase() === 'true')
watch(useVariable, (val) => {
  if (!val) {
    nextTick(() => {
      codeEditorRef.value && codeEditorRef.value.setValue(elementInfo.value.property.ForInController__statements)
    })
  }
})

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
const modifyControllerElement = async () => {
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
const createControllerElement = async () => {
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
:deep(.el-input-group__prepend) {
  width: 80px;
}

:deep(.el-input-group__append) {
  width: 60px;
}
</style>
