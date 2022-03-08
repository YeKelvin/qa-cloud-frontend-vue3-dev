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

      <!-- URL = 请求方法 + 请求方法-->
      <el-form-item id="url" label="URL：" required>
        <el-form-item prop="property.HTTPSampler__url">
          <!-- 请求方法 -->
          <el-input
            v-model="elementInfo.property.HTTPSampler__url"
            placeholder="请求地址"
            clearable
            :readonly="queryMode"
          >
            <template #prepend>
              <!-- 请求方法 -->
              <http-method-select v-model="elementInfo.property.HTTPSampler__method" :disabled="queryMode" />
            </template>
          </el-input>
        </el-form-item>
      </el-form-item>

      <!-- 请求配置tab -->
      <el-tabs v-model="activeTabName">
        <el-tab-pane name="Headers">
          <el-badge slot="label" :hidden="hiddenHeadersDot" type="success" is-dot>Headers</el-badge>
        </el-tab-pane>
        <el-tab-pane name="Params">
          <el-badge slot="label" :hidden="paramItems.length == 0" type="success" is-dot>Params</el-badge>
        </el-tab-pane>
        <el-tab-pane name="Body">
          <el-badge slot="label" :hidden="hiddenBodyDot" type="success" is-dot>Body</el-badge>
        </el-tab-pane>
        <el-tab-pane name="Configuration">
          <el-badge slot="label" :hidden="hiddenConfigDot" type="success" is-dot>Configuration</el-badge>
        </el-tab-pane>
        <el-tab-pane name="PreScript">
          <el-badge slot="label" :hidden="preCode == ''" type="success" is-dot>Pre-Script</el-badge>
        </el-tab-pane>
        <el-tab-pane name="Tests">
          <el-badge slot="label" :hidden="testsCode == ''" type="success" is-dot>Tests</el-badge>
        </el-tab-pane>
      </el-tabs>

      <!-- 请求头 -->
      <div v-if="showHeaders">
        <!-- 请求头模板 -->
        <http-headers-template v-model="selectedHeadersTemplateNumberList" :edit-mode="editMode" />
        <!-- 请求头表格 -->
        <http-headers-table :data="headerItems" :edit-mode="editMode" />
      </div>

      <!-- 请求参数 -->
      <div v-if="showParams">
        <http-params-table :data="paramItems" :edit-mode="editMode" />
      </div>

      <!-- 请求主体 -->
      <div v-show="showBody">
        <!-- 主体数据类型单选框 -->
        <span style="display: inline-flex; align-items: center; height: 30px; line-height: 30px">
          <el-radio-group v-model="bodyMode" :disabled="queryMode">
            <el-radio label="none">none</el-radio>
            <el-radio label="x-www-form-urlencoded">x-www-form-urlencoded</el-radio>
            <el-radio label="raw">raw</el-radio>
            <el-radio label="custom">custom</el-radio>
          </el-radio-group>
          <!-- raw data type -->
          <el-select v-if="bodyMode == 'raw'" v-model="rawType" class="raw-type" :disabled="queryMode">
            <el-option key="json" label="JSON" value="json" />
            <el-option key="xml" label="XML" value="xml" />
            <el-option key="text" label="TEXT" value="text" />
          </el-select>
        </span>

        <!-- 表单 -->
        <http-form-table v-if="bodyMode == 'x-www-form-urlencoded'" :data="formItems" :edit-mode="editMode" />

        <!-- 代码编辑器 -->
        <MonacoEditor
          v-if="bodyMode == 'raw' || bodyMode == 'custom'"
          ref="bodyCodeEditor"
          key="bodyCodeEditor"
          v-model="bodyCode"
          language="json"
          :read-only="queryMode"
        />
      </div>

      <!-- 高级配置 -->
      <div v-if="showConfiguration">
        <el-form
          ref="configForm"
          label-position="right"
          label-width="auto"
          size="small"
          :model="elementInfo"
          :rules="configFormRules"
        >
          <!-- 重定向 -->
          <el-form-item label="重定向：" prop="property.HTTPSampler__allow_redirects">
            <el-switch
              v-model="elementInfo.property.HTTPSampler__allow_redirects"
              active-color="#13ce66"
              active-value="true"
              inactive-value="false"
              :disabled="queryMode"
            />
          </el-form-item>

          <!-- 编码 -->
          <el-form-item label="编码：" prop="property.HTTPSampler__encoding">
            <el-input
              v-model="elementInfo.property.HTTPSampler__encoding"
              placeholder="UTF-8"
              clearable
              :readonly="queryMode"
            />
          </el-form-item>

          <!-- 连接超时时间 -->
          <el-form-item label="连接超时：" prop="property.HTTPSampler__connect_timeout">
            <el-input
              v-model="elementInfo.property.HTTPSampler__connect_timeout"
              placeholder="ms"
              clearable
              :readonly="queryMode"
            />
          </el-form-item>

          <!-- 响应超时时间 -->
          <el-form-item label="响应超时：" prop="property.HTTPSampler__response_timeout">
            <el-input
              v-model="elementInfo.property.HTTPSampler__response_timeout"
              placeholder="ms"
              clearable
              :readonly="queryMode"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 前置脚本 -->
      <div v-show="showPreScript">
        <el-descriptions :label-style="{ 'font-weight': 700 }">
          <el-descriptions-item label="内置变量">
            <el-tag size="small" style="margin-right: 10px">log</el-tag>
            <el-tag size="small" style="margin-right: 10px">ctx</el-tag>
            <el-tag size="small" style="margin-right: 10px">vars</el-tag>
            <el-tag size="small" style="margin-right: 10px">props</el-tag>
            <el-tag size="small" style="margin-right: 10px">prev</el-tag>
            <el-tag size="small" style="margin-right: 10px">sampler</el-tag>
          </el-descriptions-item>
        </el-descriptions>
        <MonacoEditor ref="preCodeEditor" key="preCodeEditor" v-model="preCode" :read-only="queryMode" />
      </div>

      <!-- 测试脚本 -->
      <div v-show="showTestsScript">
        <el-descriptions :label-style="{ 'font-weight': 700 }">
          <el-descriptions-item label="内置变量">
            <el-tag size="small" style="margin-right: 10px">log</el-tag>
            <el-tag size="small" style="margin-right: 10px">ctx</el-tag>
            <el-tag size="small" style="margin-right: 10px">vars</el-tag>
            <el-tag size="small" style="margin-right: 10px">props</el-tag>
            <el-tag size="small" style="margin-right: 10px">prev</el-tag>
            <el-tag size="small" style="margin-right: 10px">sampler</el-tag>
            <el-tag size="small" style="margin-right: 10px">result</el-tag>
            <el-tag size="small" style="margin-right: 10px">failure</el-tag>
            <el-tag size="small" style="margin-right: 10px">message</el-tag>
            <el-tag size="small" style="margin-right: 10px">stop_group</el-tag>
            <el-tag size="small" style="margin-right: 10px">stop_test</el-tag>
            <el-tag size="small" style="margin-right: 10px">stop_test_now</el-tag>
          </el-descriptions-item>
        </el-descriptions>
        <MonacoEditor ref="testsCodeEditor" key="testsCodeEditor" v-model="testsCode" :read-only="queryMode" />
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
import EditorMixin from '@/pymeter/components/mixins/editor-mixin'
import HttpMethodSelect from './http-method-select'
import HttpHeadersTemplate from './http-headers-template'
import HttpHeadersTable from './http-headers-table'
import HttpParamsTable from './http-params-table'
import HttpFormTable from './http-form-table'

