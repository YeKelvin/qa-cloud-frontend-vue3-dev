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

      <!-- 片段列表 -->
      <el-form-item label="片段引用：" prop="property.snippetNo">
        <el-select
          v-model="elementInfo.property.snippetNo"
          placeholder="脚本片段"
          style="width:100%;"
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

      <el-tag v-if="showWarning" type="danger" style="margin-bottom:10px;">
        重要提醒：片段参数定义已发生变更，请重新编辑
      </el-tag>

      <!-- 设置类 Tabs -->
      <el-tabs v-model="activeTabName">
        <el-tab-pane label="请求参数" name="PARAMS" />
      </el-tabs>

      <!-- 参数设置 -->
      <div v-if="showParams">
        <snippet-sampler-params-table :data="definedArgumentsData" :edit-mode="editMode" />
      </div>

      <!-- 操作按钮 -->
      <el-form-item v-if="queryMode">
        <el-button icon="el-icon-edit" type="primary" @click="editNow">编 辑</el-button>
        <el-button icon="el-icon-close" @click="closeTab">关 闭</el-button>
      </el-form-item>
      <el-form-item v-else-if="modifyMode">
        <el-button icon="el-icon-check" type="danger" @click="modifySamplerElement">保 存</el-button>
        <el-button icon="el-icon-close" @click="closeTab">关 闭</el-button>
      </el-form-item>
      <el-form-item v-else-if="createMode">
        <el-button icon="el-icon-check" type="primary" @click="createSamplerElement">保 存</el-button>
        <el-button icon="el-icon-close" @click="closeTab">关 闭</el-button>
      </el-form-item>
    </el-form>

  </div>
</template>

<script>
import * as ElementService from '@/api/script/element'
import * as StringUtil from '@/utils/string-util'
import EditorMixin from '@/pymeter/components/mixins/editor-mixin'
import SnippetSamplerParamsTable from './snippet-sampler-params-table'

export default {

  name: 'SnippetSamplerEditor',

  components: { SnippetSamplerParamsTable },

  mixins: [EditorMixin],

  data() {
    return {
      elementNo: this.editorNo,
      elementInfo: {
        elementName: 'Snippet Sampler',
        elementRemark: '',
        elementType: 'SAMPLER',
        elementClass: 'SnippetSampler',
        property: {
          snippetNo: '',
          arguments: []
        }
      },
      elementFormRules: {
        elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }],
        'property.snippetNo': [{ required: true, message: '片段不能为空', trigger: 'blur' }]
      },
      activeTabName: 'PARAMS',
      snippets: [],
      definedArgumentsData: [],
      showWarning: false
    }
  },

  computed: {
    showParams() { return this.activeTabName === 'PARAMS' }
  },

  watch: {
    'elementInfo.property.snippetNo'(val) {
      if (!val) return
      this.definedArgumentsData = []
      this.querySnippet(val)
    }
  },

  mounted: function() {
    this.querySnippets()
    // 查询或更新模式时先拉取元素信息
    if (this.queryMode || this.modifyMode) {
      ElementService.queryElementInfo({ elementNo: this.elementNo })
        .then(response => {
          this.elementInfo = response.result
          if (!this.elementInfo.property.arguments) {
            this.elementInfo.property.arguments = []
          }
        })
    }
  },

  methods: {
    /**
     * 根据工作空间编号查询所有片段
     */
    querySnippets() {
      ElementService.queryElementAll({
        workspaceNo: this.metadata.workspaceNo, elementType: 'COLLECTION', elementClass: 'TestSnippets'
      })
        .then(response => {
          this.snippets = response.result
        })
    },

    /**
     * 根据元素编号查询片段详情
     */
    querySnippet(snippetNo) {
      ElementService.queryElementInfo({ elementNo: snippetNo })
        .then(response => {
          // 将片段参数定义添加至表格
          response.result.property.arguments.forEach(item => {
            this.definedArgumentsData.push({
              name: item.name,
              value: item.default,
              desc: item.desc,
              default: item.default
            })
          })
          // 非新增模式下，将请求参数合并至表格中，如果请求参数不在片段参数定义中，则丢弃
          if (!this.createMode) {
            this.definedArgumentsData.forEach(item => {
              const arg = this.elementInfo.property.arguments.find(i => i.name === item.name)
              if (arg) {
                item.value = arg.value
              }
            })
          }
          // 将请求参数合并至表格中，如果片段参数定义（对称差集）有变更，则给出提示
          if (this.queryMode) {
            if (this.definedArgumentsData.length !== this.elementInfo.property.arguments.length) {
              this.showWarning = true
            }
            const leftDiff = this.$_.differenceBy(this.definedArgumentsData, this.elementInfo.property.arguments, 'name')
            const rightDiff = this.$_.differenceBy(this.elementInfo.property.arguments, this.definedArgumentsData, 'name')
            if (leftDiff.length > 0 || rightDiff.length > 0) {
              this.showWarning = true
            }
          }
        })
    },

    /**
     * 修改元素信息
     */
    async modifySamplerElement() {
      // 校验表单字段
      if (!(await this.checkForm('elementForm'))) return
      // 更新元素属性
      this.updateElementProperty()
      // 校验参数值不能为空
      if (!this.checkParamValue()) return
      // 修改元素
      await ElementService.modifyElement({ elementNo: this.elementNo, ...this.elementInfo })
      // 成功提示
      this.$message({ message: '修改元素成功', type: 'info', duration: 2 * 1000 })
      // 修改tab标题
      this.$store.commit('pymeter/updateTab', { editorNo: this.elementNo, editorName: this.elementInfo.elementName })
      // 重新查询脚本
      this.$store.commit('pymeter/refreshElementTreeNow')
      // 隐藏警告
      this.showWarning = false
      // 表单设置为只读
      this.setReadonly()
    },

    /**
     * 创建元素
     */
    async createSamplerElement() {
      // 校验表单字段
      if (!(await this.checkForm('elementForm'))) return
      // 更新元素属性
      this.updateElementProperty()
      // 校验参数值不能为空
      if (!this.checkParamValue()) return
      // 新增元素
      await ElementService.createElementChildren({
        rootNo: this.metadata.rootNo,
        parentNo: this.metadata.parentNo,
        children: [this.elementInfo]
      })
      // 成功提示
      this.$message({ message: '新增元素成功', type: 'info', duration: 2 * 1000 })
      // 关闭tab
      this.$store.commit('pymeter/removeTab', { editorNo: 'UNSAVED_SNIPPET_SAMPLER' })
      // 重新查询脚本
      this.$store.commit('pymeter/refreshElementTreeNow')
    },

    // 更新元素属性
    updateElementProperty() {
      this.elementInfo.property.arguments = this.definedArgumentsData.map(
        item => ({ name: item.name, value: item.value })
      )
    },

    // 校验参数值是否为空
    checkParamValue() {
      let pass = true
      this.elementInfo.property.arguments.forEach(item => {
        if (StringUtil.isBlank(item.value)) {
          pass = false
          return
        }
      })
      if (!pass) this.$message({ message: '参数值不能为空', type: 'error' })
      return pass
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
