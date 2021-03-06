<template>
  <div class="tree-container">
    <div v-show="collections.length > 0" style="width: 100%; height: 100%">
      <!-- 按钮 -->
      <div style="display: flex; justify-content: flex-end">
        <el-button type="primary" link :disabled="readonly" @click="setAllChecked">全选</el-button>
        <el-button type="primary" link :disabled="readonly" @click="resetChecked">清空</el-button>
      </div>

      <!-- 搜索 -->
      <el-input v-model="filterText" placeholder="请输入" style="margin-bottom: 10px" clearable />

      <el-tree
        ref="eltreeRef"
        node-key="elementNo"
        draggable
        show-checkbox
        highlight-current
        :data="collections"
        :allow-drop="allowDrop"
        :filter-node-method="filterNode"
        :props="{ label: 'elementName', children: 'children' }"
        @node-click="handleNodeClick"
      >
        <template #default="{ node, data }">
          <span style="display: inline-flex; align-items: center">
            <el-tag size="small" style="margin-right: 10px">
              {{ node.parent.childNodes.findIndex((item) => item.key == data.elementNo) + 1 }}
            </el-tag>
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ node.label }}</span>
          </span>
        </template>
      </el-tree>
    </div>

    <!-- 空提示 -->
    <el-empty v-show="collections.length == 0" description="工作空间下暂无脚本" />
  </div>
</template>

<script setup>
import useWorkspaceState from '@/composables/useWorkspaceState'
import * as ElementService from '@/api/script/element'

const { workspaceNo } = useWorkspaceState()
const props = defineProps({
  readonly: { type: Boolean, default: true }
})
const collections = ref([])
const filterText = ref('')
const eltreeRef = ref()

watch(workspaceNo, (val) => {
  if (!val) return
  queryCollections()
})
watch(filterText, (val) => eltreeRef.value.filter(val))
watch(
  () => props.readonly,
  (val) => {
    if (val) {
      collections.value.forEach((item) => {
        item.disabled = true
      })
    } else {
      collections.value.forEach((item) => {
        item.disabled = false
      })
    }
  }
)

onMounted(() => {
  if (workspaceNo.value) queryCollections()
})

/**
 * 根据工作空间编号查询测试集合
 */
const queryCollections = () => {
  ElementService.queryElementAll({
    workspaceNo: workspaceNo.value,
    elementType: 'COLLECTION',
    elementClass: 'TestCollection'
  }).then((response) => {
    collections.value = response.result
    if (props.readonly) {
      collections.value.forEach((item) => (item.disabled = true))
    }
  })
}

/**
 * 拖拽时判定目标节点能否被放置
 */
const allowDrop = (draggingNode, dropNode, type) => {
  // 只允许在 Collection 前后插入，不允许在 Collection 里插入
  if (type === 'inner') {
    return false
  }
  return true
}

const handleNodeClick = (data, node) => {
  if (props.readonly) return
  // 点击节点勾选 checkbox
  node.checked = !node.checked
}

const filterNode = (value, data) => {
  if (!value) return true
  return data.elementName.indexOf(value) !== -1
}

const setAllChecked = () => {
  eltreeRef.value.setCheckedKeys(collections.value.map((item) => item.elementNo))
}

const setCheckedKeys = (keys) => {
  eltreeRef.value.setCheckedKeys(keys)
}

const resetChecked = () => {
  eltreeRef.value.setCheckedKeys([])
}

const getCheckedCollections = () => {
  const nodes = eltreeRef.value.getCheckedNodes()
  const collectionList = []
  for (let i = 0, len = nodes.length; i < len; i++) {
    collectionList.push({ sortNo: i, elementNo: nodes[i].elementNo })
  }
  return collectionList
}

defineExpose({
  getCheckedCollections,
  setCheckedKeys
})
</script>

<style lang="scss" scoped>
.tree-container {
  height: 100%;

  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
}

:deep(.el-tree-node) {
  margin-bottom: 5px;
}
</style>
