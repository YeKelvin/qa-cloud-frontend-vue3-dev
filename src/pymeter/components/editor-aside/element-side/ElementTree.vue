<template>
  <el-tree
    ref="eltreeRef"
    node-key="elementNo"
    highlight-current
    draggable
    style="padding-bottom: 100px"
    :indent="36"
    :data="elementList"
    :expand-on-click-node="false"
    :default-expanded-keys="expandedList"
    :props="{ label: 'elementName', children: 'children' }"
    :allow-drag="allowDrag"
    :allow-drop="allowDrop"
    @node-click="handleNodeClick"
    @node-expand="handleNodeExpand"
    @node-collapse="handleNodeCollapse"
    @node-drop="handleNodeDrop"
  >
    <template #default="{ node, data }">
      <!-- 树结点 -->
      <span class="tree-item" @mouseenter="mouseenter(node)" @mouseleave="mouseleave()">
        <!-- 元素名称 -->
        <ElementTreeItemName :data="data" @dblclick="handleNodeDBClick(node)" />
        <!-- 元素操作菜单 -->
        <span v-show="hoveredNode === node" @click.stop>
          <ElementTreeItemMenu :node="node" @visible-change="visibleChange" />
        </span>
      </span>
    </template>
  </el-tree>
</template>

<script setup>
import { isEmpty } from 'lodash-es'
import { ElMessage } from 'element-plus'
import * as ElementService from '@/api/script/element'
import useElTree from '@/composables/useElTree'
import usePyMeterState from '@/pymeter/composables/usePyMeterState'
import ElementTreeItemName from './ElementTreeItemName.vue'
import ElementTreeItemMenu from './ElementTreeItemMenu.vue'

let clickTimer = null
const props = defineProps({
  collectionNumberList: { type: Array, default: () => [] }
})
const store = useStore()
const elementList = ref([])
const pendingPaste = ref(null)
const isMacOS = computed(() => /macintosh|mac os x/i.test(navigator.userAgent))
const isWindows = computed(() => /windows|win32|win64/i.test(navigator.userAgent))
const {
  eltreeRef,
  hoveredNode,
  expandedList,
  mouseenter,
  mouseleave,
  visibleChange,
  getRootNode,
  handleNodeDoubleClick,
  handleNodeExpand,
  handleNodeCollapse,
  expandAll,
  expandNode
} = useElTree()
const { refreshElementTree } = usePyMeterState()

watch(refreshElementTree, () => queryElementsTree())
watch(
  () => props.collectionNumberList,
  (val) => {
    if (!val) return
    queryElementsTree()
  },
  { deep: true }
)

onMounted(() => {
  if (!isEmpty(props.collectionNumberList)) queryElementsTree()
  // 根据操作系统动态绑定快捷键
  eltreeRef.value.$el.addEventListener('keydown', cutByHotkey, false)
  eltreeRef.value.$el.addEventListener('keydown', copyByHotkey, false)
  eltreeRef.value.$el.addEventListener('keydown', pasteByHotkey, false)
})

onBeforeUnmount(() => {
  // 移除快捷键
  eltreeRef.value.$el.removeEventListener('keydown', cutByHotkey, false)
  eltreeRef.value.$el.removeEventListener('keydown', copyByHotkey, false)
  eltreeRef.value.$el.removeEventListener('keydown', pasteByHotkey, false)
})

/**
 * 查询脚本列表
 */
const queryElementsTree = () => {
  if (isEmpty(props.collectionNumberList)) {
    elementList.value = []
    return
  }
  ElementService.queryElementsChildren({ elementNumberedList: props.collectionNumberList }).then((response) => {
    elementList.value = response.result
    // 自动展开顶级节点
    elementList.value.forEach((item) => {
      expandedList.value.push(item.elementNo)
    })
  })
}

/**
 * el-tree handler
 */
const handleNodeClick = (data) => {
  clearTimeout(clickTimer) //清除计时器
  clickTimer = setTimeout(() => {
    store.commit({
      type: 'pymeter/addTab',
      editorNo: data.elementNo,
      editorName: data.elementName,
      editorComponent: data.elementClass,
      editorMode: 'QUERY',
      metadata: {
        rootNo: data.rootNo,
        parentNo: data.elementNo
      }
    })
  }, 200)
}

/**
 * el-tree handler
 */
const handleNodeDBClick = (node) => {
  clearTimeout(clickTimer) //清除计时器
  handleNodeDoubleClick(node) // TODO: 名字不好，改命
}

