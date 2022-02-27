<template>
  <el-card shadow="hover">
    <!-- tabs头 -->
    <el-tabs v-show="tabs.length > 0" v-model="activeTabNo" type="card" closable @tab-remove="handleTabRemove">
      <el-tab-pane v-for="tab in tabs" :key="tab.editorNo" :label="tab.editorName" :name="tab.editorNo" />
    </el-tabs>

    <!-- 中间栏 -->
    <middle-bar :component="activeTab.editorComponent" />

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
// ** PyMeter Components ******************************************************************************************** /
import CollectionEditor from './collections/collection-editor'
import SnippetsEditor from './collections/snippets-editor'
import GroupEditor from './groups/group-editor'
import SetupGroupEditor from './groups/setup-group-editor'
import TeardownGroupEditor from './groups/teardown-group-editor'
import SetupGroupDebugerEditor from './groups/setup-group-debuger-editor'
import TeardownGroupDebugerEditor from './groups/teardown-group-debuger-editor'
import HTTPSamplerEditor from './samplers/http-sampler-editor'
import PythonSamplerEditor from './samplers/python-sampler-editor'
import SnippetSamplerEditor from './samplers/snippet-sampler-editor'
import PythonPreProcessorEditor from './pre-processors/python-pre-processor-editor'
import PythonPostProcessorEditor from './post-processors/python-post-processor-editor'
import PythonAssertionEditor from './assertions/python-assertion-editor'
import IfControllerEditor from './controllers/if-controller-editor'
import ForInControllerEditor from './controllers/for-in-controller-editor'
import LoopControllerEditor from './controllers/loop-controller-editor'
import RetryControllerEditor from './controllers/retry-controller-editor'
import TransactionControllerEditor from './controllers/transaction-controller-editor'
import WhileControllerEditor from './controllers/while-controller-editor'
import VariableDatasetEditor from './configs/variable-dataset-editor'
import HttpHeadersTemplateEditor from './configs/http-headers-template-editor'
import ConstantTimerEditor from './timers/constant-timer-editor'
// ** PyMeter Components ******************************************************************************************** /
import { mapState } from 'vuex'
import middleBar from './middle-bar'
</script>

<script>
export default {
  name: 'EditorMain',
  data() {
    return {
      editors: {
        TestCollection: CollectionEditor,
        TestSnippets: SnippetsEditor,
        TestGroup: GroupEditor,
        SetupGroup: SetupGroupEditor,
        TeardownGroup: TeardownGroupEditor,
        SetupGroupDebuger: SetupGroupDebugerEditor,
        TeardownGroupDebuger: TeardownGroupDebugerEditor,
        HTTPSampler: HTTPSamplerEditor,
        PythonSampler: PythonSamplerEditor,
        SnippetSampler: SnippetSamplerEditor,
        PythonPreProcessor: PythonPreProcessorEditor,
        PythonPostProcessor: PythonPostProcessorEditor,
        PythonAssertion: PythonAssertionEditor,
        IfController: IfControllerEditor,
        ForInController: ForInControllerEditor,
        LoopController: LoopControllerEditor,
        RetryController: RetryControllerEditor,
        TransactionController: TransactionControllerEditor,
        WhileController: WhileControllerEditor,
        VariableDataset: VariableDatasetEditor,
        HttpHeadersTemplate: HttpHeadersTemplateEditor,
        ConstantTimer: ConstantTimerEditor
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
