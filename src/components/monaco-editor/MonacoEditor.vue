<template>
  <div style="display: flex; flex-direction: column; width: 100%; height: 100%">
    <div ref="editor" class="code-editor-container" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, defineEmit, ref } from 'vue'
import * as monaco from 'monaco-editor'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import PythonWorker from 'monaco-editor/esm/vs/language/python/python.worker?worker'

import DEFAULT_OPTIONS from './options'

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new JsonWorker()
    }
    if (label === 'python') {
      return new PythonWorker()
    }
    return new EditorWorker()
  }
}

const props = defineProps({
  modelValue: { type: String },
  fontSize: { type: Number, default: 14 },
  language: { type: String },
  readOnly: { type: Boolean, default: false },
  theme: { type: String, default: 'vs' }
})
const emit = defineEmit(['update:modelValue'])
const editor = ref()

let instance
onMounted(() => {
  instance = monaco.editor.create(editor.value, {
    fontSize: this.fontSize,
    language: this.language,
    readOnly: this.readOnly,
    theme: this.theme,
    value: props.modelValue,
    ...DEFAULT_OPTIONS
  })

  instance.onDidChangeModelContent(() => {
    const value = instance.getValue()
    emit('update:modelValue', value)
  })
})
onUnmounted(() => {
  instance && instance.dispose()
})
</script>

<style lang="scss" scoped>
.code-editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  margin-bottom: 10px;

  width: 100%;
  height: 300px;

  flex-grow: 1;
}
</style>
