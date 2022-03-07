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
      <el-form-item label="失败时的处理：" prop="property.SetupGroup__on_sample_error">
        <el-select v-model="elementInfo.property.SetupGroup__on_sample_error" :disabled="queryMode" style="width: 100%">
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
import { Check, Close, Edit, Pointer } from '@element-plus/icons-vue'
import * as ElementService from '@/api/script/element'
import baseEditorProps from '@/pymeter/composables/editorPropsBase'
import useEditor from '@/pymeter/composables/useEditor'

const props = defineProps(baseEditorProps)
const { editorNo, editorMode, metadata, queryMode, modifyMode, createMode, editNow, setReadonly, updateTab, closeTab } =
  useEditor(props)
</script>

<script>
export default {
  name: 'SetupGroupDebuger',

  data() {
    return {
      elementNo: this.editorNo,
      elementInfo: {
        elementName: 'Setup Group Debuger',
        elementRemark: '',
        elementType: 'GROUP',
        elementClass: 'SetupGroupDebuger',
        property: {
          SetupGroup__on_sample_error: 'stop_test',
          SetupGroup__number_groups: '1',
          SetupGroup__start_interval: '',
          SetupGroup__main_controller: {
            class: 'LoopController',
            property: {
              LoopController__loops: '1',
              LoopController__continue_forever: false
            }
          }
        }
      },
      elementFormRules: {
        elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }],
        'property.SetupGroup__on_sample_error': [{ required: true, message: '失败时的处理不能为空', trigger: 'blur' }],
        'property.SetupGroup__number_groups': [{ required: true, message: '并发数不能为空', trigger: 'blur' }],
        'property.SetupGroup__main_controller.property.LoopController__loops': [
          { required: true, message: '循环次数不能为空', trigger: 'blur' }
        ]
      }
    }
  },

  mounted: function () {
    // 查询或更新模式时先拉取元素信息
    if (this.createMode) return
    ElementService.queryElementInfo({ elementNo: this.elementNo }).then((response) => {
      this.elementInfo = response.result
    })
  },

  methods: {
    /**
     * 修改元素信息
     */
    async modifyGroupElement() {
      // 表单校验
      const error = await this.$refs.elformRef
        .validate()
        .then(() => false)
        .catch(() => true)
      if (error) {
        this.$message({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
        return
      }
      // 修改元素
      await ElementService.modifyElement({ elementNo: this.elementNo, ...this.elementInfo })
      // 成功提示
      this.$message({ message: '修改元素成功', type: 'info', duration: 2 * 1000 })
      // 修改tab标题
      this.$store.commit('pymeter/updateTab', { editorNo: this.elementNo, editorName: this.elementInfo.elementName })
      // 重新查询脚本
      this.$store.commit('pymeter/refreshElementTreeNow')
      // 表单设置为只读
      this.setReadonly()
    },

    /**
     * 创建元素
     */
    async createGroupElement() {
      // 表单校验
      const error = await this.$refs.elformRef
        .validate()
        .then(() => false)
        .catch(() => true)
      if (error) {
        this.$message({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
        return
      }
      // 新增元素
      await ElementService.createElementChildren({
        rootNo: this.metadata.rootNo,
        parentNo: this.metadata.parentNo,
        children: [this.elementInfo]
      })
      //  成功提示
      this.$message({ message: '新增元素成功', type: 'info', duration: 2 * 1000 })
      // 关闭tab
      this.$store.commit('pymeter/removeTab', { editorNo: 'UNSAVED_SETUP_GROUP_DEBUGER' })
      // 重新查询脚本
      this.$store.commit('pymeter/refreshElementTreeNow')
    }
  }
}
</script>

<style lang="scss" scoped></style>
