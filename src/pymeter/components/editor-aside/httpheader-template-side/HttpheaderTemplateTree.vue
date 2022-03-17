<template>
  <el-tree
    ref="eltreeRef"
    node-key="templateNo"
    :props="{ label: 'templateName' }"
    :data="httpHeaderTemplateList"
    :filter-node-method="filterNode"
    @node-click="handleNodeClick"
  >
    <template #default="{ node, data }">
      <span class="tree-item" @mouseenter="mouseenter(node)" @mouseleave="mouseleave()">
        <!-- 树节点 -->
        <span class="tree-item-name-wrapper">
          <!-- 图标 -->
          <SvgIcon icon-name="pymeter-httpheader-template" class-name="tree-item-icon" />
          <!-- 变量集名称 -->
          <span class="tree-item-name">{{ node.label }}</span>
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
                <el-dropdown-item @click="duplicateTemplate(data)">复制</el-dropdown-item>
                <el-dropdown-item @click="copyTemplateToWorkspace(data)">复制到空间</el-dropdown-item>
                <el-dropdown-item @click="moveTemplateToWorkspace(data)">移动到空间</el-dropdown-item>
                <el-dropdown-item @click="deleteTemplate(data)">删除</el-dropdown-item>
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
import * as HeadersService from '@/api/script/headers'
import useElTree from '@/composables/useElTree'
import useWorkspaceState from '@/composables/useWorkspaceState'
import usePyMeterState from '@/pymeter/composables/usePyMeterState'
import WorkspaceTree from '@/pymeter/components/editor-aside/common/WorkspaceTree.vue'

const { eltreeRef, hoveredNode, mouseenter, mouseleave, visibleChange } = useElTree()
const { httpHeaderTemplateList } = usePyMeterState()
const { workspaceList } = useWorkspaceState()
const store = useStore()

/**
 * 复制请求头模板
 */
const duplicateTemplate = async ({ templateNo, templateName }) => {
  // 二次确认
  const error = await ElMessageBox.confirm(null, {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    title: '警告',
    message: (
      <span style="white-space:normal; overflow:hidden; text-overflow:ellipsis;">确认复制 {templateName} 吗？</span>
    )
  })
    .then(() => false)
    .catch(() => true)
  if (error) return
  // 复制请求头模板
  await HeadersService.duplicateHttpHeaderTemplate({ templateNo: templateNo })
  //  重新查询列表
  store.dispatch('pymeter/queryHttpHeaderTemplateAll')
  // 成功提示
  ElMessage({ message: '复制成功', type: 'info', duration: 2 * 1000 })
}

/**
 * 复制请求头模板到指定空间
 */
const copyTemplateToWorkspace = async ({ templateNo }) => {
  let workspaceNo = null
  // 弹出选择空间的对话框
  const error = await ElMessageBox.confirm(null, {
    title: '请选择工作空间',
    message: (
      <WorkspaceTree
        key={templateNo}
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
  // 复制请求头模板到指定空间
  await HeadersService.copyHttpHeaderTemplateToWorkspace({ templateNo: templateNo, workspaceNo: workspaceNo })
  //  成功提示
  ElMessage({ message: '复制成功', type: 'info', duration: 1 * 1000 })
}

/**
 * 移动请求头模板到指定空间
 */
const moveTemplateToWorkspace = async ({ templateNo }) => {
  let workspaceNo = null
  // 弹出选择空间的对话框
  const error = await ElMessageBox.confirm(null, {
    title: '请选择工作空间',
    message: (
      <WorkspaceTree
        key={templateNo}
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
  // 移动请求头模板到指定空间
  await HeadersService.moveHttpHeaderTemplateToWorkspace({ templateNo: templateNo, workspaceNo: workspaceNo })
  // 重新查询列表
  store.dispatch('pymeter/queryHttpHeaderTemplateAll')
  // 成功提示
  ElMessage({ message: '移动成功', type: 'info', duration: 1 * 1000 })
}

/**
 * 删除请求头模板
 */
const deleteTemplate = async ({ templateNo, templateName }) => {
  // 二次确认
  const error = await ElMessageBox.confirm(null, {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    title: '警告',
    message: (
      <span style="white-space:normal; overflow:hidden; text-overflow:ellipsis;">确认删除 {templateName} 吗？</span>
    )
  })
    .then(() => false)
    .catch(() => true)
  if (error) return
  // 删除请求头模板
  await HeadersService.deleteHttpHeaderTemplate({ templateNo: templateNo })
  // 重新查询列表
  store.dispatch('pymeter/queryHttpHeaderTemplateAll')
  // 成功提示
  ElMessage({ message: '删除成功', type: 'info', duration: 1 * 1000 })
}

/**
 * el-tree handler
 */
const handleNodeClick = (data) => {
  store.commit({
    type: 'pymeter/addTab',
    editorNo: data.templateNo,
    editorName: data.templateName,
    editorComponent: 'HttpHeadersTemplate',
    editorMode: 'QUERY',
    metadata: {
      templateName: data.templateName,
      templateDesc: data.templateDesc
    }
  })
}

/**
 * el-tree 节点过滤
 */
const filterNode = (value, data) => {
  if (!value) return true
  return data.templateName.indexOf(value) !== -1
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
  height: 1.8em !important;
  width: 1.8em !important;
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
