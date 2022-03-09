<template>
  <el-dropdown trigger="click" placement="bottom" :show-timeout="50" :hide-timeout="50">
    <!-- 菜单弹出按钮 -->
    <el-button type="text" :icon="More" />
    <!-- 菜单 -->
    <template #dropdown>
      <el-dropdown-menu>
        <!-- Group -->
        <template v-if="data.elementClass == 'TestCollection'">
          <el-dropdown-item @click="openNewGroupTab(node)">新增测试分组</el-dropdown-item>
          <el-dropdown-item @click="openNewSetupGroupTab(node)">新增前置分组</el-dropdown-item>
          <el-dropdown-item @click="openNewTeardownGroupTab(node)">新增后置分组</el-dropdown-item>
        </template>

        <template v-if="data.elementClass == 'TestSnippets'">
          <el-dropdown-item @click="openNewSetupGroupDebugerTab(node)">新增前置分组调试器</el-dropdown-item>
          <el-dropdown-item @click="openNewTeardownGroupDebugerTab(node)">新增后置分组调试器</el-dropdown-item>
        </template>

        <!-- Sampler -->
        <template v-if="isShowSampler(node)">
          <el-dropdown-item :divided="data.elementClass == 'TestSnippets'" @click="openNewHttpSamplerTab(node)">
            新增HTTP请求
          </el-dropdown-item>
          <el-dropdown-item @click="openNewPythonSamplerTab(node)">新增Python请求</el-dropdown-item>
          <el-dropdown-item @click="openNewSnippetSamplerTab(node)">新增Snippet请求</el-dropdown-item>
        </template>

        <!-- PreProcessor -->
        <template v-if="data.elementType == 'SAMPLER'">
          <el-dropdown-item @click="openNewPythonPreProcessorTab(node)">新增Python前置脚本</el-dropdown-item>
        </template>

        <!-- PostProcessor -->
        <template v-if="data.elementType == 'SAMPLER'">
          <el-dropdown-item divided @click="openNewPythonPostProcessorTab(node)">新增Python后置脚本</el-dropdown-item>
        </template>

        <!-- Assertion -->
        <template v-if="data.elementType == 'SAMPLER'">
          <el-dropdown-item divided @click="openNewPythonAssertionTab(node)">新增Python断言</el-dropdown-item>
        </template>

        <!-- Controller -->
        <template v-if="isShowController(node)">
          <el-dropdown-item divided @click="openNewIfControllerTab(node)">新增if控制器</el-dropdown-item>
          <el-dropdown-item @click="openNewWhileControllerTab(node)">新增while控制器</el-dropdown-item>
          <el-dropdown-item @click="openNewForInControllerTab(node)">新增遍历控制器</el-dropdown-item>
          <el-dropdown-item @click="openNewLoopControllerTab(node)">新增循环控制器</el-dropdown-item>
          <el-dropdown-item @click="openNewRetryControllerTab(node)">新增重试控制器</el-dropdown-item>
          <el-dropdown-item @click="openNewTransactionControllerTab(node)">新增事务控制器</el-dropdown-item>
        </template>

        <!-- 复制元素按钮 -->
        <template v-if="data.elementType == 'COLLECTION'">
          <el-dropdown-item divided @click="copyElementToWorkspace(data)">复制到空间</el-dropdown-item>
          <el-dropdown-item @click="moveElementToWorkspace(data)">移动到空间</el-dropdown-item>
        </template>
        <template v-else>
          <el-dropdown-item divided @click="duplicateElement(data)">复制</el-dropdown-item>
        </template>

        <!-- 状态变更按钮 -->
        <el-dropdown-item v-if="!data.enabled" divided @click="enableElement(data)">启用</el-dropdown-item>
        <el-dropdown-item v-else divided @click="disableElement(data)">禁用</el-dropdown-item>

        <!-- 删除按钮 -->
        <el-dropdown-item divided @click="removeElement(data)">删除</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="jsx" setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { More } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import * as ElementService from '@/api/script/element'
import useWorkspaceState from '@/composables/useWorkspaceState'
import WorkspaceTree from '@/pymeter/components/editor-aside/common/WorkspaceTree.vue'

const props = defineProps({
  node: Object
})
const data = computed(() => props.node.data)
const store = useStore()
const { workspaceNo, workspaceList } = useWorkspaceState()

