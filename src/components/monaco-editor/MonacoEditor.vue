<template>
  <div style="display: flex; flex-direction: column; width: 100%; height: 100%">
    <div ref="editorRef" class="code-editor-container" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import monaco from './monaco.base'
import monacoOptions from './monaco.options'

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  fontSize: { type: Number, default: 14 },
  language: { type: String, required: true },
  readOnly: { type: Boolean, default: false },
  theme: { type: String, default: 'vs' }
})
const editorRef = ref()

watch(
  () => props.readOnly,
  (val) => instance.updateOptions({ readOnly: val })
)

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

/**
 * 插入内容
 */
const insert = (val) => {
  const position = instance.getPosition()
  instance.executeEdits('', [
    {
      range: {
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      },
      text: val,
      forceMoveMarkers: true
    }
  ])
}

/**
 * 设置编辑器内容
 */
const setValue = (val) => {
  instance.setValue(val)
}

/**
 * 获取编辑器内容
 */
const getValue = () => {
  return instance.getValue()
}

/**
 * 获取选中的内容
 */
const getSelection = () => {
  return instance.getSelection()
}

/**
 * 获取光标定位
 */
const getCursorPosition = () => {
  const { column, lineNumber } = instance.getPosition()
  return { column: column, lineNumber: lineNumber }
}

/**
 * 设置光标定位
 */
const setCursorPosition = ({ column, lineNumber }) => {
  instance.setPosition({ column: column, lineNumber: lineNumber })
}

/**
 * 激活编辑器
 */
const focus = () => {
  instance.focus()
}

/**
 * 格式化代码
 */
const formatDocument = () => {
  if (props.readOnly) {
    instance.updateOptions({ readOnly: false })
  }
  instance
    .getAction('editor.action.formatDocument')
    .run()
    .then(() => instance.updateOptions({ readOnly: props.readOnly }))
}

defineExpose({
  insert,
  setValue,
  getValue,
  getSelection,
  getCursorPosition,
  setCursorPosition,
  focus,
  formatDocument
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
