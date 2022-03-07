<template>
  <el-card shadow="hover">
    <!-- tabs头 -->
    <el-tabs v-show="tabs.length > 0" v-model="activeTabNo" type="card" closable @tab-remove="handleTabRemove">
      <el-tab-pane v-for="tab in tabs" :key="tab.editorNo" :label="tab.editorName" :name="tab.editorNo" />
    </el-tabs>

    <!-- 顶栏 -->
    <Topbar :component="activeTab.editorComponent" />

    <!-- pymeter 组件 -->
    <el-scrollbar id="editor-main-scrollbar" style="width: 100%; height: 100%" wrap-style="overflow-x:auto;">
      <keep-alive>
        <component
          :is="editors[activeTab.editorComponent]"
          :key="activeTab.editorNo"
          :editor-no="activeTab.editorNo"
          :editor-mode="activeTab.editorMode"
          :metadata="activeTab.metadata"
        />
      </keep-alive>
    </el-scrollbar>

    <!-- 回到顶部按钮 -->
    <el-backtop target="#editor-main-scrollbar .el-scrollbar__wrap" :right="20" :bottom="60" />
  </el-card>
</template>

<script setup>
import { mapState } from 'vuex'
import { markRaw, defineAsyncComponent } from 'vue'
import Topbar from './topbar/Topbar.vue'
</script>

<script>
export default {
  name: 'EditorMain',
  data() {
    return {
      editors: {
        TestCollection: markRaw(defineAsyncComponent(() => import('./collections/TestCollection.vue'))),
        // TestSnippets: SnippetsEditor,
        TestGroup: markRaw(defineAsyncComponent(() => import('./groups/TestGroup.vue'))),
        SetupGroup: markRaw(defineAsyncComponent(() => import('./groups/SetupGroup.vue'))),
        TeardownGroup: markRaw(defineAsyncComponent(() => import('./groups/TeardownGroup.vue'))),
        SetupGroupDebuger: markRaw(defineAsyncComponent(() => import('./groups/SetupGroupDebuger.vue'))),
        TeardownGroupDebuger: markRaw(defineAsyncComponent(() => import('./groups/TeardownGroupDebuger.vue'))),
        // HTTPSampler: HTTPSamplerEditor,
        PythonSampler: markRaw(defineAsyncComponent(() => import('./samplers/PythonSampler.vue')))
        // SnippetSampler: SnippetSamplerEditor,
        // PythonPreProcessor: PythonPreProcessorEditor,
        // PythonPostProcessor: PythonPostProcessorEditor,
        // PythonAssertion: PythonAssertionEditor,
        // IfController: IfControllerEditor,
        // ForInController: ForInControllerEditor,
        // LoopController: LoopControllerEditor,
        // RetryController: RetryControllerEditor,
        // TransactionController: TransactionControllerEditor,
        // WhileController: WhileControllerEditor,
        // VariableDataset: VariableDatasetEditor,
        // HttpHeadersTemplate: HttpHeadersTemplateEditor,
        // ConstantTimer: ConstantTimerEditor
      }
    }
  },

  computed: {
    ...mapState('pymeter', {
      tabs: (state) => state.tabs
    }),
    activeTabNo: {
      get() {
        return this.$store.state.pymeter.activeTabNo
      },
      set(val) {
        this.$store.commit('pymeter/setActiveTabNo', val)
      }
    },
    activeTab() {
      let tab = this.tabs.filter((tab) => tab.editorNo === this.activeTabNo)[0]
      if (!tab) tab = { editorComponent: '' }
      return tab
    }
  },

  methods: {
    /**
     * 关闭tab的回调
     */
    handleTabRemove(tabNo) {
      this.$store.commit({ type: 'pymeter/removeTab', editorNo: tabNo })
    }
  }
}
</script>

<style lang="scss" scoped>
.el-card {
  display: flex;
  flex: 1;
  flex-direction: column;
}

:deep(.el-card__body) {
  display: flex;
  flex: 1;
  flex-direction: column;

  padding: 0;
  overflow: auto;
}

:deep(.el-tabs__header) {
  margin: 0 0 10px;
}

:deep(.el-tabs__item) {
  user-select: none;
}

:deep(.el-tabs--card > .el-tabs__header .el-tabs__nav) {
  border-top: none;

  &:first-child {
    border-left: none;
  }
}
</style>