const isShowSampler = ({ data }) => {
  return data.elementType == 'GROUP' || data.elementType == 'CONTROLLER' || data.elementClass == 'TestSnippets'
}
const isShowController = ({ data }) => {
  return data.elementType == 'GROUP' || data.elementType == 'CONTROLLER' || data.elementClass == 'TestSnippets'
}
/**
 * 打开新增 TestGroup 的标签页
 */
const openNewGroupTab = (node) => {
  store.commit({
    type: 'pymeter/addTab',
    editorNo: 'UNSAVED_GROUP',
    editorName: 'New Group',
    editorComponent: 'TestGroup',
    editorMode: 'CREATE',
    metadata: {
      rootNo: props.node.data.rootNo,
      parentNo: props.node.data.elementNo
    }
  })
}

/**
 * 打开新增 SetupGroup 的标签页
 */
const openNewSetupGroupTab = (node) => {
  store.commit({
    type: 'pymeter/addTab',
    editorNo: 'UNSAVED_SETUP_GROUP',
    editorName: 'New Setup Group',
    editorComponent: 'SetupGroup',
    editorMode: 'CREATE',
    metadata: {
      rootNo: props.node.data.rootNo,
      parentNo: props.node.data.elementNo
    }
  })
}

const openNewSetupGroupDebugerTab = (node) => {
  store.commit({
    type: 'pymeter/addTab',
    editorNo: 'UNSAVED_SETUP_GROUP_DEBUGER',
    editorName: 'New Setup Group Debuger',
    editorComponent: 'SetupGroupDebuger',
    editorMode: 'CREATE',
    metadata: {
      rootNo: props.node.data.rootNo,
      parentNo: props.node.data.elementNo
    }
  })
}

/**
 * 打开新增 TeatdownGroup 的标签页
 */
const openNewTeardownGroupTab = (node) => {
  store.commit({
    type: 'pymeter/addTab',
    editorNo: 'UNSAVED_TEARDOWN_GROUP',
    editorName: 'New Teardown Group',
    editorComponent: 'TeardownGroup',
    editorMode: 'CREATE',
    metadata: {
      rootNo: props.node.data.rootNo,
      parentNo: props.node.data.elementNo
    }
  })
}

const openNewTeardownGroupDebugerTab = (node) => {
  store.commit({
    type: 'pymeter/addTab',
    editorNo: 'UNSAVED_TEARDOWN_GROUP_DEBUGER',
    editorName: 'New Teardown Group Debuger',
    editorComponent: 'TeardownGroupDebuger',
    editorMode: 'CREATE',
    metadata: {
      rootNo: props.node.data.rootNo,
      parentNo: props.node.data.elementNo
    }
  })
}

/**
 * 打开新增 HttpSampler 的标签页
 */
const openNewHttpSamplerTab = (node) => {
  store.commit({
    type: 'pymeter/addTab',
    editorNo: 'UNSAVED_HTTP_SAMPLER',
    editorName: 'New HTTP',
    editorComponent: 'HTTPSampler',
    editorMode: 'CREATE',
    metadata: {
      rootNo: props.node.data.rootNo,
      parentNo: props.node.data.elementNo
    }
  })
}

/**
 * 打开新增 PythonSampler 的标签页
 */
const openNewPythonSamplerTab = (node) => {
  store.commit({
    type: 'pymeter/addTab',
    editorNo: 'UNSAVED_PYTHON_SAMPLER',
    editorName: 'New Python',
    editorComponent: 'PythonSampler',
    editorMode: 'CREATE',
    metadata: {
      rootNo: props.node.data.rootNo,
      parentNo: props.node.data.elementNo
    }
  })
}

/**
 * 打开新增 SnippetSampler 的标签页
 */
const openNewSnippetSamplerTab = (node) => {
  store.commit({
    type: 'pymeter/addTab',
    editorNo: 'UNSAVED_SNIPPET_SAMPLER',
    editorName: 'New Snippet',
    editorComponent: 'SnippetSampler',
    editorMode: 'CREATE',
    metadata: {
      workspaceNo: workspaceNo,
      rootNo: props.node.data.rootNo,
      parentNo: props.node.data.elementNo
    }
  })
}

/**
 * 打开新增 PythonPreProcessor 的标签页
 */
