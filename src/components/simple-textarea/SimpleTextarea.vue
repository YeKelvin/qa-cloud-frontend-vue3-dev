<template>
  <textarea ref="textareaRef" class="simple-textarea" :value="$attrs.modelValue" @input="handleInput" />
</template>

<script setup>
const emit = defineEmits(['update:modelValue'])
const attrs = useAttrs()
const textareaRef = ref()

onMounted(() => {
  if (attrs.modelValue) {
    resize()
  }
})

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
  nextTick(resize)
}

const resize = () => {
  textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`
}
</script>

<style lang="scss" scoped>
.simple-textarea {
  display: table-cell;
  vertical-align: middle;
  position: relative;
  overflow: hidden;
  resize: vertical;
  padding: 0 10px;
  outline: 0;
  box-sizing: border-box;
  color: #606266;
  font-size: inherit;
  font-family: inherit;
  letter-spacing: 0.6px;
  line-height: 32px;
  height: 32px;
  width: 100%;
  background-color: #ffffff;
  background-image: none;
  border: 0;
  border-bottom: 1px solid #dcdfe6;
  border-radius: 4px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);

  &::placeholder {
    color: #a8abb2;
  }

  &:hover {
    border-color: #a8abb2;
  }

  &:focus {
    outline: none;
    border-color: #409eff;
  }
}
</style>
