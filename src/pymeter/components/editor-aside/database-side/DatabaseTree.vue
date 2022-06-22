<template>
  <el-tree
    ref="eltreeRef"
    node-key="databaseNo"
    :props="{ label: 'configName' }"
    :data="databaseEngineList"
    :filter-node-method="filterNode"
    @node-click="handleNodeClick"
  >
    <template #default="{ node, data }">
      <span class="tree-item" @mouseenter="mouseenter(node)" @mouseleave="mouseleave()">
        <!-- 树节点 -->
        <span class="tree-item-name-wrapper">
          <!-- 图标 -->
          <SvgIcon icon-name="pymeter-database" class-name="tree-item-icon" />
          <!-- 数据库引擎名称 -->
          <span class="tree-item-name">{{ node.label }}</span>
          <!-- 类型标签 -->
          <el-tag v-if="data.databaseType == 'MYSQL'" type="info" size="small">MySQL</el-tag>
          <el-tag v-if="data.databaseType == 'ORACLE'" type="info" size="small">Oracle</el-tag>
          <el-tag v-if="data.databaseType == 'POSTGRESQL'" type="info" size="small">PostgreSQL</el-tag>
          <el-tag v-if="data.databaseType == 'SQL_SERVER'" type="info" size="small">SQL Server</el-tag>
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
            <el-button type="primary" link :icon="More" />
            <!-- 菜单 -->
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="duplicateDatabaseEngine(data)">复制</el-dropdown-item>
                <el-dropdown-item @click="copyDatabaseEngineToWorkspace(data)">复制到空间</el-dropdown-item>
                <el-dropdown-item @click="moveDatabaseEngineToWorkspace(data)">移动到空间</el-dropdown-item>
                <el-dropdown-item @click="deleteDatabaseEngine(data)">删除</el-dropdown-item>
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
import * as DatabaseService from '@/api/script/database'
import useElTree from '@/composables/useElTree'
import useWorkspaceState from '@/composables/useWorkspaceState'
import usePyMeterState from '@/pymeter/composables/usePyMeterState'
import WorkspaceTree from '@/pymeter/components/editor-aside/common/WorkspaceTree.vue'

const { eltreeRef, hoveredNode, mouseenter, mouseleave, visibleChange } = useElTree()
const { databaseEngineList } = usePyMeterState()
const { workspaceList } = useWorkspaceState()
const store = useStore()

/**
 * 复制数据库引擎
 */
const duplicateDatabaseEngine = async ({ databaseNo, databaseName }) => {
  // 二次确认
  const error = await ElMessageBox.confirm(null, {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    title: '警告',
    message: (
      <span style="white-space:normal; overflow:hidden; text-overflow:ellipsis;">确认复制 {databaseName} 吗？</span>
    )
  })
    .then(() => false)
    .catch(() => true)
  if (error) return
  // 复制数据库引擎
  await DatabaseService.duplicateDatabaseEngine({ databaseNo: databaseNo })
  // 重新查询列表
  store.dispatch('pymeter/queryDatabaseEngineAll')
  // 成功提示
  ElMessage({ message: '复制成功', type: 'info', duration: 2 * 1000 })
}

/**
 * 复制数据库引擎至指定空间
 */
const copyDatabaseEngineToWorkspace = async ({ databaseNo }) => {
  let workspaceNo = null
  // 弹出选择空间的对话框
  const error = await ElMessageBox.confirm(null, {
    title: '请选择复制的工作空间',
    message: (
      <WorkspaceTree
        key={databaseNo}
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
  // 复制数据库引擎到指定的空间
  await DatabaseService.copyDatabaseEngineToWorkspace({ databaseNo: databaseNo, workspaceNo: workspaceNo })
  // 成功提示
  ElMessage({ message: '复制成功', type: 'info', duration: 2 * 1000 })
}

/**
 * 移动数据库引擎至指定空间
 */
const moveDatabaseEngineToWorkspace = async ({ databaseNo }) => {
  let workspaceNo = null
  // 弹出选择空间的对话框
  const error = await ElMessageBox.confirm(null, {
    title: '请选择移动的工作空间',
    message: (
      <WorkspaceTree
        key={databaseNo}
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
  // 移动数据库引擎到指定的空间
  await DatabaseService.moveDatabaseEngineToWorkspace({ databaseNo: databaseNo, workspaceNo: workspaceNo })
  // 重新查询列表
  store.dispatch('pymeter/queryDatabaseEngineAll')
  // 成功提示
  ElMessage({ message: '移动成功', type: 'info', duration: 2 * 1000 })
}

/**
 * 删除数据库引擎
 */
const deleteDatabaseEngine = async ({ databaseNo, databaseName }) => {
  // 二次确认
  const error = await ElMessageBox.confirm(null, {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    title: '警告',
    message: (
      <span style="white-space:normal; overflow:hidden; text-overflow:ellipsis;">确认删除 {databaseName} 吗？</span>
    )
  })
    .then(() => false)
    .catch(() => true)
  if (error) return
  // 删除数据库引擎
  await DatabaseService.deleteDatabaseEngine({ databaseNo: databaseNo })
  // 重新查询列表
  store.dispatch('pymeter/queryDatabaseEngineAll')
  // 成功提示
  ElMessage({ message: '删除成功', type: 'info', duration: 2 * 1000 })
}

/**
 * el-tree handler
 */
const handleNodeClick = (data) => {
  store.commit({
    type: 'pymeter/addTab',
    editorNo: data.configNo,
    editorName: data.configName,
    editorComponent: 'DatabaseEngine',
    editorMode: 'QUERY'
  })
}

/**
 * el-tree 节点过滤
 */
const filterNode = (value, data) => {
  if (!value) return true
  return data.databaseName.indexOf(value) !== -1
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