const openNewPythonPreProcessorTab = (node) => {
  store.commit({
    type: 'pymeter/addTab',
    editorNo: 'UNSAVED_PYTHON_PRE_PROCESSOR',
    editorName: 'New Python Pre Processor',
    editorComponent: 'PythonPreProcessor',
    editorMode: 'CREATE',
    metadata: {
      rootNo: props.node.data.rootNo,
      parentNo: props.node.data.elementNo
    }
  })
}

/**
 * 打开新增 PythonAssertion 的标签页
 */
const openNewPythonPostProcessorTab = (node) => {
  store.commit({
    type: 'pymeter/addTab',
    editorNo: 'UNSAVED_PYTHON_POST_PROCESSOR',
    editorName: 'New Python Post Processor',
    editorComponent: 'PythonPostProcessor',
    editorMode: 'CREATE',
    metadata: {
      rootNo: props.node.data.rootNo,
      parentNo: props.node.data.elementNo
    }
  })
}

/**
 * 打开新增 PythonAssertion 的标签页
 */
const openNewPythonAssertionTab = (node) => {
  store.commit({
    type: 'pymeter/addTab',
    editorNo: 'UNSAVED_PYTHON_ASSERTION',
    editorName: 'New Python Assertion',
    editorComponent: 'PythonAssertion',
    editorMode: 'CREATE',
    metadata: {
      rootNo: props.node.data.rootNo,
      parentNo: props.node.data.elementNo
    }
  })
}

/**
 * 打开新增 IfController 的标签页
 */
const openNewIfControllerTab = (node) => {
  store.commit({
    type: 'pymeter/addTab',
    editorNo: 'UNSAVED_IF_CONTROLLER',
    editorName: 'New If Controller',
    editorComponent: 'IfController',
    editorMode: 'CREATE',
    metadata: {
      rootNo: props.node.data.rootNo,
      parentNo: props.node.data.elementNo
    }
  })
}

/**
 * 打开新增 ForinController 的标签页
 */
const openNewForInControllerTab = (node) => {
  store.commit({
    type: 'pymeter/addTab',
    editorNo: 'UNSAVED_FOR_IN_CONTROLLER',
    editorName: 'New For-In Controller',
    editorComponent: 'ForInController',
    editorMode: 'CREATE',
    metadata: {
      rootNo: props.node.data.rootNo,
      parentNo: props.node.data.elementNo
    }
  })
}

/**
 * 打开新增 LoopController 的标签页
 */
const openNewLoopControllerTab = (node) => {
  store.commit({
    type: 'pymeter/addTab',
    editorNo: 'UNSAVED_LOOP_CONTROLLER',
    editorName: 'New Loop Controller',
    editorComponent: 'LoopController',
    editorMode: 'CREATE',
    metadata: {
      rootNo: props.node.data.rootNo,
      parentNo: props.node.data.elementNo
    }
  })
}

/**
 * 打开新增 RetryController 的标签页
 */
const openNewRetryControllerTab = (node) => {
  store.commit({
    type: 'pymeter/addTab',
    editorNo: 'UNSAVED_RETRY_CONTROLLER',
    editorName: 'New Retry Controller',
    editorComponent: 'RetryController',
    editorMode: 'CREATE',
    metadata: {
      rootNo: props.node.data.rootNo,
      parentNo: props.node.data.elementNo
    }
  })
}

/**
 * 打开新增 TransactionController 的标签页
 */
const openNewTransactionControllerTab = (node) => {
  store.commit({
    type: 'pymeter/addTab',
    editorNo: 'UNSAVED_TRANSACTION_CONTROLLER',
    editorName: 'New Transaction Controller',
    editorComponent: 'TransactionController',
    editorMode: 'CREATE',
    metadata: {
      rootNo: props.node.data.rootNo,
      parentNo: props.node.data.elementNo
    }
  })
}

/**
 * 打开新增 WhileController 的标签页
 */
const openNewWhileControllerTab = (node) => {
  store.commit({
    type: 'pymeter/addTab',
    editorNo: 'UNSAVED_WHILE_CONTROLLER',
    editorName: 'New While Controller',
    editorComponent: 'WhileController',
    editorMode: 'CREATE',
    metadata: {
      rootNo: props.node.data.rootNo,
      parentNo: props.node.data.elementNo
    }
  })
}

