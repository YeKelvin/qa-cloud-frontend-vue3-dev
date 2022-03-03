<template>
  <el-tree
    ref="tree"
    node-key="elementNo"
    empty-text="请开始编辑脚本"
    highlight-current
    draggable
    :indent="36"
    :expand-on-click-node="false"
    :data="elementList"
    :props="{ label: 'elementName', children: 'children' }"
    :default-expanded-keys="expandedList"
    :allow-drag="allowDrag"
    :allow-drop="allowDrop"
    @node-click="handleNodeClick"
    @node-expand="handleNodeExpand"
    @node-collapse="handleNodeCollapse"
    @node-drop="handleNodeDrop"
    @keyup.ctrl.x="handleCtrlKeyX"
    @keyup.ctrl.c="handleCtrlKeyC"
    @keyup.ctrl.v="handleCtrlKeyV"
    @keyup.meta.x="handleMetaKeyX"
    @keyup.meta.c="handleMetaKeyC"
    @keyup.meta.v="handleMetaKeyV"
  >
    <template #default="{ node, data }">
      <span class="tree-item" @mouseenter="mouseenter(node)" @mouseleave="mouseleave()">
        <!-- 元素名称 -->
        <ElementTreeItemName :data="data" @dblclick="handleNodeDoubleClick(node)" />

        <!-- 元素操作菜单 -->
        <span v-show="hoveredNode === node" @click.stop>
          <el-dropdown
            trigger="click"
            placement="bottom"
            :show-timeout="50"
            :hide-timeout="50"
            @visible-change="visibleChange"
          >
            <!-- 菜单弹出按钮 -->
            <el-button type="text" icon="el-icon-more" />
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
                <template
                  v-if="
                    data.elementType == 'GROUP' ||
                    data.elementType == 'CONTROLLER' ||
                    data.elementClass == 'TestSnippets'
                  "
                >
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
                  <el-dropdown-item divided @click="openNewPythonPostProcessorTab(node)">
                    新增Python后置脚本
                  </el-dropdown-item>
                </template>

                <!-- Assertion -->
                <template v-if="data.elementType == 'SAMPLER'">
                  <el-dropdown-item divided @click="openNewPythonAssertionTab(node)">新增Python断言</el-dropdown-item>
                </template>

                <!-- Controller -->
                <template
                  v-if="
                    data.elementType == 'GROUP' ||
                    data.elementType == 'CONTROLLER' ||
                    data.elementClass == 'TestSnippets'
                  "
                >
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
        </span>
      </span>
    </template>
  </el-tree>
</template>

<script lang="jsx" setup>
import { mapState } from 'vuex'
import * as ElementService from '@/api/script/element'
import useTree from '@/composables/useTree'
// import useWorkspaceState from '@/composables/useWorkspaceState'
// import usePyMeterState from '@/pymeter/composables/usePyMeterState'
import ElementTreeItemName from './ElementTreeItemName.vue'
import WorkspaceList from '@/pymeter/components/editor-aside/common/WorkspaceListDialog.vue'

// const {
//   hoveredNode,
//   menuOpened,
//   expandedList,
//   mouseenter,
//   mouseleave,
//   visibleChange,
//   getRootNode,
//   handleNodeDoubleClick,
//   handleNodeExpand,
//   handleNodeCollapse,
//   expandAll,
//   expandNode
// } = useTree()
// const { workspaceNo, workspaceList } = useWorkspaceState()
// const { refreshElementTree } = usePyMeterState()
</script>

