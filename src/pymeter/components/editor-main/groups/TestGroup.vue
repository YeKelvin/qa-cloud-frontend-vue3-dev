<template>
  <div class="pymeter-component-container">
    <el-form
      ref="elformRef"
      label-position="right"
      label-width="140px"
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
      <el-form-item label="失败时的处理：" prop="property.TestGroup__on_sample_error">
        <el-select v-model="elementInfo.property.TestGroup__on_sample_error" :disabled="queryMode" style="width: 100%">
          <el-option label="继续" value="continue" />
          <el-option label="开始下一个主控制器的循环" value="start_next_coroutine" />
          <el-option label="开始下一个当前控制器的循环" value="start_next_current_loop" />
          <el-option label="中断当前控制器的循环" value="break_current_loop" />
          <el-option label="停止主控制器" value="stop_test_group" />
          <el-option label="停止测试" value="stop_test" />
          <el-option label="立即停止测试" value="stop_test_now" />
        </el-select>
      </el-form-item>

      <el-form-item label="并发数：" prop="property.TestGroup__number_groups">
        <el-input v-model="elementInfo.property.TestGroup__number_groups" clearable disabled />
      </el-form-item>
      <el-form-item label="循环次数：" prop="property.TestGroup__main_controller.property.LoopController__loops">
        <el-input
          v-model="elementInfo.property.TestGroup__main_controller.property.LoopController__loops"
          clearable
          disabled
        />
      </el-form-item>

      <!-- 设置类 Tabs -->
      <el-tabs v-model="activeTabName">
        <el-tab-pane name="HTTP">
          <template #label>
            <el-badge :hidden="hiddenConfigDot" type="success" is-dot>HTTP配置</el-badge>
          </template>
        </el-tab-pane>
      </el-tabs>

      <!-- HTTP 设置 -->
      <div v-if="showHttpSettings">
        <!-- 是否使用 HTTP 会话 -->
        <el-form-item label="使用会话：">
          <el-switch v-model="useHTTPSession" active-color="#13ce66" :disabled="queryMode" />
        </el-form-item>
        <!-- 是否在每次迭代开始前重新打开一个新的 HTTP 会话 -->
        <el-form-item label="迭代时刷新会话：">
          <el-switch
            v-model="clearEachIteration"
            active-color="#13ce66"
            active-value="true"
            inactive-value="false"
            :disabled="queryMode"
          />
        </el-form-item>
      </div>

      <!-- 操作按钮 -->
      <el-form-item v-if="queryMode">
        <el-button :icon="Edit" type="primary" @click="editNow">编 辑</el-button>
        <el-button :icon="Close" @click="closeTab">关 闭</el-button>
        <el-dropdown
          split-button
          trigger="click"
          type="danger"
          placement="bottom"
          style="margin-left: 10px"
          @click="executeTestGroup(false)"
        >
          <el-icon><Pointer /></el-icon>
          <span style="margin-left: 5px">运 行</span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="executeTestGroup(true)">独立运行</el-dropdown-item>
              <el-dropdown-item @click="queryGroupJson()">查看JSON</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-form-item>
      <el-form-item v-else-if="modifyMode">
        <el-button :icon="Check" type="danger" @click="modifyGroupElement()">保 存</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
      </el-form-item>
      <el-form-item v-else-if="createMode">
        <el-button :icon="Check" type="primary" @click="createGroupElement()">保 存</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
      </el-form-item>
    </el-form>

    <el-dialog v-model="showJsonScriptDialog" center title="Json脚本" width="80%">
      <MonacoEditor ref="jsonEditorRef" language="json" style="height: 300px" :read-only="true" />
    </el-dialog>
  </div>
</template>

<script setup>
import { isEmpty as _isEmpty, assign as _assign } from 'lodash-es'
import { ElMessage } from 'element-plus'
import { Check, Close, Edit, Pointer } from '@element-plus/icons-vue'
import * as ElementService from '@/api/script/element'
import editorProps from '@/pymeter/composables/editor.props'
import useEditor from '@/pymeter/composables/useEditor'
import useRunnableElement from '@/pymeter/composables/useRunnableElement'
import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'

const checkLoops = (_, value, callback) => {
  if (!value) {
    return callback(new Error('循环次数不能为空'))
  }
  const val = parseInt(value)
  if (!Number.isInteger(val)) {
    return callback(new Error('循环次数必须为整数'))
  } else {
    if (val < 1 || val > 999) {
      return callback(new Error('循环次数仅支持[1-999]'))
    } else {
      return callback()
    }
  }
}

const props = defineProps(editorProps)
const { queryMode, modifyMode, createMode, editNow, setReadonly, updateTabName, closeTab, refreshElementTree } =
  useEditor(props)
