<template>
  <el-drawer direction="btt" size="50%" custom-class="pymeter-footer-log-drawer" :show-close="false">
    <template #title>
      <span class="drawer-title">
        <span>执行日志</span>
        <el-button type="danger" :icon="Delete" circle plain @click="clean()" />
      </span>
    </template>

    <MonacoEditor ref="logEditorRef" key="logCode" language="log" :read-only="true" />
  </el-drawer>
</template>

<script setup>
import { ref, computed, watch, useAttrs, nextTick } from 'vue'
import { useStore } from 'vuex'
import { Delete } from '@element-plus/icons-vue'
import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'

const emit = defineEmits(['update:data'])
const props = defineProps({
  data: Array
})
const attrs = useAttrs()
const store = useStore()
const logEditorRef = ref()
const visible = ref(attrs.modelValue)

const logs = computed({
  get() {
    return props.data
  },
  set(val) {
    emit('update:data', val)
  }
})
watch(logs, () => {
  if (!visible.value) return
  logEditorRef.value && logEditorRef.value.setValue(logs.value.join(''))
})
watch(visible, () => {
  if (!visible.value) return
  nextTick(() => {
    logEditorRef.value && logEditorRef.value.setValue(logs.value.join(''))
  })
})

const clean = () => {
  logs.value = []
  logEditorRef.value && logEditorRef.value.setValue('')
  store.commit('pymeter/closeLogDrawer')
}
</script>

<style lang="scss" scoped>
.drawer-title {
  display: inline-flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;

  padding: 10px 10px 0 10px;
  margin-bottom: 10px;
}
</style>
