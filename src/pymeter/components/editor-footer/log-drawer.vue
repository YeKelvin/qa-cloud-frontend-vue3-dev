<template>
  <el-drawer
    direction="btt"
    size="50%"
    :show-close="false"
    v-bind="$attrs"

  >
    <span slot="title" class="drawer-title">
      <span>执行日志</span>
      <el-button type="danger" icon="el-icon-delete" size="small" circle plain @click="clean()" />
    </span>

    <monaco-editor ref="logEditor" key="logCode" language="log" :read-only="true" />
  </el-drawer>
</template>

<script>
import MonacoEditor from '@/components/MonacoEditor'

export default {

  name: 'LogDrawer',

  components: { MonacoEditor },

  data() {
    return {
    }
  },

  computed: {
    logs: {
      get() {
        return this.$attrs.value
      },
      set(val) {
        this.$emit('input', val)
      }
    }
  },

  watch: {
    '$attrs.visible'(val) {
      if (!val) return
      this.$nextTick(() => {
        this.$refs.logEditor && this.$refs.logEditor.setValue(this.logs.join(''))
      })
    },
    logs(val) {
      if (!this.$attrs.visible) return
      this.$refs.logEditor && this.$refs.logEditor.setValue(val.join(''))
    }
  },

  methods: {
    clean() {
      this.logs = []
      this.$refs.logEditor && this.$refs.logEditor.setValue('')
      this.$store.commit('pymeter/closeLogDrawer')
    }
  }
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

:deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 0;
}
</style>
