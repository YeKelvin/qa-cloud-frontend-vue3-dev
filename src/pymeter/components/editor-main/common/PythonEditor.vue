<template>
  <div class="python-editor-container">
    <MonacoEditor
      ref="pythonEditor"
      v-model="localModelValue"
      class="python-editor"
      language="python"
      :read-only="readOnly"
    />
    <div class="snippet-code-container">
      <span class="snippet-title">代码片段</span>
      <el-scrollbar style="width: 100%; height: 100%" wrap-style="overflow-x:auto;">
        <ul class="snippet-code-list">
          <li @click="getVarSnippet()">获取局部变量</li>
          <li @click="getPropSnippet()">获取全局变量</li>
          <template v-if="type == 'HTTP' && phase == 'POST' && phase == 'ASSERT'">
            <li @click="getResponseJsonSnippet()">获取Json响应</li>
          </template>
          <li @click="setVarSnippet()">设置局部变量</li>
          <li @click="setPropSnippet()">设置全局变量</li>
          <li @click="outputLogInfo()">输出日志</li>
          <template v-if="phase == 'ASSERT'">
            <li @click="assertion()">断言</li>
          </template>
        </ul>
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'

export default {
  components: { MonacoEditor },
  props: {
    readOnly: Boolean,
    phase: String, // PRE | SAMPLER | POST | ASSERTION
    type: String // PYTHON | HTTP
  },
  emits: ['update:modelValue'],
  computed: {
    localModelValue: {
      get() {
        return this.$attrs.modelValue
      },
      set(val) {
        this.$emit('update:modelValue', val)
      }
    }
  },
  methods: {
    /**
     * 设置编辑器内容
     */
    setValue(val) {
      this.$refs.pythonEditor.setValue(val)
    },

    /**
     * 获取编辑器内容
     */
    getValue() {
      return this.$refs.pythonEditor.getValue()
    },

    getVarSnippet() {
      let selection = this.$refs.pythonEditor.getSelectionValue()
      selection = selection || 'name'
      this.$refs.pythonEditor.insertSnippet(`vars.get('\${1:${selection}}')`)
      this.$refs.pythonEditor.focus()
    },
    getPropSnippet() {
      let selection = this.$refs.pythonEditor.getSelectionValue()
      selection = selection || 'name'
      this.$refs.pythonEditor.insertSnippet(`props.get('\${1:${selection}}')`)
      this.$refs.pythonEditor.focus()
    },
    getResponseJsonSnippet() {
      this.$refs.pythonEditor.insert('res = result.json\n')
      this.$refs.pythonEditor.focus()
    },
    setVarSnippet() {
      let selection = this.$refs.pythonEditor.getSelectionValue()
      selection = selection || 'value'
      this.$refs.pythonEditor.insertSnippet(`vars.set('\${1:name}', '\${2:${selection}}')`)
      this.$refs.pythonEditor.focus()
    },
    setPropSnippet() {
      let selection = this.$refs.pythonEditor.getSelectionValue()
      selection = selection || 'value'
      this.$refs.pythonEditor.insertSnippet(`props.set('\${1:name}', '\${2:${selection}}')`)
      this.$refs.pythonEditor.focus()
    },
    outputLogInfo() {
      const selection = this.$refs.pythonEditor.getSelectionValue()
      if (selection) {
        this.$refs.pythonEditor.insert(`log.info(f'{${selection}=}')\n`)
      } else {
        this.$refs.pythonEditor.insertSnippet("log.info('${1:content}')\n")
      }
      this.$refs.pythonEditor.focus()
    },
    assertion() {
      this.$refs.pythonEditor.insertSnippet("assert ${1:condition}, '${2:message}'\n")
      this.$refs.pythonEditor.focus()
    }
  }
}
</script>

<style lang="scss" scoped>
.python-editor-container {
  display: flex;
}

.python-editor {
  flex: 1;
}

.snippet-code-container {
  width: 120px;
  min-width: 120px;
  max-width: 120px;
  height: 300px;
  padding-bottom: 20px;
}

.snippet-title {
  padding: 0 10px;
  color: #606266;
  font-weight: bold;
}

.snippet-code-list {
  margin: 0;
  padding: 10px;

  li {
    list-style-type: none;
    cursor: pointer;
    color: #409eff;
    font-size: inherit;
    font-family: inherit;
    padding-bottom: 5px;
  }
}
</style>
