<template>
  <el-tree
    ref="tree"
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
            <el-button type="text" icon="el-icon-more" />
            <!-- 菜单 -->
            <template #dropdown>
              <el-dropdown-menu>
                <!-- 删除按钮 -->
                <el-dropdown-item @click="duplicateDataset(data)">复制</el-dropdown-item>
                <el-dropdown-item @click="copyDatasetToWorkspace(data)">复制到空间</el-dropdown-item>
                <el-dropdown-item @click="moveDatasetToWorkspace(data)">移动到空间</el-dropdown-item>
                <el-dropdown-item @click="deleteDataset(data.datasetNo)">删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </span>
      </span>
    </template>
  </el-tree>
</template>

<script setup>
// import { mapState } from 'vuex'
import * as VariablesService from '@/api/script/variables'
import useTree from '@/composables/useTree'
import useTreeNodeFilter from '@/composables/useTreeNodeFilter'
import useWorkspaceState from '@/composables/useWorkspaceState'
import usePyMeterState from '@/pymeter/composables/usePyMeterState'
import WorkspaceList from './common/WorkspaceListDialog.vue'

const { hoveredNode, mouseenter, mouseleave, visibleChange } = useTree()
const { filterNode } = useTreeNodeFilter('datasetName')
const { datasetList } = usePyMeterState()
const { workspaceList } = useWorkspaceState()
</script>

<script lang="jsx">
export default {
  name: 'DatasetTree',
  // props: {
  //   filterText: { type: String, default: '' }
  // },
  // computed: {
  //   ...mapState('workspace', {
  //     workspaceList: (state) => state.workspaceList
  //   }),
  //   ...mapState('pymeter', {
  //     globalDatasetList: (state) => state.globalDatasetList,
  //     environmentDatasetList: (state) => state.environmentDatasetList,
  //     customDatasetList: (state) => state.customDatasetList
  //   }),
  //   datasetList() {
  //     return [...this.globalDatasetList, ...this.environmentDatasetList, ...this.customDatasetList]
  //   }
  // },
  // watch: {
  //   filterText(val) {
  //     this.$refs.tree.filter(val)
  //   }
  // },
  methods: {
    // filter(val) {
    //   this.$refs.tree.filter(val)
    // },
    // filterNode(value, data) {
    //   if (!value) return true
    //   return data.datasetName.indexOf(value) !== -1
    // },
    handleNodeClick(data) {
      this.$store.commit({
        type: 'pymeter/addTab',
        editorNo: data.datasetNo,
        editorName: data.datasetName,
        editorComponent: 'VariableDataset',
        editorMode: 'QUERY',
        metadata: {
          datasetName: data.datasetName,
          datasetType: data.datasetType,
          datasetDesc: data.datasetDesc
        }
      })
    },
    duplicateDataset({ datasetNo }) {
      this.$confirm('确定复制吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        VariablesService.duplicateVariableDataset({ datasetNo: datasetNo }).then(() => {
          this.$store.dispatch('pymeter/queryDatasetAll')
          this.$message({ message: '复制成功', type: 'info', duration: 2 * 1000 })
        })
      })
    },
    copyDatasetToWorkspace({ datasetNo }) {
      let workspaceNo = null
      this.$confirm(null, {
        title: '请选择工作空间',
        message: (
          <WorkspaceList
            key={datasetNo}
            data={this.workspaceList}
            on-node-click={(data) => {
              workspaceNo = data.workspaceNo
            }}
          ></WorkspaceList>
        ),
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        VariablesService.copyVariableDatasetToWorkspace({ datasetNo: datasetNo, workspaceNo: workspaceNo }).then(() => {
          this.$message({ message: '复制成功', type: 'info', duration: 1 * 1000 })
        })
      })
    },
    moveDatasetToWorkspace({ datasetNo }) {
      let workspaceNo = null
      this.$confirm(null, {
        title: '请选择工作空间',
        message: (
          <WorkspaceList
            key={datasetNo}
            data={this.workspaceList}
            on-node-click={(data) => {
              workspaceNo = data.workspaceNo
            }}
          ></WorkspaceList>
        ),
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        VariablesService.moveVariableDatasetToWorkspace({ datasetNo: datasetNo, workspaceNo: workspaceNo }).then(() => {
          this.$store.dispatch('pymeter/queryDatasetAll')
          this.$message({ message: '移动成功', type: 'info', duration: 1 * 1000 })
        })
      })
    },
    deleteDataset(datasetNo) {
      this.$confirm('确定删除吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        VariablesService.deleteVariableDataset({ datasetNo: datasetNo }).then(() => {
          this.$store.dispatch('pymeter/queryDatasetAll')
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
