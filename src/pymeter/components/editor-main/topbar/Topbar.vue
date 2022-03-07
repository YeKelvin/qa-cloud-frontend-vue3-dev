<template>
  <div v-show="show" class="topbar-container">
    <!-- 操作栏 -->
    <div class="topbar-main">
      <!-- 左侧：组件名称 -->
      <div style="user-select: none">{{ componentName }}</div>

      <!-- 右侧：操作区域 -->
      <span class="dataset-container">
        <!-- 变量集选择器 -->
        <DatasetSelect :show="show" />
        <!-- 详情按钮 -->
        <el-button type="text" size="small" :icon="View" @click="showVariables = true" />
      </span>
    </div>

    <!-- 华丽丽的分割线 -->
    <el-divider />

    <!-- 变量详情视图 -->
    <VariablesDialog v-if="showVariablesDialog" v-model="showVariablesDialog" />
  </div>
</template>

<script setup>
import { View } from '@element-plus/icons-vue'
import { isEmpty } from 'lodash-es'
import DatasetSelect from './DatasetSelect.vue'
import VariablesDialog from './VariablesDialog.vue'
</script>

<script>
export default {
  name: 'Topbar',
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
      showVariablesDialog: false
    }
  },

  computed: {
    // 组件名称
    componentName() {
      return this.componentNames[this.component]
    },

    // 是否显示操作栏的标识
    show() {
      return !isEmpty(this.componentName)
    }
  }
}
</script>

<style lang="scss" scoped>
.topbar-container {
  padding: 0 10px;

  .el-divider--horizontal {
    margin: 10px 0;
  }
}

.topbar-main {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
}

.dataset-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

.el-button--text {
  margin: 0 5px;
  font-size: 15px;

  :deep(.el-icon-view) {
    font-weight: 500;
  }
}
</style>
