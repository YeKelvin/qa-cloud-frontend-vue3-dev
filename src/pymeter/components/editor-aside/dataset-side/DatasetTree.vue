<template>
  <el-tree
    ref="eltreeRef"
    node-key="datasetNo"
    :props="{ label: 'datasetName' }"
    :data="datasetList"
    :filter-node-method="filterNode"
    @node-click="handleNodeClick"
  >
    <template #default="{ node, data }">
      <span class="tree-item" @mouseenter="mouseenter(node)" @mouseleave="mouseleave()">
        <!-- 树节点 -->
        <span class="tree-item-name-wrapper">
          <!-- 图标 -->
          <SvgIcon icon-name="pymeter-dataset" class-name="tree-item-icon" />
          <!-- 变量集名称 -->
          <span class="tree-item-name">{{ node.label }}</span>
          <!-- 类型标签 -->
          <el-tag v-if="data.datasetType == 'GLOBAL'" type="info" size="small">全局</el-tag>
          <el-tag v-if="data.datasetType == 'ENVIRONMENT'" size="small">环境</el-tag>
          <el-tag v-if="data.datasetType == 'CUSTOM'" type="warning" size="small">自定义</el-tag>
        </span>

        <!-- 操作菜单 -->
        <span v-show="hoveredNode === node" @click.stop>
          <el-dropdown
            trigger="click"
            placement="bottom"
            :show-timeout="50"
            :hide-timeout="50"
            @visible-change="visibleChange"
          >
            <!-- 菜单弹出按钮 -->
            <el-button type="text" :icon="More" />
            <!-- 菜单 -->
            <template #dropdown>
              <el-dropdown-menu>
                <!-- 删除按钮 -->
                <el-dropdown-item @click="renameDataset(data)">重命名</el-dropdown-item>
                <el-dropdown-item @click="duplicateDataset(data)">复制</el-dropdown-item>
                <el-dropdown-item @click="copyDatasetToWorkspace(data)">复制到空间</el-dropdown-item>
                <el-dropdown-item @click="moveDatasetToWorkspace(data)">移动到空间</el-dropdown-item>
                <el-dropdown-item @click="deleteDataset(data)">删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </span>
      </span>
    </template>
  </el-tree>
</template>

<script lang="jsx" setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { More } from '@element-plus/icons-vue'
import * as VariablesService from '@/api/script/variables'
import useElTree from '@/composables/useElTree'
import useWorkspaceState from '@/composables/useWorkspaceState'
import usePyMeterState from '@/pymeter/composables/usePyMeterState'
import NameInput from '@/pymeter/components/editor-aside/common/NameInput.vue'
import WorkspaceTree from '@/pymeter/components/editor-aside/common/WorkspaceTree.vue'

const { eltreeRef, hoveredNode, mouseenter, mouseleave, visibleChange } = useElTree()
const { datasetList } = usePyMeterState()
const { workspaceList } = useWorkspaceState()
const store = useStore()

/**
 * 重命名变量集
 */
