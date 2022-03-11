<template>
  <el-drawer direction="btt" size="50%" custom-class="pymeter-footer-log-drawer" :show-close="false">
    <template #title>
      <span class="drawer-title">
        <span class="title-name">执行日志</span>
        <el-button type="danger" :icon="Delete" circle plain @click="clean()" />
      </span>
    </template>

    <MonacoEditor ref="logEditorRef" language="log" :read-only="true" />
  </el-drawer>
</template>

<script setup>
import { Delete } from '@element-plus/icons-vue'
import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'

const emit = defineEmits(['update:data'])
const props = defineProps({
  data: Array
})
const attrs = useAttrs()
const store = useStore()
const logEditorRef = ref()
const visible = computed(() => attrs.modelValue)

const logs = computed({
  get() {
    return props.data
  },
  set(val) {
    emit('update:data', val)
  }
})
watch(
  logs,
  () => {
    if (!visible.value) return
    logEditorRef.value && logEditorRef.value.setValue(logs.value.join(''))
  },
  { deep: true }
)
watch(visible, () => {
  if (!visible.value) return
  nextTick(() => {
    logEditorRef.value && logEditorRef.value.setValue(logs.value.join(''))
  })
})

/**
 * 清空日志
 */
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

.title-name {
  font-weight: bold;
  font-size: 16px;
  box-shadow: -4px 0 0 0 #f56c6c;
  padding: 0 10px;
}
</style>
