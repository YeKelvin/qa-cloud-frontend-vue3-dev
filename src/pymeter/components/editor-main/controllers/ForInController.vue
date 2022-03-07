<template>
  <div class="pymeter-component-container">
    <el-form
      ref="elementForm"
      label-position="right"
      label-width="auto"
      style="width:100%"
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

      <el-form-item label="变量名称：" prop="property.ForInController__iterating_variables">
        <el-input
          v-model="elementInfo.property.ForInController__iterating_variables"
          placeholder="定义迭代变量的名称"
          clearable
          :readonly="queryMode"
        >
          <template slot="prepend">for</template>
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
          <template slot="prepend">in&nbsp;&nbsp;${</template>
          <template slot="append">}</template>
        </el-input>
      </el-form-item>

      <el-form-item v-else label="遍历代码：" prop="property.ForInController__statements">
        <monaco-editor
          ref="codeEditor"
          v-model="elementInfo.property.ForInController__statements"
          style="height:100px;"
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
          <template slot="prepend">delay</template>
          <template slot="append">ms</template>
        </el-input>
      </el-form-item>

      <!-- 操作按钮 -->
      <el-form-item v-if="queryMode">
        <el-button icon="el-icon-edit" type="primary" @click="editNow">编 辑</el-button>
        <el-button icon="el-icon-close" @click="closeTab">关 闭</el-button>
      </el-form-item>
      <el-form-item v-else-if="modifyMode">
        <el-button icon="el-icon-check" type="danger" @click="modifyControllerElement">保 存</el-button>
        <el-button icon="el-icon-close" @click="closeTab">关 闭</el-button>
      </el-form-item>
      <el-form-item v-else-if="createMode">
        <el-button icon="el-icon-check" type="primary" @click="createControllerElement">保 存</el-button>
        <el-button icon="el-icon-close" @click="closeTab">关 闭</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import * as Element from '@/api/script/element'
import EditorMixin from '@/pymeter/components/mixins/editor-mixin'

export default {
  name: 'ForInControllerEditor',

  mixins: [EditorMixin],

  data() {
    return {
      elementNo: this.editorNo,
      elementInfo: {
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
      },
      elementFormRules: {
        'elementName': [{ required: true, message: '元素名称不能为空', trigger: 'blur' }],
        'property.ForInController__iterating_variables': [{ required: true, message: '变量名称不能为空', trigger: 'blur' }],
        'property.ForInController__statements': [{ required: true, message: '迭代对象或代码不能为空', trigger: 'blur' }],
        'property.ForInController__use_variable': [{ required: true, message: '是否使用对象不能为空', trigger: 'blur' }]
      }
    }
  },

  computed: {
    useVariable() {
      return this.elementInfo.property.ForInController__use_variable.toLowerCase() === 'true'
    }
  },

  watch: {
    useVariable(val) {
      if (!val) {
        this.$nextTick(() => {
          this.$refs.codeEditor && this.$refs.codeEditor.setValue(this.elementInfo.property.ForInController__statements)
        })
      }
    }
  },

  mounted: function() {
    // 查询或更新模式时先拉取元素信息
    if (this.queryMode || this.modifyMode) {
      Element.queryElementInfo({ elementNo: this.elementNo })
        .then(response => {
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
      // 表单设置为只读
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
      this.$store.commit('pymeter/removeTab', { editorNo: 'UNSAVED_FOR_IN_CONTROLLER' })
      // 重新查询脚本
      this.$store.commit('pymeter/refreshElementTreeNow')
    }
  }
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
