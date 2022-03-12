<template>
  <div class="pymeter-component-container">
    <el-form
      ref="elementForm"
      label-position="right"
      label-width="auto"
      style="width: 100%"
      size="small"
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

      <!-- if条件 -->
      <el-form-item label="if条件：" prop="property.IfController__condition">
        <MonacoEditor ref="codeEditor" :read-only="queryMode" style="height: 100px" />
      </el-form-item>

      <!-- 操作按钮 -->
      <el-form-item v-if="queryMode">
        <el-button :icon="Edit" type="primary" @click="editNow">编 辑</el-button>
        <el-button :icon="Close" @click="closeTab">关 闭</el-button>
      </el-form-item>
      <el-form-item v-else-if="modifyMode">
        <el-button :icon="Check" type="danger" @click="modifyControllerElement">保 存</el-button>
        <el-button :icon="Close" @click="closeTab">关 闭</el-button>
      </el-form-item>
      <el-form-item v-else-if="createMode">
        <el-button :icon="Check" type="primary" @click="createControllerElement">保 存</el-button>
        <el-button :icon="Close" @click="closeTab">关 闭</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import * as ElementService from '@/api/script/element'
import EditorMixin from '@/pymeter/components/mixins/editor-mixin'

export default {
  name: 'IfControllerEditor',

  mixins: [EditorMixin],

  data() {
    return {
      elementNo: this.editorNo,
      elementInfo: {
        elementName: 'If Controller',
        elementRemark: '',
        elementType: 'CONTROLLER',
        elementClass: 'IfController',
        property: {
          IfController__condition: ''
        }
      },
      elementFormRules: {
        elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }],
        'property.IfController__condition': [{ required: true, message: '条件不能为空', trigger: 'blur' }]
      }
    }
  },

  mounted: function () {
    // 查询或更新模式时先拉取元素信息
    if (this.queryMode || this.modifyMode) {
      ElementService.queryElementInfo({ elementNo: this.elementNo }).then((response) => {
        this.elementInfo = response.result
        this.$refs.codeEditor.setValue(response.result.property.IfController__condition)
      })
    }
  },

  methods: {
    /**
     * 从编辑器获取脚本并更新至对象
     */
    updateCondition() {
      this.elementInfo.property.IfController__condition = this.$refs.codeEditor.getValue()
    },

    /**
     * 修改元素信息
     */
    async modifyControllerElement() {
      // 更新请求参数
      this.updateCondition()
      // 校验表单字段
      if (!(await this.checkForm('elementForm'))) return
      // 修改元素
      await ElementService.modifyElement({ elementNo: this.elementNo, ...this.elementInfo })
      // 成功提示
      this.$message({ message: '修改元素成功', type: 'info', duration: 2 * 1000 })
      // 修改tab标题
      this.$store.commit('pymeter/updateTab', { editorNo: this.elementNo, editorName: this.elementInfo.elementName })
      // 重新查询脚本
      this.$store.commit('pymeter/refreshElementTreeNow')
      // 设置为只读模式
      this.setReadonly()
    },

    /**
     * 创建元素
     */
    async createControllerElement() {
      // 更新请求参数
      this.updateCondition()
      // 校验表单字段
      if (!(await this.checkForm('elementForm'))) return
      // 新增元素
      await ElementService.createElementChildren({
        rootNo: this.metadata.rootNo,
        parentNo: this.metadata.parentNo,
        children: [this.elementInfo]
      })
      // 成功提示
      this.$message({ message: '新增元素成功', type: 'info', duration: 2 * 1000 })
      // 关闭tab
      this.$store.commit('pymeter/removeTab', { editorNo: 'UNSAVED_IF_CONTROLLER' })
      // 重新查询脚本
      this.$store.commit('pymeter/refreshElementTreeNow')
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.el-textarea.is-disabled .el-textarea__inner) {
  cursor: auto;
}
</style>
