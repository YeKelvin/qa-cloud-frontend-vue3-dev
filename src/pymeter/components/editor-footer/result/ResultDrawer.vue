<template>
  <el-drawer direction="btt" size="50%" :show-close="false" v-bind="$attrs" @open="setFirstLoading">
    <span slot="title" class="drawer-title">
      <el-tabs
        v-model="activeTabNo"
        type="card"
        style="width: 100%"
        closable
        @tab-click="handleTabClick"
        @tab-remove="handleTabRemove"
      >
        <el-tab-pane v-for="tab in tabs" :key="tab.id" :label="tab.name" :name="tab.id" />
      </el-tabs>
      <div v-show="tabs.length > 0" style="padding: 4px; padding-right: 20px; border-bottom: 1px solid #e4e7ed">
        <el-button type="danger" icon="el-icon-delete" size="small" circle plain @click="clean()" />
      </div>
    </span>

    <ResultCollector v-if="tabs.length > 0" :groups="activeDetails" />
    <el-empty v-if="tabs.length == 0 && !loading" description="暂无结果" />
    <el-skeleton :loading="loading" :rows="6" style="padding: 40px" animated />
  </el-drawer>
</template>

<script>
import ResultCollector from './ResultCollector.vue'

export default {
  name: 'ResultDrawer',

  components: { ResultCollector },

  data() {
    return {
      activeTabNo: '',
      activeDetails: [],
      loading: false
    }
  },

  computed: {
    tabs: {
      get() {
        return this.$attrs.value
      },
      set(val) {
        this.$emit('input', val)
      }
    }
  },

  watch: {
    tabs(val) {
      if (val.length === 0) return
      // 停止 loading
      this.loading = false
      // 激活最新的 tab
      const result = val[val.length - 1]
      this.activeTabNo = result.id
      this.activeDetails = result.details
    }
  },

  methods: {
    handleTabClick(tab) {
      const result = this.tabs.find((result) => result.id === tab.name)
      this.activeDetails = result.details
    },
    handleTabRemove(tabName) {
      const index = this.tabs.findIndex((result) => result.id === tabName)
      if (index > -1) {
        this.tabs.splice(index, 1)
      }
    },
    clean() {
      this.tabs = []
      this.$store.commit('pymeter/closeResultDrawer')
    },
    setFirstLoading() {
      if (!this.$socket.id) return
      if (this.tabs.length > 0) return
      this.loading = true
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

  margin-bottom: 10px;
}

:deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 0;
}

:deep(.el-drawer__body) {
  overflow: hidden;
}

:deep(.el-tabs__header) {
  margin: 0;
}
</style>
