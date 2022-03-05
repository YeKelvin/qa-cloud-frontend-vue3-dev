<template>
  <textarea ref="textarea" class="base-textarea" v-bind="$attrs" :value="value" @input="handleInput" />
</template>

<script>
export default {
  name: 'SimpleTextarea',
  props: {
    value: { type: String, default: '' }
  },
  emits: ['input'],
  mounted() {
    if (this.value) {
      this.resize()
    }
  },

  methods: {
    handleInput(event) {
      this.$emit('input', event.target.value)
      this.$nextTick(this.resize)
    },
    resize() {
      this.$refs.textarea.style.height = `${this.$refs.textarea.scrollHeight}px`
    }
  }
}
</script>

<style lang="scss" scoped>
.base-textarea {
  overflow: hidden;
  position: relative;
  display: block;
  resize: vertical;
  padding: 5px 15px;
  box-sizing: border-box;
  font-size: 12px;
  line-height: 1.5;
  min-height: 29px;
  height: 29px;
  width: 100%;
  color: #606266;
  background-color: #fff;
  background-image: none;
  border: 0;
  border-bottom: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);

  &::placeholder {
    color: #c0c4cc;
  }

  &:hover {
    border-color: #c0c4cc;
  }

  &:focus {
    outline: none;
    border-color: #409eff;
  }
}
</style>
