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

      <!-- 设置类 Tabs -->
      <el-tabs v-model="activeTabName">
        <el-tab-pane name="PARAMS">
          <el-badge slot="label" :hidden="argumentsData.length == 0" type="success" is-dot>参数定义</el-badge>
        </el-tab-pane>
        <el-tab-pane name="HTTP">
          <el-badge slot="label" :hidden="hiddenConfigDot" type="success" is-dot>HTTP配置</el-badge>
        </el-tab-pane>
      </el-tabs>

      <!-- 参数设置 -->
      <div v-if="showParams">
        <snippets-params-table :data="argumentsData" :edit-mode="editMode" />
      </div>

      <!-- HTTP 设置 -->
      <div v-if="showHttpSettings">
        <!-- 是否使用 HTTP 会话 -->
        <el-form-item label="使用会话：">
          <el-switch
            v-model="elementInfo.property.useHTTPSession"
            active-color="#13ce66"
            active-value="true"
            inactive-value="false"
            :disabled="queryMode"
          />
        </el-form-item>
      </div>

      <!-- 操作按钮 -->
      <el-form-item v-if="queryMode">
        <el-button icon="el-icon-edit" type="primary" @click="editNow">编 辑</el-button>
        <el-button icon="el-icon-close" @click="closeTab">关 闭</el-button>
        <template v-if="runtimeArgumentsData.length > 0">
          <el-button icon="el-icon-thumb" type="danger" @click="showRuntimeArguments = true">运 行</el-button>
        </template>
        <template v-else>
          <el-dropdown
            split-button
            trigger="click"
            type="danger"
            style="margin-left: 10px"
            placement="bottom-start"
            @click="executeCollection()"
          >
            <i class="el-icon-thumb" />
            <span style="margin-left: 5px">运 行</span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click="querySnippetsJson()">查看JSON</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-form-item>
      <el-form-item v-else-if="modifyMode">
        <el-button icon="el-icon-check" type="danger" @click="modifyCollectionElement">保 存</el-button>
        <el-button icon="el-icon-close" @click="closeTab">关 闭</el-button>
      </el-form-item>
      <el-form-item v-else-if="createMode">
        <el-button icon="el-icon-check" type="primary" @click="createCollectionElement">保 存</el-button>
        <el-button icon="el-icon-close" @click="closeTab">关 闭</el-button>
      </el-form-item>
    </el-form>

    <el-dialog width="60%" center v-model:visible="showRuntimeArguments">
      <span slot="title" style="color: #606266; font-family: inherit">设置运行参数</span>
      <snippets-runtime-variables-table :data="runtimeArgumentsData" />
      <div style="padding: 10px">备注：运行参数不支持函数</div>
      <span slot="footer">
        <el-button size="small" icon="el-icon-close" @click="showRuntimeArguments = false">取 消</el-button>
        <el-dropdown
          split-button
          trigger="click"
          type="danger"
          style="margin-left: 10px"
          placement="bottom-start"
          @click="
            showRuntimeArguments = false
            executeCollection()
          "
        >
          <i class="el-icon-thumb" />
          <span style="margin-left: 5px">运 行</span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              @click="
                showRuntimeArguments = false
                querySnippetsJson()
              "
            >
              查看JSON
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </span>
    </el-dialog>

    <el-dialog center title="Json脚本" width="80%" v-model:visible="showJsonScript">
      <monaco-editor ref="jsonEditor" language="json" style="height: 300px" :read-only="true" />
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as StringUtil from '@/utils/string-util'
import * as ElementService from '@/api/script/element'
import * as ExecutionService from '@/api/script/execution'
import EditorMixin from '@/pymeter/components/mixins/editor-mixin'
import SocketIOMixin from '@/mixins/socketio-mixin'
import SnippetsParamsTable from './snippets-params-table'
import SnippetsRuntimeVariablesTable from './snippets-runtime-variables-table'

