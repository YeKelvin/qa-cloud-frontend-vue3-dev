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

      <!-- 最大循环次数 -->
      <el-form-item label="最大循环数：" prop="property.WhileController__max_loop_count">
        <el-input
          v-model="elementInfo.property.WhileController__max_loop_count"
          placeholder="while 最大循环次数"
          clearable
          :readonly="queryMode"
        />
      </el-form-item>

      <!-- 循环超时时间 -->
      <el-form-item label="超时时间：" prop="property.WhileController__timeout">
        <el-input
          v-model="elementInfo.property.WhileController__timeout"
          placeholder="while 超时时间（ms）"
          clearable
          :readonly="queryMode"
        />
      </el-form-item>

      <!-- 循环延迟时间 -->
      <el-form-item label="延迟时间：" prop="property.WhileController__delay">
        <el-input
          v-model="elementInfo.property.WhileController__delay"
          placeholder="延迟下一个循环的开始时间（ms）"
          clearable
          :readonly="queryMode"
        />
      </el-form-item>

      <!-- while条件 -->
      <el-form-item label="while条件：" prop="property.WhileController__condition">
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
  name: 'WhileControllerEditor',

  mixins: [EditorMixin],

  data() {
    return {
      elementNo: this.editorNo,
      elementInfo: {
        elementName: 'While Controller',
        elementRemark: '',
        elementType: 'CONTROLLER',
        elementClass: 'WhileController',
        property: {
          WhileController__condition: '',
          WhileController__max_loop_count: '',
          WhileController__timeout: '',
          WhileController__delay: ''
        }
      },
      elementFormRules: {
        elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }],
        'property.WhileController__condition': [{ required: true, message: '元素名称不能为空', trigger: 'blur' }]
      }
    }
  },

  mounted: function () {
    // 查询或更新模式时先拉取元素信息
    if (this.queryMode || this.modifyMode) {
      ElementService.queryElementInfo({ elementNo: this.elementNo }).then((response) => {
        this.elementInfo = response.result
        this.$refs.codeEditor.setValue(response.result.property.WhileController__condition)
      })
    }
  },

  methods: {
    /**
     * 从编辑器获取脚本并更新至对象
     */
    updateCondition() {
      this.elementInfo.property.WhileController__condition = this.$refs.codeEditor.getValue()
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
      this.$store.commit('pymeter/removeTab', { editorNo: 'UNSAVED_WHILE_CONTROLLER' })
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
