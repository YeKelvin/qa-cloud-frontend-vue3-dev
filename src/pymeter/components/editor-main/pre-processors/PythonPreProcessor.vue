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

      <!-- 说明 -->
      <el-form-item label="内置变量：">
        <span style="display: inline-flex; flex-wrap: wrap; align-items: center">
          <el-tag size="small" style="margin-right: 10px">log</el-tag>
          <el-tag size="small" style="margin-right: 10px">ctx</el-tag>
          <el-tag size="small" style="margin-right: 10px">vars</el-tag>
          <el-tag size="small" style="margin-right: 10px">props</el-tag>
          <el-tag size="small" style="margin-right: 10px">prev</el-tag>
          <el-tag size="small" style="margin-right: 10px">sampler</el-tag>
        </span>
      </el-form-item>

      <!-- 元素脚本 -->
      <MonacoEditor
        ref="codeEditor"
        v-model="elementInfo.property.PythonPreProcessor__script"
        :read-only="queryMode"
      />

      <!-- 操作按钮 -->
      <el-form-item v-if="queryMode">
        <el-button icon="el-icon-edit" type="primary" @click="editNow">编 辑</el-button>
        <el-button icon="el-icon-close" @click="closeTab">关 闭</el-button>
      </el-form-item>
      <el-form-item v-else-if="modifyMode">
        <el-button icon="el-icon-check" type="danger" @click="modifyPreProcessorElement">保 存</el-button>
        <el-button icon="el-icon-close" @click="closeTab">关 闭</el-button>
      </el-form-item>
      <el-form-item v-else-if="createMode">
        <el-button icon="el-icon-check" type="primary" @click="createPreProcessorElement">保 存</el-button>
        <el-button icon="el-icon-close" @click="closeTab">关 闭</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import * as ElementService from '@/api/script/element'
import EditorMixin from '@/pymeter/components/mixins/editor-mixin'

export default {
  name: 'PythonPreProcessorEditor',

  mixins: [EditorMixin],

  data() {
    return {
      elementNo: this.editorNo,
      elementInfo: {
        elementName: 'Python PreProcessor',
        elementRemark: '',
        elementType: 'PRE_PROCESSOR',
        elementClass: 'PythonPreProcessor',
        property: {
          PythonPreProcessor__script: ''
        }
      },
      elementFormRules: {
        elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }]
      }
    }
  },

  mounted: function () {
    // 查询或更新模式时先拉取元素信息
    if (this.queryMode || this.modifyMode) {
      ElementService.queryElementInfo({ elementNo: this.elementNo }).then((response) => {
        this.elementInfo = response.result
        this.$refs.codeEditor.setValue(response.result.property.PythonPreProcessor__script)
      })
    }
  },

  methods: {
    /**
     * 修改元素信息
     */
    async modifyPreProcessorElement() {
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
      // 表单设置为只读
      this.setReadonly()
    },

    /**
     * 创建元素
     */
    async createPreProcessorElement() {
      // 校验表单字段
      if (!(await this.checkForm('elementForm'))) return
      // 新增元素
      ElementService.createElementChildren({
        rootNo: this.metadata.rootNo,
        parentNo: this.metadata.parentNo,
        children: [this.elementInfo]
      })
      // 成功提示
      this.$message({ message: '新增元素成功', type: 'info', duration: 2 * 1000 })
      // 关闭tab
      this.$store.commit('pymeter/removeTab', { editorNo: 'UNSAVED_PYTHON_PRE_PROCESSOR' })
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
