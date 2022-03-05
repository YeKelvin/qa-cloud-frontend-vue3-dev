<template>
  <div v-show="show" class="middle-bar-container">

    <!-- 操作栏 -->
    <div class="middle-bar-body">

      <!-- 左侧：组件名称 -->
      <div style="user-select: none;">{{ componentName }}</div>

      <!-- 右侧：操作区域 -->
      <span class="dataset-selector-container">
        <!-- 变量集选择器 -->
        <variable-dataset-selector :show="show" />
        <!-- 详情按钮 -->
        <el-button type="text" icon="el-icon-view" size="mini" @click="showVariables=true" />
      </span>
    </div>

    <!-- 华丽丽的分割线 -->
    <el-divider />

    <!-- 变量详情视图 -->
    <variables-view v-if="showVariables" :visible.sync="showVariables" />
  </div>
</template>

<script>
import * as StringUtil from '@/utils/string-util'
import VariableDatasetSelector from './variable-dataset-selector'
import VariablesView from './variables-view'

export default {

  name: 'MiddleBar',

  components: { VariableDatasetSelector, VariablesView },

  props: {
    component: { type: String, default: '' }
  },

  data() {
    return {
      // 组件名称
      componentNames: {
        TestCollection: '测试集合',
        TestSnippets: '测试片段',
        TestGroup: '测试分组',
        SetupGroup: '前置分组',
        TeardownGroup: '后置分组',
        SetupGroupDebuger: '前置分组调试器',
        TeardownGroupDebuger: '后置分组调试器',
        IfController: 'If控制器',
        WhileController: 'While控制器',
        ForInController: '遍历控制器',
        LoopController: '循环控制器',
        RetryController: '重试控制器',
        TransactionController: '事务控制器',
        HTTPSampler: 'HTTP请求',
        PythonSampler: 'Python请求',
        SnippetSampler: 'Snippet请求',
        PythonPreProcessor: 'Python前置脚本',
        PythonPostProcessor: 'Python后置脚本',
        PythonAssertion: 'Python断言',
        ConstantTimer: '固定定时器'
      },

      // 是否显示变量详情视图
      showVariables: false
    }
  },

  computed: {
    // 组件名称
    componentName() { return this.componentNames[this.component] },

    // 是否显示操作栏的标识
    show() { return StringUtil.isNotBlank(this.componentName) }
  },

  methods: {
  }

}
</script>

<style lang="scss" scoped>
.middle-bar-container {
  padding: 0 10px;

  .el-divider--horizontal {
    margin: 10px 0;
  }
}

.middle-bar-body {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
}

.dataset-selector-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

.el-button--text {
  margin: 0 5px;
  font-size: 15px;

  ::v-deep .el-icon-view {
    font-weight: 500;
  }
}
</style>
