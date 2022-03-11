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

      <!-- 元素属性 -->
      <el-form-item label="失败时的处理：" prop="property.TearDownGroup__on_sample_error">
        <el-select
          v-model="elementInfo.property.TearDownGroup__on_sample_error"
          :disabled="queryMode"
          style="width: 100%"
        >
          <el-option label="继续" value="continue" />
          <el-option label="开始下一个主控制器的循环" value="start_next_coroutine" />
          <el-option label="开始下一个当前控制器的循环" value="start_next_current_loop" />
          <el-option label="中断当前控制器的循环" value="break_current_loop" />
          <el-option label="停止主控制器" value="stop_test_group" />
          <el-option label="停止测试" value="stop_test" />
          <el-option label="立即停止测试" value="stop_test_now" />
        </el-select>
      </el-form-item>
      <el-form-item label="并发数：" prop="property.TearDownGroup__number_groups">
        <el-input v-model="elementInfo.property.TearDownGroup__number_groups" clearable disabled />
      </el-form-item>
      <el-form-item label="循环次数：" prop="property.TearDownGroup__main_controller.property.LoopController__loops">
        <el-input
          v-model="elementInfo.property.TearDownGroup__main_controller.property.LoopController__loops"
          clearable
          disabled
        />
      </el-form-item>

      <!-- 操作按钮 -->
      <el-form-item v-if="queryMode">
        <el-button :icon="Edit" type="primary" @click="editNow()">编 辑</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
        <el-dropdown
          split-button
          trigger="click"
          type="danger"
          style="margin-left: 10px"
          placement="bottom"
          @click="executeGroup(false)"
        >
          <el-icon><Pointer /></el-icon>
          <span style="margin-left: 5px">运 行</span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="executeGroup(true)">独立运行</el-dropdown-item>
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

    <el-dialog v-model="showJsonScript" center title="Json脚本" width="80%">
      <MonacoEditor ref="jsonEditor" language="json" style="height: 300px" :read-only="true" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { Check, Close, Edit, Pointer } from '@element-plus/icons-vue'
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
  elementName: 'TearDown Group',
  elementRemark: '',
  elementType: 'GROUP',
  elementClass: 'TearDownGroup',
  property: {
    TearDownGroup__on_sample_error: 'start_next_coroutine',
    TearDownGroup__number_groups: '1',
    TearDownGroup__start_interval: '',
    TearDownGroup__main_controller: {
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
  'property.TearDownGroup__on_sample_error': [{ required: true, message: '失败时的处理不能为空', trigger: 'blur' }],
  'property.TearDownGroup__number_groups': [{ required: true, message: '并发数不能为空', trigger: 'blur' }],
  'property.TearDownGroup__main_controller.property.LoopController__loops': [
    { required: true, message: '循环次数不能为空', trigger: 'blur' }
  ]
})
const showJsonScript = ref(false)

onMounted(() => {
  // 查询或更新模式时先拉取元素信息
  if (createMode.value) return
  ElementService.queryElementInfo({ elementNo: elementNo.value }).then((response) => {
    elementInfo.value = response.result
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
  //  成功提示
  ElMessage({ message: '修改元素成功', type: 'info', duration: 2 * 1000 })
  // 修改tab标题
  updateTabName(elementInfo.value.elementName)
  // 重新查询脚本列表
  refreshElementTree()
  // 表单设置为只读
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

<style lang="scss" scoped></style>