/**
 * 拖拽成功完成时触发的事件
 */
const handleNodeDrop = (draggingNode, dropNode, dropType) => {
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
    queryElementsTree()
  })
}

/**
 * 判断节点能否被拖拽
 * @param {*} draggingNode 拖曳的节点
 */
const allowDrag = (draggingNode) => {
  // Collection 不允许拖拽
  if (draggingNode.data.elementType === 'COLLECTION') return false
  return true
}

/**
 * 拖拽时判定目标节点能否被放置
 * @param {*} draggingNode 拖曳的节点
 * @param {*} dropNode 目标节点
 * @param {*} type 放置类型
 */
const allowDrop = (draggingNode, dropNode, type) => {
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
    // Controller 不允许在 TestCollection 前后放置和插入
    if (dropNode.data.elementClass === 'TestCollection') return false
    // Controller 只允许在 Group 里插入，不允许在 Group 前后放置
    if (dropNode.data.elementType === 'GROUP' && (type === 'prev' || type === 'next')) return false
    // Controller 只允许在以下元素类型的前后放置，不允许在元素里插入
    if (
      ['SAMPLER', 'CONFIG', 'TIMER', 'PRE_PROCESSOR', 'POST_PROCESSOR', 'ASSERTION', 'LISTENER'].includes(
        dropNode.data.elementType
      ) &&
      type === 'inner'
    )
      return false
    // Controller 只允许在父级类型为 GROUP 或 CONTROLLER 前后放置
    if (['GROUP', 'CONTROLLER'].includes(dropNode.parent.data.elementType) && type === 'inner') return false
  }

  // TestCollection
  const dropRootNode = getRootNode(dropNode)
  if (dropRootNode && dropRootNode.data.elementClass === 'TestCollection') {
    // 拖拽 Sampler
    if (draggingNode.data.elementType === 'SAMPLER') {
      // Sampler 不允许在 TestCollection 前后放置和插入
      if (dropNode.data.elementClass === 'TestCollection') return false
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
      // Sampler 前后放置时，不允许移动到父级类型为 Sampler 的前后
      if (dropNode.parent.data.elementType === 'SAMPLER' && (type === 'prev' || type === 'next')) return false
    }
  }

  // 除以上规则不允许拖动排序，其余均允许
  return true
}

/**
 * 通过快捷键剪切元素至剪贴板
 */
const cutByHotkey = (e) => {
  if (e.repeat) {
    return
  }
  if (e.key == 'x' && isMacOS ? e.metaKey : e.ctrlKey) {
    e.preventDefault() // 阻止浏览器默认快捷键
    const data = eltreeRef.value.getCurrentNode()
    if (data.elementType === 'COLLECTION') return
    pendingPaste.value = { ...data, pasteType: 'CUT' }
    ElMessage({ message: '已剪切到剪贴板', type: 'info', duration: 1 * 1000 })
  }
}

/**
 * 通过快捷键复制元素至剪贴板
 */
const copyByHotkey = (e) => {
  if (e.repeat) {
    return
  }
  if (e.key == 'c' && isMacOS ? e.metaKey : e.ctrlKey) {
    e.preventDefault() // 阻止浏览器默认快捷键
    const data = eltreeRef.value.getCurrentNode()
    if (data.elementType === 'COLLECTION') return
    pendingPaste.value = { ...data, pasteType: 'COPY' }
    ElMessage({ message: '已复制到剪贴板', type: 'info', duration: 1 * 1000 })
  }
}

/**
 * 通过快捷键粘贴元素
 */
const pasteByHotkey = (e) => {
  if (e.repeat) {
    return
  }
  if (e.key == 'v' && isMacOS ? e.metaKey : e.ctrlKey) {
    e.preventDefault() // 阻止浏览器默认快捷键
    const target = eltreeRef.value.getCurrentNode()
    target &&
      ElementService.pasteElement({
        sourceNo: pendingPaste.value.elementNo,
        targetNo: target.elementNo,
        pasteType: pendingPaste.value.pasteType
      }).then(() => {
        // 清空剪贴板
        if (pendingPaste.value.pasteType === 'CUT') pendingPaste.value = null
        // 重新查询列表
        queryElementsTree()
        // 成功提示
        ElMessage({ message: '剪贴成功', type: 'info', duration: 2 * 1000 })
      })
  }
}

defineExpose({
  expandAll,
  expandNode,
  queryElementsTree
})
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
