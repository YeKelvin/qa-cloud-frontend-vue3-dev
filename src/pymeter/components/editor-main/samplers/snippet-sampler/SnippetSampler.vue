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

      <!-- 片段列表 -->
      <el-form-item label="片段引用：" prop="property.snippetNo">
        <el-select
          v-model="elementInfo.property.snippetNo"
          placeholder="脚本片段"
          style="width: 100%"
          :disabled="queryMode"
        >
          <el-option
            v-for="snippet in snippets"
            :key="snippet.elementNo"
            :label="snippet.elementName"
            :value="snippet.elementNo"
          />
        </el-select>
      </el-form-item>

      <!-- 是否使用默认值 -->
      <el-form-item label="使用默认值：">
        <el-switch
          v-model="elementInfo.property.useDefault"
          active-color="#13ce66"
          active-value="true"
          inactive-value="false"
          :disabled="queryMode"
        />
      </el-form-item>

      <!-- 变更警告 -->
      <template v-if="showWarning && !useDefault">
        <el-tag type="danger" style="margin-bottom: 10px">重要提醒：片段参数定义已发生变更，请重新编辑</el-tag>
      </template>

      <!-- 设置类 Tabs -->
      <el-tabs v-model="activeTabName">
        <el-tab-pane label="请求参数" name="PARAMS" />
      </el-tabs>

      <!-- 参数设置 -->
      <div v-if="showParams">
        <ArgumentTable :data="argumentsData" :use-default="useDefault" :edit-mode="editMode" />
      </div>

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
import { differenceBy as _differenceBy } from 'lodash-es'
import { isBlank } from '@/utils/string-util'
import editorProps from '@/pymeter/composables/editor.props'
import useEditor from '@/pymeter/composables/useEditor'
import ArgumentTable from './SnippetSamplerArgumentTable.vue'
import * as ElementService from '@/api/script/element'

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
  refreshElementTree
} = useEditor(props)
const elformRef = ref()
const elementNo = ref(props.editorNo)
const elementInfo = ref({
  elementName: 'Snippet Sampler',
  elementRemark: '',
  elementType: 'SAMPLER',
  elementClass: 'SnippetSampler',
  property: {
    snippetNo: '',
    arguments: [],
    useDefault: 'false'
  }
})
const elementFormRules = reactive({
  elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }],
  'property.snippetNo': [{ required: true, message: '片段不能为空', trigger: 'blur' }]
})
const activeTabName = ref('PARAMS')
const snippets = ref([])
const argumentsData = ref([])
const showWarning = ref(false)
const showParams = computed(() => activeTabName.value === 'PARAMS')
const useDefault = computed(() => elementInfo.value.property.useDefault === 'true')

watch(
  () => elementInfo.value.property.snippetNo,
  (val) => {
    if (!val) return
    // 清空原有的参数
    argumentsData.value = []
    // 查询选中的片段信息
    querySnippet(val)
  }
)

onMounted(() => {
  querySnippets()
  // 查询或更新模式时，先拉取元素信息
  if (createMode.value) return
  ElementService.queryElementInfo({ elementNo: elementNo.value }).then((response) => {
    elementInfo.value = response.result
    if (!elementInfo.value.property.arguments) {
      elementInfo.value.property.arguments = []
    }
  })
})

/**
 * 根据工作空间编号查询所有片段
 */
const querySnippets = () => {
  ElementService.queryElementAll({
    workspaceNo: props.metadata.workspaceNo,
    elementType: 'COLLECTION',
    elementClass: 'SnippetCollection'
  }).then((response) => {
    snippets.value = response.result
  })
}

/**
 * 根据元素编号查询片段详情
 */
const querySnippet = (snippetNo) => {
  ElementService.queryElementInfo({ elementNo: snippetNo }).then((response) => {
    // 将片段参数定义添加至表格
    response.result.property.parameters.forEach((item) => {
      argumentsData.value.push({
        name: item.name,
        value: item.default,
        desc: item.desc,
        default: item.default
      })
    })
    // 非新增模式下，将请求参数合并至表格中，如果请求参数不在片段参数定义中，则丢弃
    if (!createMode.value) {
      argumentsData.value.forEach((item) => {
        const arg = elementInfo.value.property.arguments.find((i) => i.name === item.name)
        if (arg) {
          item.value = arg.value
        }
      })
    }
    // 将请求参数合并至表格中，如果片段参数定义（对称差集）有变更，则给出提示
    if (queryMode.value) {
      if (argumentsData.value.length !== elementInfo.value.property.arguments.length) {
        showWarning.value = true
      }
      const leftDiff = _differenceBy(argumentsData.value, elementInfo.value.property.arguments, 'name')
      const rightDiff = _differenceBy(elementInfo.value.property.arguments, argumentsData.value, 'name')
      if (leftDiff.length > 0 || rightDiff.length > 0) {
        showWarning.value = true
      }
    }
  })
}

/**
 * 修改元素
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
  // 设置元素属性
  setElementProperty()
  // 校验参数
  if (!checkParameter()) return
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
  // 隐藏警告
  showWarning.value = false
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
  // 设置元素属性
  setElementProperty()
  // 校验参数
  if (!checkParameter()) return
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

// 设置元素属性
const setElementProperty = () => {
  if (useDefault.value) return
  elementInfo.value.property.arguments = argumentsData.value.map((item) => ({
    name: item.name,
    value: item.value
  }))
}

// 校验参数值是否为空
const checkParameter = () => {
  let pass = true
  elementInfo.value.property.arguments.forEach((item) => {
    if (isBlank(item.value)) {
      pass = false
      return
    }
  })
  if (!pass) ElMessage({ message: '参数值不能为空', type: 'error' })
  return pass
}
</script>

<style lang="scss" scoped></style>
