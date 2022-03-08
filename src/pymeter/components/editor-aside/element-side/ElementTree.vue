<template>
  <el-tree
    ref="eltreeVNode"
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
      <!-- 树结点 -->
      <span class="tree-item" @mouseenter="mouseenter(node)" @mouseleave="mouseleave()">
        <!-- 元素名称 -->
        <ElementTreeItemName :data="data" @dblclick="handleNodeDoubleClick(node)" />
        <!-- 元素操作菜单 -->
        <span v-show="hoveredNode === node" @click.stop>
          <ElementTreeItemMenu :node="node" @visible-change="visibleChange" />
        </span>
      </span>
    </template>
  </el-tree>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { isEmpty } from 'lodash-es'
import * as ElementService from '@/api/script/element'
import useElTree from '@/composables/useElTree'
import usePyMeterState from '@/pymeter/composables/usePyMeterState'
import ElementTreeItemName from './ElementTreeItemName.vue'
import ElementTreeItemMenu from './ElementTreeItemMenu.vue'

const props = defineProps({
  collectionNumberList: { type: Array, default: () => [] }
})
watch(props.collectionNumberList, (val) => {
  if (!val) return
  queryElementsTree()
})

const elementList = ref([])
const pendingPaste = ref(null)

const {
  eltreeVNode,
  hoveredNode,
  expandedList,
  mouseenter,
  mouseleave,
  visibleChange,
  handleNodeDoubleClick,
  handleNodeExpand,
  handleNodeCollapse,
  expandAll,
  expandNode
} = useElTree()

// 刷新脚本列表
const { refreshElementTree } = usePyMeterState()
watch(refreshElementTree, () => queryElementsTree())

/**
 * 查询脚本列表
 */
const queryElementsTree = () => {
  if (isEmpty(props.collectionNumberList)) {
    elementList.value = []
    return
  }
  ElementService.queryElementsChildren({ elementNumberList: props.collectionNumberList }).then((response) => {
    elementList.value = response.result
    // 自动展开顶级节点
    elementList.value.forEach((item) => {
      expandedList.value.push(item.elementNo)
    })
  })
}

onMounted(() => {
  if (!isEmpty(props.collectionNumberList)) queryElementsTree()
})

defineExpose({
  expandAll,
  expandNode
})
</script>

<script>
export default {
  name: 'ElementTree',

  computed: {
    isMacOS() {
      return /macintosh|mac os x/i.test(navigator.userAgent)
    },
    isWindows() {
      return /windows|win32/i.test(navigator.userAgent)
    }
  },

  methods: {
    /**
     * el-tree handler
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

:deep(.el-tree-node__content) {
  height: 100%;
  min-height: 26px;
}
</style>