const renameDataset = async ({ datasetNo, datasetName }) => {
  let newName = datasetName
  // 弹出名称对话框
  const error = await ElMessageBox.confirm(null, {
    title: '重命名变量集',
    message: <NameInput initial={newName} onUpdate:modelValue={(val) => (newName = val)} />,
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(() => false)
    .catch(() => true)
  if (error) return
  // 修改变量集
  await VariablesService.modifyVariableDataset({ datasetNo: datasetNo, datasetName: newName })
  // 重新查询列表
  store.dispatch('pymeter/queryDatasetAll')
  // 重命名tab
  store.commit('pymeter/updateTab', { editorNo: datasetNo, editorName: newName })
  // 成功提示
  ElMessage({ message: '修改成功', type: 'info', duration: 2 * 1000 })
}

/**
 * 复制变量集
 */
const duplicateDataset = async ({ datasetNo, datasetName }) => {
  // 二次确认
  const error = await ElMessageBox.confirm(null, {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    title: '警告',
    message: (
      <span style="white-space:normal; overflow:hidden; text-overflow:ellipsis;">确认复制 {datasetName} 吗？</span>
    )
  })
    .then(() => false)
    .catch(() => true)
  if (error) return
  // 复制变量集
  await VariablesService.duplicateVariableDataset({ datasetNo: datasetNo })
  // 重新查询列表
  store.dispatch('pymeter/queryDatasetAll')
  // 成功提示
  ElMessage({ message: '复制成功', type: 'info', duration: 2 * 1000 })
}

/**
 * 复制变量集至指定空间
 */
const copyDatasetToWorkspace = async ({ datasetNo }) => {
  let workspaceNo = null
  // 弹出选择空间的对话框
  const error = await ElMessageBox.confirm(null, {
    title: '请选择复制的工作空间',
    message: (
      <WorkspaceTree
        key={datasetNo}
        data={workspaceList.value}
        onNodeClick={(data) => (workspaceNo = data.workspaceNo)}
      />
    ),
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(() => false)
    .catch(() => true)
  if (error) return
  // 复制变量集到指定的空间
  await VariablesService.copyVariableDatasetToWorkspace({ datasetNo: datasetNo, workspaceNo: workspaceNo })
  // 成功提示
  ElMessage({ message: '复制成功', type: 'info', duration: 2 * 1000 })
}

/**
 * 移动变量集至指定空间
 */
const moveDatasetToWorkspace = async ({ datasetNo }) => {
  let workspaceNo = null
  // 弹出选择空间的对话框
  const error = await ElMessageBox.confirm(null, {
    title: '请选择移动的工作空间',
    message: (
      <WorkspaceTree
        key={datasetNo}
        data={workspaceList.value}
        onNodeClick={(data) => (workspaceNo = data.workspaceNo)}
      />
    ),
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(() => false)
    .catch(() => true)
  if (error) return
  // 移动变量集到指定的空间
  await VariablesService.moveVariableDatasetToWorkspace({ datasetNo: datasetNo, workspaceNo: workspaceNo })
  // 重新查询列表
  store.dispatch('pymeter/queryDatasetAll')
  // 成功提示
  ElMessage({ message: '移动成功', type: 'info', duration: 2 * 1000 })
}

/**
 * 删除变量集
 */
const deleteDataset = async ({ datasetNo, datasetName }) => {
  // 二次确认
  const error = await ElMessageBox.confirm(null, {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    title: '警告',
    message: (
      <span style="white-space:normal; overflow:hidden; text-overflow:ellipsis;">确认删除 {datasetName} 吗？</span>
    )
  })
    .then(() => false)
    .catch(() => true)
  if (error) return
  // 删除变量集
  await VariablesService.deleteVariableDataset({ datasetNo: datasetNo })
  // 重新查询列表
  store.dispatch('pymeter/queryDatasetAll')
  // 成功提示
  ElMessage({ message: '删除成功', type: 'info', duration: 2 * 1000 })
}

/**
 * el-tree handler
 */
const handleNodeClick = (data) => {
  store.commit({
    type: 'pymeter/addTab',
    editorNo: data.datasetNo,
    editorName: data.datasetName,
    editorComponent: 'VariableDataset',
    editorMode: 'QUERY'
  })
}

/**
 * el-tree 节点过滤
 */
const filterNode = (value, data) => {
  if (!value) return true
  return data.datasetName.indexOf(value) !== -1
}

/**
 * el-tree 文本过滤
 */
const filter = (val) => {
  eltreeRef.value.filter(val)
}

defineExpose({
  filter
})
</script>

<style lang="scss" scoped>
.tree-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 8px;
}

.tree-item-name-wrapper {
  display: flex;
  align-items: center;
  user-select: none;
}

.tree-item-icon {
  height: 1.6em !important;
  width: 1.6em !important;
  padding-right: 5px;
}

.tree-item-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 10px;
}

:deep(.el-tree-node__content) {
  height: 100%;
  min-height: 30px;
}
</style>