/**
 * 复制元素
 */
const duplicateElement = ({ elementNo, elementName, elementType }) => {
  // 复制 group 时需要二次确认
  if (elementType === 'GROUP') {
    ElMessageBox.confirm(null, {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      message: (
        <div>
          <p>确认复制以下分组吗？</p>
          <br />
          <p style="white-space:normal; overflow:hidden; text-overflow:ellipsis;">{elementName}</p>
        </div>
      )
    }).then(() => {
      ElementService.duplicateElement({ elementNo: elementNo }).then(() => {
        // 重新查询列表
        store.commit('pymeter/refreshElementTreeNow')
        // 成功提示
        ElMessage({ message: '复制成功', type: 'info', duration: 2 * 1000 })
      })
    })
    // 非 group 元素直接复制
  } else {
    ElementService.duplicateElement({ elementNo: elementNo }).then(() => {
      // 重新查询列表
      store.commit('pymeter/refreshElementTreeNow')
      // 成功提示
      ElMessage({ message: '复制成功', type: 'info', duration: 2 * 1000 })
    })
  }
}

/**
 * 复制元素至指定空间
 */
const copyElementToWorkspace = async ({ elementNo }) => {
  let workspaceNo = null
  // 弹出选择空间的对话框
  const error = await ElMessageBox.confirm(null, {
    title: '请选择工作空间',
    message: (
      <WorkspaceTree
        key={elementNo}
        data={this.workspaceList}
        onNodeClick={(data) => (workspaceNo = data.workspaceNo)}
      />
    ),
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(() => false)
    .catch(() => true)
  if (error) return
  // 复制元素到指定的空间
  await ElementService.copyElementToWorkspace({ elementNo: elementNo, workspaceNo: workspaceNo })
  // 成功提示
  ElMessage({ message: '复制成功', type: 'info', duration: 1 * 1000 })
}

/**
 * 移动元素至指定空间
 */
const moveElementToWorkspace = async ({ elementNo }) => {
  let workspaceNo = null
  // 弹出选择空间的对话框
  const error = await ElMessageBox.confirm(null, {
    title: '请选择工作空间',
    message: (
      <WorkspaceTree
        key={elementNo}
        data={this.workspaceList}
        onNodeClick={(data) => (workspaceNo = data.workspaceNo)}
      />
    ),
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(() => false)
    .catch(() => true)
  if (error) return
  // 移动元素到指定空间
  await ElementService.moveElementToWorkspace({ elementNo: elementNo, workspaceNo: workspaceNo })
  // 重新查询列表
  store.commit('pymeter/refreshElementTreeNow')
  // 成功提示
  ElMessage({ message: '移动成功', type: 'info', duration: 1 * 1000 })
}

/**
 * 启用元素
 */
const enableElement = ({ elementNo }) => {
  if (!elementNo) return
  // 启用元素
  ElementService.enableElement({ elementNo: elementNo }).then(() => {
    // 重新查询列表
    store.commit('pymeter/refreshElementTreeNow')
  })
}

/**
 * 禁用元素
 */
const disableElement = ({ elementNo }) => {
  if (!elementNo) return
  // 禁用元素
  ElementService.disableElement({ elementNo: elementNo }).then(() => {
    // 重新查询列表
    store.commit('pymeter/refreshElementTreeNow')
  })
}

/**
 * 删除元素
 */
const removeElement = async ({ elementNo, elementName }) => {
  // 二次确认
  const error = await ElMessageBox.confirm(null, {
    title: '警告',
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    message: (
      <div>
        <p>确认删除以下元素吗？</p>
        <br />
        <p style="white-space:normal; overflow:hidden; text-overflow:ellipsis;">{elementName}</p>
      </div>
    )
  })
    .then(() => false)
    .catch(() => true)
  if (error) return
  // 删除元素
  await ElementService.removeElement({ elementNo: elementNo })
  // 关闭tab
  store.commit({ type: 'pymeter/removeTab', editorNo: elementNo })
  // 重新查询列表
  store.commit('pymeter/refreshElementTreeNow')
}
</script>

<style lang="scss" scoped>
.el-dropdown {
  :deep(.el-button) {
    -webkit-appearance: button;
    padding: 5px;
  }
}
</style>
