import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export default function useElTree() {
  const hoveredNode = ref(null)
  const menuOpened = ref(false)
  const expandedList = ref([])

  const eltreeRef = ref()

  /**
   * el-tree-node 鼠标移入事件
   */
  const mouseenter = (node) => {
    if (menuOpened.value) return
    hoveredNode.value = node
  }

  /**
   * el-tree-node 鼠标移出事件
   */
  const mouseleave = () => {
    if (menuOpened.value) return
    hoveredNode.value = null
  }

  /**
   * 隐藏和显示菜单
   */
  const visibleChange = (val) => {
    if (val) {
      menuOpened.value = true
    } else {
      hoveredNode.value = null
      menuOpened.value = false
    }
  }

  /**
   * el-tree 获取根节点
   */
  const getRootNode = (node) => {
    if (node.level === 1) {
      return node
    }
    if (node.parent) {
      return getRootNode(node.parent)
    }
    ElMessage({ message: '根节点获取失败', type: 'error', duration: 2 * 1000 })
    return null
  }

  /**
   * el-tree双击节点的回调
   */
  const handleNodeDoubleClick = (node) => {
    node.expanded = !node.expanded
    if (node.expanded) {
      handleNodeExpand(node.data)
    } else {
      handleNodeCollapse(node.data)
    }
  }

  /**
   * el-tree展开节点的回调
   */
  const handleNodeExpand = (data) => {
    expandedList.value.push(data.elementNo)
  }

  /**
   * el-tree收起节点的回调
   */
  const handleNodeCollapse = (data) => {
    expandedList.value.splice(expandedList.value.indexOf(data.elementNo), 1)
  }

  /**
   * 展开或收起所有节点
   */
  const expandAll = (expand) => {
    expandNode(eltreeRef.value.store.root, expand)
  }

  /**
   * 展开或收起节点
   */
  const expandNode = (node, expand) => {
    node.expanded = expand
    for (let i = 0; i < node.childNodes.length; i++) {
      // 改变节点的自身expanded状态
      node.childNodes[i].expanded = expand

      // 更新已展开节点列表
      if (expand) {
        handleNodeExpand(node.childNodes[i].data)
      } else {
        handleNodeCollapse(node.childNodes[i].data)
      }

      // 遍历子节点
      if (node.childNodes[i].childNodes.length > 0) {
        expandNode(node.childNodes[i], expand)
      }
    }
  }

  return {
    eltreeRef,
    hoveredNode,
    menuOpened,
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
  }
}
