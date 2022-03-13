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
              <HTTPMethodSelect v-model="elementInfo.property.HTTPSampler__method" :disabled="queryMode" />
            </template>
          </el-input>
        </el-form-item>
      </el-form-item>

      <!-- 请求配置tab -->
      <el-tabs v-model="activeTabName">
        <el-tab-pane name="Headers">
          <template #label>
            <el-badge :hidden="hiddenHeadersDot" type="success" is-dot>Headers</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="Params">
          <template #label>
            <el-badge :hidden="queryItems.length == 0" type="success" is-dot>Params</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="Body">
          <template #label>
            <el-badge :hidden="hiddenBodyDot" type="success" is-dot>Body</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="Configuration">
          <template #label>
            <el-badge :hidden="hiddenConfigDot" type="success" is-dot>Configuration</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="PreScript">
          <template #label>
            <el-badge :hidden="preCode == ''" type="success" is-dot>Pre-Script</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="Tests">
          <template #label>
            <el-badge :hidden="testsCode == ''" type="success" is-dot>Tests</el-badge>
          </template>
        </el-tab-pane>
      </el-tabs>

      <!-- 请求头 -->
      <div v-if="showHeadersTab">
        <!-- 请求头模板 -->
        <HTTPHeaderTemplate v-model="selectedHeaderTemplateNumberList" :edit-mode="editMode" />
        <!-- 请求头表格 -->
        <HTTPHeaderTable :data="headerItems" :edit-mode="editMode" />
      </div>

      <!-- 请求参数 -->
      <div v-if="showParameterTab">
        <HTTPQueryTable :data="queryItems" :edit-mode="editMode" />
      </div>

      <!-- 请求主体 -->
      <div v-show="showBodyTab">
        <!-- 主体数据类型单选框 -->
        <span style="display: inline-flex; align-items: center; height: 30px; line-height: 30px">
          <el-radio-group v-model="bodyMode" :disabled="queryMode">
            <el-radio label="none">none</el-radio>
            <el-radio label="x-www-form-urlencoded">x-www-form-urlencoded</el-radio>
            <el-radio label="raw">raw</el-radio>
            <el-radio label="custom">custom</el-radio>
          </el-radio-group>
          <!-- raw data type -->
          <el-select v-if="bodyMode == 'raw'" v-model="bodyRawType" class="raw-type" :disabled="queryMode">
            <el-option key="json" label="JSON" value="json" />
            <el-option key="xml" label="XML" value="xml" />
            <el-option key="text" label="TEXT" value="text" />
          </el-select>
        </span>

        <!-- 表单 -->
        <HTTPFormTable v-if="bodyMode == 'x-www-form-urlencoded'" :data="formItems" :edit-mode="editMode" />

        <!-- 代码编辑器 -->
        <MonacoEditor
          v-if="bodyMode == 'raw' || bodyMode == 'custom'"
          ref="bodyCodeEditorRef"
          v-model="bodyCode"
          language="json"
          :read-only="queryMode"
        />
      </div>

      <!-- 高级配置 -->
      <div v-if="showConfigurationTab">
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
      <div v-show="showPreScriptTab">
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
        <MonacoEditor ref="preCodeEditorRef" v-model="preCode" :read-only="queryMode" />
      </div>

      <!-- 测试脚本 -->
      <div v-show="showTestsScriptTab">
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
        <MonacoEditor ref="testsCodeEditorRef" v-model="testsCode" :read-only="queryMode" />
      </div>

      <!-- 操作按钮 -->
      <el-form-item v-if="queryMode">
        <el-button :icon="Edit" type="primary" @click="editNow()">编 辑</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
      </el-form-item>
      <el-form-item v-else-if="modifyMode">
        <el-button :icon="Check" type="danger" @click="modifySamplerElement()">保 存</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
      </el-form-item>
      <el-form-item v-else-if="createMode">
        <el-button :icon="Check" type="primary" @click="createSamplerElement()">保 存</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { isEmpty as _isEmpty } from 'lodash-es'
import { ElMessage } from 'element-plus'
import { Check, Close, Edit } from '@element-plus/icons-vue'
import * as ElementService from '@/api/script/element'
import editorProps from '@/pymeter/composables/editor.props'
import useEditor from '@/pymeter/composables/useEditor'
import useHTTPBody from './useHTTPBody'
import useHTTPBuiltin from './useHTTPBuiltin'
import useHTTPHeader from './useHTTPHeader'
import useHTTPQuery from './useHTTPQuery'
import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'
import HTTPMethodSelect from './HttpSamplerMethodSelect.vue'
import HTTPHeaderTemplate from './HttpSamplerHeaderTemplate.vue'
import HTTPHeaderTable from './HttpSamplerHeaderTable.vue'
import HTTPQueryTable from './HttpSamplerQueryTable.vue'
import HTTPFormTable from './HttpSamplerFormTable.vue'

const props = defineProps(editorProps)
const { queryMode, modifyMode, createMode, editNow, setReadonly, updateTabName, closeTab, refreshElementTree } =
  useEditor(props)