export default {
  name: 'SnippetCollection',

  components: { SnippetsParamsTable, SnippetsRuntimeVariablesTable },

  mixins: [EditorMixin, SocketIOMixin],

  data() {
    return {
      elementNo: this.editorNo,
      elementInfo: {
        elementName: 'Snippet',
        elementRemark: '',
        elementType: 'COLLECTION',
        elementClass: 'TestSnippets',
        property: {
          arguments: [],
          useHTTPSession: 'false'
        }
      },
      elementFormRules: {
        elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }]
      },
      activeTabName: 'PARAMS',
      argumentsData: [],
      showRuntimeArguments: false,
      runtimeArgumentsData: [],
      showJsonScript: false
    }
  },

  computed: {
    ...mapState('workspace', {
      workspaceNo: (state) => state.workspaceNo
    }),
    ...mapState('pymeter', {
      selectedDatasetNumberList: (state) => state.selectedDatasetNumberList,
      useCurrentValue: (state) => state.useCurrentValue
    }),
    showParams() {
      return this.activeTabName === 'PARAMS'
    },
    showHttpSettings() {
      return this.activeTabName === 'HTTP'
    },
    hiddenConfigDot() {
      if (this.elementInfo.property.useHTTPSession === 'false') {
        return true
      }
      return false
    },
    additionalVariables() {
      if (this.runtimeArgumentsData.length === 0) return {}
      const vars = {}
      this.runtimeArgumentsData.forEach((item) => {
        vars[item.name] = item.default
      })
      return vars
    }
  },

  mounted: function () {
    // 查询或更新模式时先拉取元素信息
    if (this.queryMode || this.modifyMode) {
      ElementService.queryElementInfo({ elementNo: this.elementNo }).then((response) => {
        this.elementInfo = response.result
        this.argumentsData = response.result.property.arguments
        this.runtimeArgumentsData = response.result.property.arguments
      })
    }
  },

  methods: {
    /**
     * 修改元素信息
     */
    async modifyCollectionElement() {
      // 校验表单字段
      if (!(await this.checkForm('elementForm'))) return
      // 更新元素属性
      this.updateElementProperty()
      // 校验参数名称不能为空
      if (!this.checkParamName()) return
      // 修改元素
      await ElementService.modifyElement({ elementNo: this.elementNo, ...this.elementInfo })
      // 成功提示
      this.$message({ message: '修改元素成功', type: 'info', duration: 2 * 1000 })
      // 修改tab标题
      this.$store.commit('pymeter/updateTab', { editorNo: this.elementNo, editorName: this.elementInfo.elementName })
      // 重新查询测试集合列表
      this.$store.commit('pymeter/refreshCollectionsNow')
      // 表单设置为只读
      this.setReadonly()
    },

    /**
     * 创建元素
     * TODO: workspaceNo非空判断，为空时弹出workspace选择列表
     */
    async createCollectionElement() {
      // 校验表单字段
      if (!(await this.checkForm('elementForm'))) return
      // 更新元素属性
      this.updateElementProperty()
      // 校验参数名称不能为空
      if (!this.checkParamName()) return
      // 新增元素
      await ElementService.createElement({ workspaceNo: this.workspaceNo, ...this.elementInfo })
      // 成功提示
      this.$message({ message: '新增元素成功', type: 'info', duration: 2 * 1000 })
      // 关闭tab
      this.$store.commit('pymeter/removeTab', { editorNo: 'UNSAVED_SNIPPET' })
      // 重新查询测试集合列表
      this.$store.commit('pymeter/refreshCollectionsNow')
    },

    // 更新元素属性
    updateElementProperty() {
      this.elementInfo.property.arguments = this.argumentsData.filter(
        (item) => !StringUtil.isBlankAll(item.name, item.default, item.desc)
      )
    },

    // 校验参数名称是否为空
    checkParamName() {
      let pass = true
      this.elementInfo.property.arguments.forEach((item) => {
        if (StringUtil.isBlank(item.name)) {
          pass = false
          return
        }
      })
      if (!pass) this.$message({ message: '参数名称不能为空', type: 'error' })
      return pass
    },

    /**
     * 根据 collectionNo 执行脚本
     */
    async executeCollection() {
      try {
        // 没有选择变量集时给出提示
        if (this.selectedDatasetNumberList.length === 0) {
          await this.$confirm('当前没有选择[环境/变量]，确定执行吗？', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
        }
        // 连接 socket
        this.socketConnect()
        // 等待获取 sid，后再执行脚本
        const sid = await this.getSID()
        // 后端异步执行脚本
        await ExecutionService.executeSnippets({
          collectionNo: this.elementNo,
          socketId: sid,
          variableDataSet: {
            useCurrentValue: this.useCurrentValue,
            numberList: this.selectedDatasetNumberList
          },
          variables: this.additionalVariables
        })
        // 打开结果面板
        this.$store.commit('pymeter/openResultDrawer')
      } catch {
        // 异常时断开 socket 连接
        this.socketDisconnect()
      }
    },

    /**
     * 查看 Json 脚本
     */
    querySnippetsJson() {
      ExecutionService.querySnippetsJson({
        collectionNo: this.elementNo,
        dataSetNumberList: this.selectedDatasetNumberList,
        useCurrentValue: this.useCurrentValue,
        variables: this.additionalVariables
      }).then((response) => {
        this.showJsonScript = true
        this.$nextTick(() => {
          this.$refs.jsonEditor.setValue(JSON.stringify(response.result))
          setTimeout(() => {
            this.$refs.jsonEditor.formatDocument()
          }, 200)
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.el-badge__content) {
  top: 20px;
}

:deep(.el-badge__content.is-fixed.is-dot) {
  right: -4px;
}
</style>
