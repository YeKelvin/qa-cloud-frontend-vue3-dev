<template>
  <el-tree
    ref="tree"
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
          <SvgIcon icon-name="header" class-name="tree-item-icon" />
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
            <el-button type="text" icon="el-icon-more" />
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

<script>
import { mapState } from 'vuex'
import ElTreeMixin from '@/mixins/el-tree-mixin'
import WorkspaceList from './workspace-list'
import * as HeadersService from '@/api/script/headers'

export default {
  name: 'HttpHeadersTree',
  // eslint-disable-next-line
  components: { WorkspaceList },
  mixins: [ElTreeMixin],

  props: {
    filterText: { type: String, default: '' }
  },

  data() {
    return {}
  },

  computed: {
    ...mapState('workspace', {
      workspaceList: (state) => state.workspaceList
    }),
    ...mapState('pymeter', {
      httpHeaderTemplateList: (state) => state.httpHeaderTemplateList
    })
  },

  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },

  methods: {
    filter(val) {
      this.$refs.tree.filter(val)
    },
    filterNode(value, data) {
      if (!value) return true
      return data.datasetName.indexOf(value) !== -1
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
    duplicateTemplate({ templateNo }) {
      this.$confirm('确定复制吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        HeadersService.duplicateHttpHeaderTemplate({ templateNo: templateNo }).then(() => {
          this.$store.dispatch('pymeter/queryHttpHeaderTemplateAll')
          this.$message({ message: '复制成功', type: 'info', duration: 2 * 1000 })
        })
      })
    },
    copyTemplateToWorkspace({ templateNo }) {
      let workspaceNo = null
      this.$confirm(null, {
        title: '请选择工作空间',
        message: (
          <workspace-list
            key={templateNo}
            data={this.workspaceList}
            on-node-click={(data) => {
              workspaceNo = data.workspaceNo
            }}
          ></workspace-list>
        ),
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        HeadersService.copyHttpHeaderTemplateToWorkspace({ templateNo: templateNo, workspaceNo: workspaceNo }).then(
          () => {
            this.$message({ message: '复制成功', type: 'info', duration: 1 * 1000 })
          }
        )
      })
    },
    moveTemplateToWorkspace({ templateNo }) {
      let workspaceNo = null
      this.$confirm(null, {
        title: '请选择工作空间',
        message: (
          <workspace-list
            key={templateNo}
            data={this.workspaceList}
            on-node-click={(data) => {
              workspaceNo = data.workspaceNo
            }}
          ></workspace-list>
        ),
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        HeadersService.moveHttpHeaderTemplateToWorkspace({ templateNo: templateNo, workspaceNo: workspaceNo }).then(
          () => {
            this.$store.dispatch('pymeter/queryHttpHeaderTemplateAll')
            this.$message({ message: '移动成功', type: 'info', duration: 1 * 1000 })
          }
        )
      })
    },

    /**
     * 删除请求头模板
     */
    deleteTemplate({ templateNo }) {
      this.$confirm('确定删除吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        HeadersService.deleteHttpHeaderTemplate({ templateNo: templateNo }).then(() => {
          this.$store.dispatch('pymeter/queryHttpHeaderTemplateAll')
        })
      })
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