const elformRef = ref()
const elementNo = ref(props.editorNo)
const elementInfo = ref({
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
})
const elementFormRules = reactive({
  elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }],
  'property.HTTPSampler__url': [{ required: true, message: '请求地址不能为空', trigger: 'blur' }],
  'property.HTTPSampler__method': [{ required: true, message: '请求方法不能为空', trigger: 'blur' }]
})
const configFormRules = reactive({})
const { builtIn, preCode, testsCode, pendingSubmitBuiltIn } = useHTTPBuiltin()
const { headerItems, headers, setContentType } = useHTTPHeader()
const { queryItems, queryParameters } = useHTTPQuery()
const { bodyCode, bodyMode, bodyRawType, bodyRawTypeEnum, bodyData, formItems, formParameters, setBodyMode } =
  useHTTPBody()
const selectedHeaderTemplateNumberList = ref([])
const bodyCodeEditorRef = ref()
const preCodeEditorRef = ref()
const testsCodeEditorRef = ref()
const activeTabName = ref('')
const showHeadersTab = computed(() => activeTabName.value === 'Headers')
const showParameterTab = computed(() => activeTabName.value === 'Params')
const showBodyTab = computed(() => activeTabName.value === 'Body')
const showConfigurationTab = computed(() => activeTabName.value === 'Configuration')
const showPreScriptTab = computed(() => activeTabName.value === 'PreScript')
const showTestsScriptTab = computed(() => activeTabName.value === 'Tests')
const hiddenHeadersDot = computed(
  () => !(!_isEmpty(headerItems.value) || !_isEmpty(selectedHeaderTemplateNumberList.value))
)
const hiddenBodyDot = computed(() => {
  if (bodyMode.value === 'raw' || bodyMode.value === 'custom') {
    if (bodyCode.value === '') return true
  } else {
    if (_isEmpty(formItems.value)) return true
  }
  return false
})
const hiddenConfigDot = computed(() => {
  return (
    elementInfo.value.property.HTTPSampler__encoding === '' &&
    elementInfo.value.property.HTTPSampler__allow_redirects === 'false' &&
    elementInfo.value.property.HTTPSampler__connect_timeout === '' &&
    elementInfo.value.property.HTTPSampler__response_timeout === ''
  )
})

onMounted(() => {
  // 查询或更新模式时，先拉取元素信息
  if (createMode.value) return
  // 查询元素信息
  ElementService.queryElementInfo({ elementNo: elementNo.value }).then((response) => {
    elementInfo.value = response.result
    mountHeaderItems()
    mountQueryItems()
    mountBody()
    initFocusActiveTab()
  })

  // 查询元素关联的请求头模板列表
  querySelectedHeaderTemplateList()

  // 查询并初始化内置元素（前置脚本和测试脚本）
  ElementService.queryElementBuiltins({ elementNo: elementNo.value }).then((response) => {
    builtIn.value = response.result
    builtIn.value.forEach((item) => {
      if (item.elementType === 'PRE_PROCESSOR') {
        preCodeEditorRef.value && preCodeEditorRef.value.setValue(item.property.PythonPreProcessor__script)
        return
      }
      if (item.elementType === 'ASSERTION') {
        testsCodeEditorRef.value && testsCodeEditorRef.value.setValue(item.property.PythonAssertion__script)
        return
      }
    })
  })
})
</script>

<script>
export default {
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
        this.setContentType(this.bodyRawTypeEnum[this.bodyRawType])
        return
      }
    },
    bodyRawType(val) {
      if (this.queryMode) return
      this.setContentType(this.bodyRawTypeEnum[val])
    }
  },

  methods: {
    /**
     * 初始化 headers
     */
    mountHeaderItems() {
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
    mountQueryItems() {
      const params = this.elementInfo.property.HTTPSampler__params
      if (!params) return
      params.property.Arguments__arguments.forEach((item) => {
        this.queryItems.push({
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
    mountBody() {
      // 获取 ContentType 请求头
      const contentType = this.headerItems.find((item) => item.name.toLowerCase() === 'content-type')
      // 设置 BodyDataType
      this.setBodyMode(contentType)
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

    initFocusActiveTab() {
      if (this.queryItems.length > 0) {
        this.activeTabName = 'Params'
      } else {
        this.activeTabName = 'Body'
      }
    },

    /**
     * 修改元素
     */
    async modifySamplerElement() {
      // 校验表单字段
      if (!(await this.checkForm('elementForm'))) return
      // 更新请求参数
      Object.assign(this.elementInfo.property, {
        HTTPSampler__headers: this.headers,
        HTTPSampler__params: this.queryParameters,
        HTTPSampler__data: this.bodyData,
        HTTPSampler__form: this.formParameters
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
        templateNumberList: [...this.selectedHeaderTemplateNumberList]
      })
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
    async createSamplerElement() {
      // 校验表单字段
      if (!(await this.checkForm('elementForm'))) return
      // 更新请求参数
      Object.assign(this.elementInfo.property, {
        HTTPSampler__headers: this.headers,
        HTTPSampler__params: this.queryParameters,
        HTTPSampler__data: this.bodyData,
        HTTPSampler__form: this.formParameters
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
        templateNumberList: [...this.selectedHeaderTemplateNumberList]
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
    querySelectedHeaderTemplateList() {
      ElementService.queryHttpHeaderTemplateRefs({ elementNo: this.elementNo }).then((response) => {
        this.selectedHeaderTemplateNumberList = response.result
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