<script lang="jsx">
export default {
  name: 'ElementTree',
  props: {
    collectionNumberList: { type: Array, default: () => [] }
  },

  data() {
    return {
      elementList: [],
      pendingPaste: null
    }
  },

  computed: {
    ...mapState('workspace', {
      workspaceNo: (state) => state.workspaceNo,
      workspaceList: (state) => state.workspaceList
    }),
    ...mapState('pymeter', {
      refreshElementTree: (state) => state.refreshElementTree
    }),
    isMacOS() {
      return /macintosh|mac os x/i.test(navigator.userAgent)
    },
    isWindows() {
      return /windows|win32/i.test(navigator.userAgent)
    }
  },

  watch: {
    collectionNumberList(val) {
      if (!val) return
      this.queryElementsTree()
    },
    refreshElementTree(val) {
      this.queryElementsTree()
    }
  },

  mounted() {
    if (this.collectionNumberList.length > 0) this.queryElementsTree()
  },

  methods: {
    /**
     * 打开新增 TestGroup 的标签页
     */
    openNewGroupTab(node) {
      this.$store.commit({
        type: 'pymeter/addTab',
        editorNo: 'UNSAVED_GROUP',
        editorName: 'New Group',
        editorComponent: 'TestGroup',
        editorMode: 'CREATE',
        metadata: {
          rootNo: node.data.rootNo,
          parentNo: node.data.elementNo
        }
      })
    },

    /**
     * 打开新增 SetupGroup 的标签页
     */
    openNewSetupGroupTab(node) {
      this.$store.commit({
        type: 'pymeter/addTab',
        editorNo: 'UNSAVED_SETUP_GROUP',
        editorName: 'New Setup Group',
        editorComponent: 'SetupGroup',
        editorMode: 'CREATE',
        metadata: {
          rootNo: node.data.rootNo,
          parentNo: node.data.elementNo
        }
      })
    },

    openNewSetupGroupDebugerTab(node) {
      this.$store.commit({
        type: 'pymeter/addTab',
        editorNo: 'UNSAVED_SETUP_GROUP_DEBUGER',
        editorName: 'New Setup Group Debuger',
        editorComponent: 'SetupGroupDebuger',
        editorMode: 'CREATE',
        metadata: {
          rootNo: node.data.rootNo,
          parentNo: node.data.elementNo
        }
      })
    },

    /**
     * 打开新增 TeatdownGroup 的标签页
     */
    openNewTeardownGroupTab(node) {
      this.$store.commit({
        type: 'pymeter/addTab',
        editorNo: 'UNSAVED_TEARDOWN_GROUP',
        editorName: 'New Teardown Group',
        editorComponent: 'TeardownGroup',
        editorMode: 'CREATE',
        metadata: {
          rootNo: node.data.rootNo,
          parentNo: node.data.elementNo
        }
      })
    },

    openNewTeardownGroupDebugerTab(node) {
      this.$store.commit({
        type: 'pymeter/addTab',
        editorNo: 'UNSAVED_TEARDOWN_GROUP_DEBUGER',
        editorName: 'New Teardown Group Debuger',
        editorComponent: 'TeardownGroupDebuger',
        editorMode: 'CREATE',
        metadata: {
          rootNo: node.data.rootNo,
          parentNo: node.data.elementNo
        }
      })
    },

    /**
     * 打开新增 HttpSampler 的标签页
     */
    openNewHttpSamplerTab(node) {
      this.$store.commit({
        type: 'pymeter/addTab',
        editorNo: 'UNSAVED_HTTP_SAMPLER',
        editorName: 'New HTTP',
        editorComponent: 'HTTPSampler',
        editorMode: 'CREATE',
        metadata: {
          rootNo: node.data.rootNo,
          parentNo: node.data.elementNo
        }
      })
    },

    /**
     * 打开新增 PythonSampler 的标签页
     */
    openNewPythonSamplerTab(node) {
      this.$store.commit({
        type: 'pymeter/addTab',
        editorNo: 'UNSAVED_PYTHON_SAMPLER',
        editorName: 'New Python',
        editorComponent: 'PythonSampler',
        editorMode: 'CREATE',
        metadata: {
          rootNo: node.data.rootNo,
          parentNo: node.data.elementNo
        }
      })
    },

    /**
     * 打开新增 SnippetSampler 的标签页
     */
    openNewSnippetSamplerTab(node) {
      this.$store.commit({
        type: 'pymeter/addTab',
        editorNo: 'UNSAVED_SNIPPET_SAMPLER',
        editorName: 'New Snippet',
        editorComponent: 'SnippetSampler',
        editorMode: 'CREATE',
        metadata: {
          workspaceNo: this.workspaceNo,
          rootNo: node.data.rootNo,
          parentNo: node.data.elementNo
        }
      })
    },

    /**
     * 打开新增 PythonPreProcessor 的标签页
     */
    openNewPythonPreProcessorTab(node) {
      this.$store.commit({
        type: 'pymeter/addTab',
        editorNo: 'UNSAVED_PYTHON_PRE_PROCESSOR',
        editorName: 'New Python Pre Processor',
        editorComponent: 'PythonPreProcessor',
        editorMode: 'CREATE',
        metadata: {
          rootNo: node.data.rootNo,
          parentNo: node.data.elementNo
        }
      })
    },

    /**
     * 打开新增 PythonAssertion 的标签页
     */
    openNewPythonPostProcessorTab(node) {
      this.$store.commit({
        type: 'pymeter/addTab',
        editorNo: 'UNSAVED_PYTHON_POST_PROCESSOR',
        editorName: 'New Python Post Processor',
        editorComponent: 'PythonPostProcessor',
        editorMode: 'CREATE',
        metadata: {
          rootNo: node.data.rootNo,
          parentNo: node.data.elementNo
        }
      })
    },

    /**
     * 打开新增 PythonAssertion 的标签页
     */
    openNewPythonAssertionTab(node) {
      this.$store.commit({
        type: 'pymeter/addTab',
        editorNo: 'UNSAVED_PYTHON_ASSERTION',
        editorName: 'New Python Assertion',
        editorComponent: 'PythonAssertion',
        editorMode: 'CREATE',
        metadata: {
          rootNo: node.data.rootNo,
          parentNo: node.data.elementNo
        }
      })
    },

    /**
     * 打开新增 IfController 的标签页
     */
    openNewIfControllerTab(node) {
      this.$store.commit({
        type: 'pymeter/addTab',
        editorNo: 'UNSAVED_IF_CONTROLLER',
        editorName: 'New If Controller',
        editorComponent: 'IfController',
        editorMode: 'CREATE',
        metadata: {
          rootNo: node.data.rootNo,
          parentNo: node.data.elementNo
        }
      })
    },

    /**
     * 打开新增 ForinController 的标签页
     */
    openNewForInControllerTab(node) {
      this.$store.commit({
        type: 'pymeter/addTab',
        editorNo: 'UNSAVED_FOR_IN_CONTROLLER',
        editorName: 'New For-In Controller',
        editorComponent: 'ForInController',
        editorMode: 'CREATE',
        metadata: {
          rootNo: node.data.rootNo,
          parentNo: node.data.elementNo
        }
      })
    },

    /**
     * 打开新增 LoopController 的标签页
     */
    openNewLoopControllerTab(node) {
      this.$store.commit({
        type: 'pymeter/addTab',
        editorNo: 'UNSAVED_LOOP_CONTROLLER',
        editorName: 'New Loop Controller',
        editorComponent: 'LoopController',
        editorMode: 'CREATE',
        metadata: {
          rootNo: node.data.rootNo,
          parentNo: node.data.elementNo
        }
      })
    },

    /**
     * 打开新增 RetryController 的标签页
     */
    openNewRetryControllerTab(node) {
      this.$store.commit({
        type: 'pymeter/addTab',
        editorNo: 'UNSAVED_RETRY_CONTROLLER',
        editorName: 'New Retry Controller',
        editorComponent: 'RetryController',
        editorMode: 'CREATE',
        metadata: {
          rootNo: node.data.rootNo,
          parentNo: node.data.elementNo
        }
      })
    },

    /**
     * 打开新增 TransactionController 的标签页
     */
    openNewTransactionControllerTab(node) {
      this.$store.commit({
        type: 'pymeter/addTab',
        editorNo: 'UNSAVED_TRANSACTION_CONTROLLER',
        editorName: 'New Transaction Controller',
        editorComponent: 'TransactionController',
        editorMode: 'CREATE',
        metadata: {
          rootNo: node.data.rootNo,
          parentNo: node.data.elementNo
        }
      })
    },

    /**
     * 打开新增 WhileController 的标签页
     */
    openNewWhileControllerTab(node) {
      this.$store.commit({
        type: 'pymeter/addTab',
        editorNo: 'UNSAVED_WHILE_CONTROLLER',
        editorName: 'New While Controller',
        editorComponent: 'WhileController',
        editorMode: 'CREATE',
        metadata: {
          rootNo: node.data.rootNo,
          parentNo: node.data.elementNo
        }
      })
    },

    /**
     * el-tree点击节点的回调
     */
    handleNodeClick(data) {
      this.$store.commit({
        type: 'pymeter/addTab',
        editorNo: data.elementNo,
        editorName: data.elementName,
        editorComponent: data.elementClass,
        editorMode: 'QUERY'
      })
    },

    /**
     * 查询脚本内容
     */
    queryElementsTree() {
      if (this.collectionNumberList.length === 0) {
        this.elementList = []
        return
      }
      ElementService.queryElementsChildren({ elementNumberList: this.collectionNumberList }).then((response) => {
        this.elementList = response.result
        // 自动展开顶级节点
        this.elementList.forEach((item) => {
          this.expandedList.push(item.elementNo)
        })
      })
    },

    /**
     * 复制元素
     */
    duplicateElement({ elementNo, elementName, elementType }) {
      // 复制 group 时需要二次确认
      if (elementType === 'GROUP') {
        this.$confirm(null, {
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
            this.queryElementsTree()
            // 成功提示
            this.$message({ message: '复制成功', type: 'info', duration: 1 * 1000 })
          })
        })
        // 非 group 元素直接复制
      } else {
        ElementService.duplicateElement({ elementNo: elementNo }).then(() => {
          // 重新查询列表
          this.queryElementsTree()
          // 成功提示
          this.$message({ message: '复制成功', type: 'info', duration: 1 * 1000 })
        })
      }
    },

    /**
     * 复制元素至指定空间
     */
    copyElementToWorkspace({ elementNo }) {
      let workspaceNo = null
      this.$confirm(null, {
        title: '请选择工作空间',
        message: (
          <workspace-list
            key={elementNo}
            data={this.workspaceList}
            on-node-click={(data) => {
              workspaceNo = data.workspaceNo
            }}
          ></workspace-list>
        ),
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        ElementService.copyElementToWorkspace({ elementNo: elementNo, workspaceNo: workspaceNo }).then(() => {
          this.$message({ message: '复制成功', type: 'info', duration: 1 * 1000 })
        })
      })
    },

    /**
     * 移动元素至指定空间
     */
    moveElementToWorkspace({ elementNo }) {
      let workspaceNo = null
      this.$confirm(null, {
        title: '请选择工作空间',
        message: (
          <workspace-list
            key={elementNo}
            data={this.workspaceList}
            on-node-click={(data) => {
              workspaceNo = data.workspaceNo
            }}
          ></workspace-list>
        ),
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        ElementService.moveElementToWorkspace({ elementNo: elementNo, workspaceNo: workspaceNo }).then(() => {
          // 重新查询列表
          this.queryElementsTree()
          // 成功提示
          this.$message({ message: '移动成功', type: 'info', duration: 1 * 1000 })
        })
      })
    },

    /**
     * 启用元素
     */
    enableElement({ elementNo }) {
      if (!elementNo) return
      ElementService.enableElement({ elementNo: elementNo }).then(() => {
        // 重新查询列表
        this.queryElementsTree()
      })
    },

    /**
     * 禁用元素
     */
    disableElement({ elementNo }) {
      if (!elementNo) return
      ElementService.disableElement({ elementNo: elementNo }).then(() => {
        // 重新查询列表
        this.queryElementsTree()
      })
    },

    /**
     * 删除元素
     */
    removeElement({ elementNo, elementName }) {
      this.$confirm(null, {
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
      }).then(() => {
        ElementService.removeElement({ elementNo: elementNo }).then(() => {
          this.$store.commit({ type: 'pymeter/removeTab', editorNo: elementNo })
          this.queryElementsTree()
        })
      })
    },

    /**
     * 拖拽成功完成时触发的事件
     */
    handleNodeDrop(draggingNode, dropNode, dropType) {
      let targetParentNo = 0
      let targetSortNo = 0

      // 跨脚本拖曳
      const over = draggingNode.data.rootNo !== dropNode.data.rootNo
      // 移动的方向
      let moveDirection = draggingNode.data.sortNo > dropNode.data.sortNo ? 'UP' : 'DOWN'
      if (over) {
        moveDirection = 'UP'
      }

      switch (dropType) {
        case 'inner':
          targetParentNo = dropNode.data.elementNo
          targetSortNo = dropNode.childNodes.length
          break
        case 'before':
          targetParentNo = dropNode.parent.data.elementNo
          targetSortNo = moveDirection === 'UP' ? dropNode.data.sortNo : dropNode.data.sortNo - 1
          break
        case 'after':
          targetParentNo = dropNode.parent.data.elementNo
          targetSortNo = moveDirection === 'UP' ? dropNode.data.sortNo + 1 : dropNode.data.sortNo
          break
        default:
          return
      }

      ElementService.moveElement({
        sourceNo: draggingNode.data.elementNo,
        targetRootNo: dropNode.data.rootNo,
        targetParentNo: targetParentNo,
        targetSortNo: targetSortNo
      }).then(() => {
        this.queryElementsTree()
      })
    },

    /**
     * 判断节点能否被拖拽
     */
    allowDrag(draggingNode) {
      // Collection 不允许拖拽
      if (draggingNode.data.elementType === 'COLLECTION') return false
      return true
    },

    /**
     * 拖拽时判定目标节点能否被放置
     */
    allowDrop(draggingNode, dropNode, type) {
      // Element 只允许在 Collection 里插入，不允许在 Collection 前后放置
      if (dropNode.data.elementType === 'COLLECTION' && (type === 'prev' || type === 'next')) return false

      // 拖拽 Group
      if (draggingNode.data.elementType === 'GROUP') {
        // Group 只允许同级排序 或 在 Collection 里插入
        if (!['COLLECTION', 'GROUP'].includes(dropNode.data.elementType)) return false
        // Group 只允许在 Group 前后放置，不允许在 Group 里插入
        if (dropNode.data.elementType === 'GROUP' && type === 'inner') return false
      }

      // 拖拽 Controller
      if (draggingNode.data.elementType === 'CONTROLLER') {
        // Controller 只允许在 Group 里插入，不允许在 Group 前后放置
        if (dropNode.data.elementType === 'GROUP' && (type === 'prev' || type === 'next')) return false
        // Controller 只允许在以下元素类型的前后放置，不允许在向里插入
        if (
          ['SAMPLER', 'CONFIG', 'TIMER', 'PRE_PROCESSOR', 'POST_PROCESSOR', 'ASSERTION', 'LISTENER'].includes(
            dropNode.data.elementType
          ) &&
          type === 'inner'
        )
          return false
        // Controller 只允许在类型为 GROUP 或 CONTROLLER 的父级下前后放置
        if (!['GROUP', 'CONTROLLER'].includes(dropNode.parent.data.elementType) && (type === 'prev' || type === 'next'))
          return false
      }

      // TestCollection
      const dropRootNode = this.getRootNode(dropNode)
      if (dropRootNode && dropRootNode.data.elementClass === 'TestCollection') {
        // 拖拽 Sampler
        if (draggingNode.data.elementType === 'SAMPLER') {
          // Sampler 只允许在 Group 里插入，不允许在 Group 前后放置
          if (dropNode.data.elementType === 'GROUP' && (type === 'prev' || type === 'next')) return false
          // Sampler 只允许在以下元素类型的前后放置，不允许在向里插入
          if (
            ['SAMPLER', 'CONFIG', 'TIMER', 'PRE_PROCESSOR', 'POST_PROCESSOR', 'ASSERTION', 'LISTENER'].includes(
              dropNode.data.elementType
            ) &&
            type === 'inner'
          )
            return false
          // 前后放置时，Sampler 不允许移动到类型为 Sampler 的父级
          if (dropNode.parent.data.elementType === 'SAMPLER' && (type === 'prev' || type === 'next')) return false
        }
      }

      // 除以上规则不允许拖动排序，其余均允许
      return true
    },

    /**
     * windows剪切元素快捷键
     */
    handleCtrlKeyX() {
      if (!this.isWindows) return
      const data = this.$refs.tree.getCurrentNode()
      if (data.elementType === 'COLLECTION') return
      this.pendingPaste = { ...data, pasteType: 'CUT' }
      this.$message({ message: '已剪切', type: 'info', duration: 1 * 1000 })
    },

    /**
     * windows复制元素快捷键
     */
    handleCtrlKeyC() {
      if (!this.isWindows) return
      const data = this.$refs.tree.getCurrentNode()
      if (data.elementType === 'COLLECTION') return
      this.pendingPaste = { ...data, pasteType: 'COPY' }
      this.$message({ message: '已复制', type: 'info', duration: 1 * 1000 })
    },

    /**
     * windows粘贴元素快捷键
     */
    handleCtrlKeyV() {
      if (!this.isWindows) return
      const target = this.$refs.tree.getCurrentNode()
      target &&
        ElementService.pasteElement({
          sourceNo: this.pendingPaste.elementNo,
          targetNo: target.elementNo,
          pasteType: this.pendingPaste.pasteType
        }).then(() => {
          // 清空剪贴板
          if (this.pendingPaste.pasteType === 'CUT') this.pendingPaste = null
          // 重新查询列表
          this.queryElementsTree()
          // 成功提示
          this.$message({ message: '剪贴成功', type: 'info', duration: 1 * 1000 })
        })
    },

    /**
     * macos复制元素快捷键
     */
    handleMetaKeyX() {
      if (!this.isMacOS) return
      const data = this.$refs.tree.getCurrentNode()
      if (data.elementType === 'COLLECTION') return
      this.pendingPaste = { ...data, pasteType: 'CUT' }
      this.$message({ message: '已剪切', type: 'info', duration: 1 * 1000 })
    },

    /**
     * macos复制元素快捷键
     */
    handleMetaKeyC() {
      if (!this.isMacOS) return
      const data = this.$refs.tree.getCurrentNode()
      if (data.elementType === 'COLLECTION') return
      this.pendingPaste = { ...data, pasteType: 'COPY' }
      this.$message({ message: '已复制', type: 'info', duration: 1 * 1000 })
    },

    /**
     * macos粘贴元素快捷键
     */
    handleMetaKeyV() {
      if (!this.isMacOS) return
      const target = this.$refs.tree.getCurrentNode()
      target &&
        ElementService.pasteElement({
          sourceNo: this.pendingPaste.elementNo,
          targetNo: target.elementNo,
          pasteType: this.pendingPaste.pasteType
        }).then(() => {
          // 清空剪贴板
          if (this.pendingPaste.pasteType === 'CUT') this.pendingPaste = null
          // 成功提示
          this.$message({ message: '剪贴成功', type: 'info', duration: 1 * 1000 })
          // 重新查询列表
          this.queryElementsTree()
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.tree-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  padding-right: 8px;
}

.el-dropdown {
  :deep(.el-button) {
    -webkit-appearance: button;
    padding: 5px;
  }
}

:deep(.el-tree-node__content) {
  height: 100%;
  min-height: 26px;
}
</style>
