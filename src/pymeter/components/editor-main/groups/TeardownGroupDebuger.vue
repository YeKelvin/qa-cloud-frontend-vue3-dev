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

      <!-- 操作按钮 -->
      <el-form-item v-if="queryMode">
        <el-button :icon="Edit" type="primary" @click="editNow()">编 辑</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
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
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { Check, Close, Edit } from '@element-plus/icons-vue'
import * as ElementService from '@/api/script/element'
import editorProps from '@/pymeter/composables/editor.props'
import useEditor from '@/pymeter/composables/useEditor'

const props = defineProps(editorProps)
const { queryMode, modifyMode, createMode, editNow, setReadonly, updateTabName, closeTab, refreshElementTree } =
  useEditor(props)
const elformRef = ref()
const elementNo = ref(props.editorNo)
const elementInfo = ref({
  elementName: 'TearDown Group Debuger',
  elementRemark: '',
  elementType: 'GROUP',
  elementClass: 'TeardownGroupDebuger',
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

onMounted(() => {
  // 查询或更新模式时，先拉取元素信息
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