export default {
  name: 'HTTPSamplerEditor',

  components: { HttpMethodSelect, HttpHeadersTable, HttpHeadersTemplate, HttpParamsTable, HttpFormTable },

  mixins: [EditorMixin],

  data() {
    return {
      elementNo: this.editorNo,
      elementInfo: {
        elementName: 'HTTP Sampler',
        elementRemark: '',
        elementType: 'SAMPLER',
        elementClass: 'HTTPSampler',
        property: {
          HTTPSampler__url: '',
          HTTPSampler__method: 'GET',
          HTTPSampler__headers: '',
          HTTPSampler__params: '',
          HTTPSampler__data: '',
          HTTPSampler__form: '',
          HTTPSampler__files: '',
          HTTPSampler__encoding: '',
          HTTPSampler__allow_redirects: 'false',
          HTTPSampler__connect_timeout: '',
          HTTPSampler__response_timeout: ''
        }
      },
      elementFormRules: {
        elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }],
        'property.HTTPSampler__url': [{ required: true, message: '请求地址不能为空', trigger: 'blur' }],
        'property.HTTPSampler__method': [{ required: true, message: '请求方法不能为空', trigger: 'blur' }]
      },
      configFormRules: {},
      activeTabName: '',
      builtIn: [],
      headerItems: [],
      paramItems: [],
      formItems: [],
      bodyMode: 'none',
      rawType: 'json',
      rawTypes: {
        json: 'application/json',
        xml: 'application/xml',
        text: 'text/plain'
      },
      bodyCode: '',
      preCode: '',
      testsCode: '',
      selectedHeadersTemplateNumberList: []
    }
  },

  computed: {
    headers() {
      if (!this.headerItems || this.headerItems.length === 0) return null
      const headers = []
      this.headerItems.forEach((item) => {
        if (!item.name || item.name === '') return
        headers.push({
          class: 'HTTPHeader',
          enabled: item.enabled,
          property: { Header__name: item.name, Header__value: item.value }
        })
      })
      if (headers.length === 0) return null
      return { class: 'HTTPHeaderManager', property: { HeaderManager__headers: headers } }
    },
    queryParams() {
      if (!this.paramItems || this.paramItems.length === 0) return null
      const agrs = []
      this.paramItems.forEach((item) => {
        if (!item.name || item.name === '') return
        agrs.push({
          class: 'Argument',
          enabled: item.enabled,
          property: { Argument__name: item.name, Argument__value: item.value, Argument__desc: item.desc }
        })
      })
      if (agrs.length === 0) return null
      return { class: 'Arguments', property: { Arguments__arguments: agrs } }
    },
    formParams() {
      if (!this.formItems || this.formItems.length === 0 || this.bodyMode !== 'x-www-form-urlencoded') return null
      const formItems = []
      this.formItems.forEach((item) => {
        formItems.push({
          class: 'Argument',
          enabled: item.enabled,
          property: { Argument__name: item.name, Argument__value: item.value, Argument__desc: item.desc }
        })
      })
      return { class: 'Arguments', property: { Arguments__arguments: formItems } }
    },
    bodyData() {
      if (this.bodyMode === 'raw' || this.bodyMode === 'custom') {
        return this.bodyCode
      }
      return ''
    },
    pendingSubmitBuiltIn() {
      const builtIns = [...this.builtIn]
      if (builtIns.length === 0) {
        builtIns.push({
          elementName: 'Builtin PreProcessor',
          elementRemark: '',
          elementType: 'PRE_PROCESSOR',
          elementClass: 'PythonPreProcessor',
          property: { PythonPreProcessor__script: this.preCode }
        })
        builtIns.push({
          elementName: 'Builtin Assertion',
          elementRemark: '',
          elementType: 'ASSERTION',
          elementClass: 'PythonAssertion',
          property: { PythonAssertion__script: this.testsCode }
        })
      } else {
        builtIns.forEach((item) => {
          if (item.elementType === 'PRE_PROCESSOR') {
            item.property.PythonPreProcessor__script = this.preCode
            return
          }
          if (item.elementType === 'ASSERTION') {
            item.property.PythonAssertion__script = this.testsCode
            return
          }
        })
      }
      return builtIns
    },
    showHeaders() {
      return this.activeTabName === 'Headers'
    },
    showParams() {
      return this.activeTabName === 'Params'
    },
    showBody() {
      return this.activeTabName === 'Body'
    },
    showConfiguration() {
      return this.activeTabName === 'Configuration'
    },
    showPreScript() {
      return this.activeTabName === 'PreScript'
    },
    showTestsScript() {
      return this.activeTabName === 'Tests'
    },
    hiddenHeadersDot() {
      return !(this.headerItems.length > 0 || this.selectedHeadersTemplateNumberList.length > 0)
    },
    hiddenBodyDot() {
      if (this.bodyMode === 'raw' || this.bodyMode === 'custom') {
        if (this.bodyCode === '') return true
      } else {
        if (this.formItems.length === 0) return true
      }
      return false
    },
    hiddenConfigDot() {
      if (
        this.elementInfo.property.HTTPSampler__encoding === '' &&
        this.elementInfo.property.HTTPSampler__allow_redirects === 'false' &&
        this.elementInfo.property.HTTPSampler__connect_timeout === '' &&
        this.elementInfo.property.HTTPSampler__response_timeout === ''
      ) {
        return true
      }
      return false
    }
  },

  watch: {
    bodyMode(val) {
      if (this.queryMode || val === 'none' || val === 'custom') {
        return
      }
      if (val === 'x-www-form-urlencoded') {
        this.setContentType('application/x-www-form-urlencoded')
        return
      }
      if (val === 'raw') {
        this.setContentType(this.rawTypes[this.rawType])
        return
      }
    },
    rawType(val) {
      if (this.queryMode) return
      this.setContentType(this.rawTypes[val])
    }
  },

  mounted() {
    // 查询或更新模式时先拉取元素信息
    if (this.createMode) return
    // 查询元素信息
    ElementService.queryElementInfo({ elementNo: this.elementNo }).then((response) => {
      this.elementInfo = response.result
      this.initHeaders()
      this.initParams()
      this.initBody()
      this.initFocusActiveTab()
    })

    // 查询元素关联的请求头模板列表
    this.querySelectedHeadersTemplateList()

    // 查询并初始化内置元素（前置脚本和测试脚本）
    ElementService.queryElementBuiltins({ elementNo: this.elementNo }).then((response) => {
      this.builtIn = response.result
      this.builtIn.forEach((item) => {
        if (item.elementType === 'PRE_PROCESSOR') {
          this.$refs.preCodeEditor && this.$refs.preCodeEditor.setValue(item.property.PythonPreProcessor__script)
          return
        }
        if (item.elementType === 'ASSERTION') {
          this.$refs.testsCodeEditor && this.$refs.testsCodeEditor.setValue(item.property.PythonAssertion__script)
          return
        }
      })
    })
  },

  methods: {
    /**
     * 初始化 headers
     */
    initHeaders() {
      const headers = this.elementInfo.property.HTTPSampler__headers
      if (!headers) return
      headers.property.HeaderManager__headers.forEach((item) => {
        this.headerItems.push({
          enabled: item.enabled,
          name: item.property.Header__name,
          value: item.property.Header__value
        })
      })
    },

    /**
     * 初始化 params
     */
    initParams() {
      const params = this.elementInfo.property.HTTPSampler__params
      if (!params) return
      params.property.Arguments__arguments.forEach((item) => {
        this.paramItems.push({
          enabled: item.enabled,
          name: item.property.Argument__name,
          value: item.property.Argument__value,
          desc: item.property.Argument__desc
        })
      })
    },

    /**
     * 初始化 body
     */
    initBody() {
      // 获取 ContentType 请求头
      const contentType = this.headerItems.find((item) => item.name.toLowerCase() === 'content-type')
      // 设置 BodyDataType
      this.setBodyDataType(contentType)
      // 初始化 BodyData
      this.$nextTick(() => {
        this.$refs.bodyCodeEditor && this.$refs.bodyCodeEditor.setValue(this.elementInfo.property.HTTPSampler__data)
      })
      // 初始化 BodyForm
      const form = this.elementInfo.property.HTTPSampler__form
      if (!form) return
      form.property.Arguments__arguments.forEach((item) => {
        this.formItems.push({
          enabled: item.enabled,
          name: item.property.Argument__name,
          value: item.property.Argument__value,
          desc: item.property.Argument__desc
        })
      })
    },

    /**
     * 设置 BodyDataType
     */
    setBodyDataType(contentType) {
      if (!contentType || contentType.value === '') {
        this.bodyMode = 'none'
        return
      }
      if (contentType.value.indexOf('application/x-www-form-urlencoded') > -1) {
        this.bodyMode = 'x-www-form-urlencoded'
        return
      }
      if (contentType.value.indexOf('application/json') > -1) {
        this.bodyMode = 'raw'
        this.rawType = 'json'
        return
      }
      if (contentType.value.indexOf('application/xml') > -1) {
        this.bodyMode = 'raw'
        this.rawType = 'xml'
        return
      }
      if (contentType.value.indexOf('text/plain') > -1) {
        this.bodyMode = 'raw'
        this.rawType = 'text'
        return
      }

      this.bodyMode = 'cutom'
    },

    initFocusActiveTab() {
      if (this.paramItems.length > 0) {
        this.activeTabName = 'Params'
      } else {
        this.activeTabName = 'Body'
      }
    },

    /**
     * 设置 content-type
     */
    setContentType(val) {
      const contentTypeHeader = this.headerItems.find((item) => item.name.toLowerCase() === 'content-type')
      if (contentTypeHeader) {
        contentTypeHeader.value = val
      } else {
        this.headerItems.push({ enabled: true, name: 'content-type', value: val })
      }
    },

    /**
     * 修改元素信息
     */
    async modifySamplerElement() {
      // 校验表单字段
      if (!(await this.checkForm('elementForm'))) return
      // 更新请求参数
      Object.assign(this.elementInfo.property, {
        HTTPSampler__headers: this.headers,
        HTTPSampler__params: this.queryParams,
        HTTPSampler__data: this.bodyData,
        HTTPSampler__form: this.formParams
      })
      // 修改元素和内置元素
      await ElementService.modifyElements([
        {
          elementNo: this.elementNo,
          ...this.elementInfo,
          builtIn: this.pendingSubmitBuiltIn
        }
      ])
      // 修改请求头模板关联
      await ElementService.modifyHttpHeaderTemplateByRefs({
        elementNo: this.elementNo,
        templateNumberList: [...this.selectedHeadersTemplateNumberList]
      })
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
    async createSamplerElement() {
      // 校验表单字段
      if (!(await this.checkForm('elementForm'))) return
      // 更新请求参数
      Object.assign(this.elementInfo.property, {
        HTTPSampler__headers: this.headers,
        HTTPSampler__params: this.queryParams,
        HTTPSampler__data: this.bodyData,
        HTTPSampler__form: this.formParams
      })
      // 新增元素和内置元素
      const response = await ElementService.createElementChildren({
        rootNo: this.metadata.rootNo,
        parentNo: this.metadata.parentNo,
        children: [{ ...this.elementInfo, builtIn: this.pendingSubmitBuiltIn }]
      })
      // 关联请求头模板
      await ElementService.createHttpHeaderTemplateByRefs({
        elementNo: response.result[0],
        templateNumberList: [...this.selectedHeadersTemplateNumberList]
      })
      // 成功提示
      this.$message({ message: '新增元素成功', type: 'info', duration: 2 * 1000 })
      // 关闭tab
      this.$store.commit('pymeter/removeTab', { editorNo: 'UNSAVED_HTTP_SAMPLER' })
      // 重新查询脚本
      this.$store.commit('pymeter/refreshElementTreeNow')
    },

    /**
     * 查询元素关联的请求头模板列表
     */
    querySelectedHeadersTemplateList() {
      ElementService.queryHttpHeaderTemplateRefs({ elementNo: this.elementNo }).then((response) => {
        this.selectedHeadersTemplateNumberList = response.result
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.raw-type {
  margin-left: 40px;
  width: 80px;

  :deep(.el-input__inner) {
    border: 0;
    color: #409eff;
  }

  :deep(.el-select__caret) {
    color: #409eff;
  }
}

:deep(.el-descriptions-item__label) {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
}

:deep(.el-descriptions-item__content) {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
}

:deep(.el-badge__content) {
  top: 20px;
}

:deep(.el-badge__content.is-fixed.is-dot) {
  right: -4px;
}
</style>
