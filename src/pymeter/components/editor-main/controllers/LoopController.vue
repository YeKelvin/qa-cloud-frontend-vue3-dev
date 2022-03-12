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

      <!-- 循环次数 -->
      <el-form-item label="循环次数：" prop="property.LoopController__loops">
        <el-input v-model="elementInfo.property.LoopController__loops" maxlength="2" clearable :disabled="queryMode" />
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
import * as Element from '@/api/script/element'
import EditorMixin from '@/pymeter/components/mixins/editor-mixin'

export default {
  name: 'LoopControllerEditor',

  mixins: [EditorMixin],

  data() {
    return {
      elementNo: this.editorNo,
      elementInfo: {
        elementName: 'Loop Controller',
        elementRemark: '',
        elementType: 'CONTROLLER',
        elementClass: 'LoopController',
        property: {
          LoopController__loops: '1',
          LoopController__continue_forever: false
        }
      },
      elementFormRules: {
        elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }],
        'property.LoopController__loops': [{ required: true, message: '循环次数不能为空', trigger: 'blur' }]
      }
    }
  },

  mounted: function () {
    // 查询或更新模式时先拉取元素信息
    if (this.queryMode || this.modifyMode) {
      Element.queryElementInfo({ elementNo: this.elementNo }).then((response) => {
        this.elementInfo = response.result
      })
    }
  },

  methods: {
    /**
     * 修改元素信息
     */
    async modifyControllerElement() {
      // 校验表单字段
      if (!(await this.checkForm('elementForm'))) return
      // 修改元素
      await Element.modifyElement({ elementNo: this.elementNo, ...this.elementInfo })
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
      // 校验表单字段
      if (!(await this.checkForm('elementForm'))) return
      // 新增元素
      await Element.createElementChildren({
        rootNo: this.metadata.rootNo,
        parentNo: this.metadata.parentNo,
        children: [this.elementInfo]
      })
      // 成功提示
      this.$message({ message: '新增元素成功', type: 'info', duration: 2 * 1000 })
      // 关闭tab
      this.$store.commit('pymeter/removeTab', { editorNo: 'UNSAVED_LOOP_CONTROLLER' })
      // 重新查询脚本
      this.$store.commit('pymeter/refreshElementTreeNow')
    }
  }
}
</script>

<style lang="scss" scoped></style>
