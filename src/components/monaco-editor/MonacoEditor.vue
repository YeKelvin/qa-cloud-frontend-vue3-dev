<template>
  <div style="display: flex; flex-direction: column; width: 100%; height: 100%">
    <div ref="editorRef" class="code-editor-container" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import monaco from './monaco.base'
import monacoOptions from './monaco.options'

const props = defineProps({
  modelValue: { type: String },
  fontSize: { type: Number, default: 14 },
  language: { type: String, required: true },
  readOnly: { type: Boolean, default: false },
  theme: { type: String, default: 'vs' }
})
const emit = defineEmits(['update:modelValue'])
const editorRef = ref()

let instance
onMounted(() => {
  instance = monaco.editor.create(editorRef.value, {
    fontSize: props.fontSize,
    language: props.language,
    readOnly: props.readOnly,
    theme: props.theme,
    value: props.modelValue,
    ...monacoOptions
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
