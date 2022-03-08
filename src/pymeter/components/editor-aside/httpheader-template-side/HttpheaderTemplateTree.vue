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
import { More } from '@element-plus/icons-vue'
import * as HeadersService from '@/api/script/headers'
import useElTree from '@/composables/useElTree'
import useWorkspaceState from '@/composables/useWorkspaceState'
import usePyMeterState from '@/pymeter/composables/usePyMeterState'
import WorkspaceList from '@/pymeter/components/editor-aside/common/WorkspaceList.vue'

const { eltreeRef, hoveredNode, mouseenter, mouseleave, visibleChange } = useElTree()
const { httpHeaderTemplateList } = usePyMeterState()
const { workspaceList } = useWorkspaceState()
</script>

<script lang="jsx">
export default {
  name: 'HttpHeadersTree',
  props: {
    filterText: { type: String, default: '' }
  },
  watch: {
    filterText(val) {
      this.$refs.eltreeRef.filter(val)
    }
  },
  methods: {
    filter(val) {
      this.$refs.eltreeRef.filter(val)
    },
    filterNode(value, data) {
      if (!value) return true
      return data.templateName.indexOf(value) !== -1
    },
    handleNodeClick(data) {
      this.$store.commit({
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
    },

    /**
     * 复制请求头模板
     */
    async duplicateTemplate({ templateNo }) {
      // 二次确认
      const error = await this.$confirm('确定复制吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => false)
        .catch(() => true)
      if (error) return
      // 复制请求头模板
      await HeadersService.duplicateHttpHeaderTemplate({ templateNo: templateNo })
      //  重新查询列表
      this.$store.dispatch('pymeter/queryHttpHeaderTemplateAll')
      // 成功提示
      this.$message({ message: '复制成功', type: 'info', duration: 2 * 1000 })
    },

    /**
     * 复制请求头模板到指定空间
     */
    async copyTemplateToWorkspace({ templateNo }) {
      let workspaceNo = null
      // 弹出选择空间的对话框
      const error = await this.$confirm(null, {
        title: '请选择工作空间',
        message: (
          <workspace-list
            key={templateNo}
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
      // 复制请求头模板到指定空间
      await HeadersService.copyHttpHeaderTemplateToWorkspace({ templateNo: templateNo, workspaceNo: workspaceNo })
      //  成功提示
      this.$message({ message: '复制成功', type: 'info', duration: 1 * 1000 })
    },

    /**
     * 移动请求头模板到指定空间
     */
    async moveTemplateToWorkspace({ templateNo }) {
      let workspaceNo = null
      // 弹出选择空间的对话框
      const error = await this.$confirm(null, {
        title: '请选择工作空间',
        message: (
          <workspace-list
            key={templateNo}
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
      // 移动请求头模板到指定空间
      await HeadersService.moveHttpHeaderTemplateToWorkspace({ templateNo: templateNo, workspaceNo: workspaceNo })
      // 重新查询列表
      this.$store.dispatch('pymeter/queryHttpHeaderTemplateAll')
      // 成功提示
      this.$message({ message: '移动成功', type: 'info', duration: 1 * 1000 })
    },

    /**
     * 删除请求头模板
     */
    async deleteTemplate({ templateNo }) {
      // 二次确认
      const error = await this.$confirm('确定删除吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => false)
        .catch(() => true)
      if (error) return
      // 删除请求头模板
      await HeadersService.deleteHttpHeaderTemplate({ templateNo: templateNo })
      // 重新查询列表
      this.$store.dispatch('pymeter/queryHttpHeaderTemplateAll')
      // 成功提示
      this.$message({ message: '删除成功', type: 'info', duration: 1 * 1000 })
    }
  }
}
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