const elformRef = ref()
const elementNo = ref(props.editorNo)
const elementInfo = ref({
  elementName: 'Group',
  elementRemark: '',
  elementType: 'GROUP',
  elementClass: 'TestGroup',
  property: {
    TestGroup__on_sample_error: 'start_next_coroutine',
    TestGroup__number_groups: '1',
    TestGroup__start_interval: '',
    TestGroup__main_controller: {
      class: 'LoopController',
      property: {
        LoopController__loops: '1',
        LoopController__continue_forever: false
      }
    }
  }
})
const elementFormRules = reactive({
  elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }],
  'property.TestGroup__on_sample_error': [{ required: true, message: '失败时的处理不能为空', trigger: 'blur' }],
  'property.TestGroup__number_groups': [{ required: true, message: '并发数不能为空', trigger: 'blur' }],
  'property.TestGroup__main_controller.property.LoopController__loops': [{ validator: checkLoops, trigger: 'blur' }]
})
const httpSessionManager = ref({
  elementName: 'BuiltIn HTTPSessionManager',
  elementRemark: '',
  elementType: 'CONFIG',
  elementClass: 'HTTPSessionManager',
  property: {
    HTTPSessionManager__clear_each_iteration: 'false'
  }
})
const activeTabName = ref('HTTP')
const useHTTPSession = ref(false)
const clearEachIteration = computed({
  get() {
    return useHTTPSession.value && httpSessionManager.value.property.HTTPSessionManager__clear_each_iteration
  },
  set(val) {
    httpSessionManager.value.property.HTTPSessionManager__clear_each_iteration = val
  }
})
const builtIn = ref([])
const showHttpSettings = computed(() => activeTabName.value === 'HTTP')
const hiddenConfigDot = computed(() => useHTTPSession.value === false)
const showJsonScriptDialog = ref(false)

onMounted(() => {
  // 查询或更新模式时，先拉取元素信息
  if (createMode.value) return
  // 查询元素
  ElementService.queryElementInfo({ elementNo: elementNo.value }).then((response) => {
    elementInfo.value = response.result
  })
  // 查询内置元素
  ElementService.queryElementBuiltins({ elementNo: elementNo.value }).then((response) => {
    builtIn.value = response.result
    builtIn.value &&
      builtIn.value.forEach((item) => {
        if (item.elementClass === 'HTTPSessionManager') {
          _assign(httpSessionManager.value, item)
          useHTTPSession.value = item.enabled
        }
      })
  })
})

/**
 * 修改元素信息
 */
const modifyGroupElement = async () => {
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
  // 更新或新增内置元素
  await modifyBuiltIns()
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
const createGroupElement = async () => {
  // 表单校验
  const error = await elformRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  if (error) {
    ElMessage({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
    return
  }
  // 使用内置元素时，更新请求参数
  if (useHTTPSession.value) {
    elementInfo.value.builtIn = [httpSessionManager.value]
  }
  // 新增元素
  await ElementService.createElementChildren({
    rootNo: props.metadata.rootNo,
    parentNo: props.metadata.parentNo,
    children: [elementInfo.value]
  })
  // 成功提示
  ElMessage({ message: '新增元素成功', type: 'info', duration: 2 * 1000 })
  // 关闭tab
  closeTab()
  // 重新查询脚本列表
  refreshElementTree()
}

/**
 * 更新或新增内置元素
 */
const modifyBuiltIns = async () => {
  if (useHTTPSession.value) {
    // 使用 HTTP 会话
    if (!_isEmpty(builtIn.value)) {
      // 已经存在 HTTPSessionManager 时，判断是否已禁用，禁用则重新启用
      const manager = builtIn.value.find((item) => item.elementClass === 'HTTPSessionManager')
      if (!manager.enabled) {
        manager && (await ElementService.enableElement({ elementNo: manager.elementNo }))
      }
      // 修改内置元素
      await ElementService.modifyElementBuiltins(builtIn.value)
    } else {
      // 新增内置元素
      await ElementService.createElementBuiltins({
        rootNo: props.metadata.rootNo,
        parentNo: elementNo.value,
        children: [httpSessionManager.value]
      })
    }
  } else {
    // 不使用 HTTP 会话
    if (!_isEmpty(builtIn.value)) {
      // 已经存在 HTTPSessionManager 时，禁用元素
      const manager = builtIn.value.find((item) => item.elementClass === 'HTTPSessionManager')
      manager && (await ElementService.disableElement({ elementNo: manager.elementNo }))
    }
  }
}

const { executeTestGroup } = useRunnableElement(elementNo.value)
</script>

<style lang="scss" scoped>
:deep(.el-badge__content) {
  top: 20px;
}

:deep(.el-badge__content.is-fixed.is-dot) {
  right: -4px;
}
</style>
