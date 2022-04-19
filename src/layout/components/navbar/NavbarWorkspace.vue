<template>
  <el-popover ref="elpopoverRef" placement="bottom" width="400px" trigger="click">
    <!-- 切换工作空间的按钮 -->
    <template #reference>
      <el-button type="text" style="color: #606266; font: 14px; font-family: inherit">
        <SvgIcon icon-name="navbar-workspace" style="height: 1.5em; width: 1.5em" />
        <span style="margin: 5px">{{ workspaceName }}</span>
        <el-icon><caret-bottom /></el-icon>
      </el-button>
    </template>

    <!-- 过滤input -->
    <el-input v-model="filterText" placeholder="请输入" style="margin-bottom: 10px" />

    <!-- 工作空间列表 -->
    <el-tree
      ref="eltreeRef"
      highlight-current
      :props="{ label: 'workspaceName' }"
      :data="workspaceList"
      :filter-node-method="filterNode"
      @node-click="handleNodeClick"
    >
      <template #default="{ node, data }">
        <!-- 空间名称 -->
        <span class="workspace-name">{{ node.label }}</span>
        <!-- 标签 -->
        <template v-if="data.workspaceScope == 'PRIVATE'">
          <el-tag size="small" type="danger" style="margin-left: 5px">私有</el-tag>
        </template>
        <template v-if="data.workspaceScope == 'PROTECTED'">
          <el-tag size="small" type="warning" style="margin-left: 5px">保护</el-tag>
        </template>
        <template v-if="data.workspaceScope == 'PUBLIC'">
          <el-tag size="small" type="success" style="margin-left: 5px">公共</el-tag>
        </template>
      </template>
    </el-tree>
  </el-popover>
</template>

<script setup>
import { CaretBottom } from '@element-plus/icons-vue'
import useWorkspaceState from '@/composables/useWorkspaceState'

const store = useStore()
const elpopoverRef = ref()
const eltreeRef = ref()
const filterText = ref('')
const { workspaceList, workspaceName } = useWorkspaceState()
watch(filterText, (val) => eltreeRef.value.filter(val))
onMounted(() => store.dispatch('workspace/setWorkspaceList'))

const handleNodeClick = (node) => {
  store.commit('workspace/setWorkspaceNo', node.workspaceNo)
  store.commit('workspace/setWorkspaceName', node.workspaceName)
  store.commit('workspace/setWorkspaceScope', node.workspaceScope)
  elpopoverRef.value.hide()
}
const filterNode = (value, data) => {
  if (!value) return true
  return data.workspaceName.indexOf(value) !== -1
}
</script>

<style lang="scss" scoped>
.workspace-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.el-tree-node__content) {
  justify-content: space-between;
  padding: 0 10px !important;

  .el-tree-node__expand-icon {
    display: none;
  }
}
</style>
