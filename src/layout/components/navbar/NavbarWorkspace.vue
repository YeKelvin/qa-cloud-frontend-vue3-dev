<template>
  <el-popover ref="popover" placement="bottom" width="400" trigger="click">
    <!-- 切换工作空间的按钮 -->
    <template #reference>
      <el-button type="text" style="color: #606266; font: 14px; font-family: inherit">
        <SvgIcon icon-name="navbar-workspace" style="height: 1.5em; width: 1.5em" />
        <span style="margin: 5px">{{ workspaceName }}</span>
        <el-icon><caret-bottom /></el-icon>
      </el-button>
    </template>

    <!-- 过滤input -->
    <el-input v-model="filterText" placeholder="请输入搜索内容" />

    <!-- 工作空间列表 -->
    <el-tree
      ref="tree"
      style="margin-top: 10px"
      highlight-current
      :props="{ label: 'workspaceName' }"
      :data="workspaceList"
      :filter-node-method="filterNode"
      @node-click="handleNodeClick"
    >
      <template #default="{ node, data }">
        <!-- 空间名称 -->
        <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ node.label }}</span>
        <!-- 标签 -->
        <template v-if="data.workspaceScope == 'PRIVATE'">
          <el-tag size="small" type="danger" style="margin-left: 5px">private</el-tag>
        </template>
        <template v-if="data.workspaceScope == 'PROTECTED'">
          <el-tag size="small" type="warning" style="margin-left: 5px">protected</el-tag>
        </template>
        <template v-if="data.workspaceScope == 'PUBLIC'">
          <el-tag size="small" type="success" style="margin-left: 5px">public</el-tag>
        </template>
      </template>
    </el-tree>
  </el-popover>
</template>

<script setup>
import { mapState } from 'vuex'
import { CaretBottom } from '@element-plus/icons-vue'
</script>

<script>
export default {
  name: 'NavbarWorkspace',

  data() {
    return {
      filterText: ''
    }
  },

  computed: {
    ...mapState('workspace', {
      workspaceList: (state) => state.workspaceList,
      workspaceNo: (state) => state.workspaceNo,
      workspaceName: (state) => state.workspaceName,
      workspaceScope: (state) => state.workspaceScope
    })
  },

  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },

  mounted() {
    this.$store.dispatch('workspace/setWorkspaceList')
  },

  methods: {
    handleNodeClick(node) {
      this.$store.commit('workspace/setWorkspaceNo', node.workspaceNo)
      this.$store.commit('workspace/setWorkspaceName', node.workspaceName)
      this.$store.commit('workspace/setWorkspaceScope', node.workspaceScope)
      this.$refs.popover.doClose()
    },
    filterNode(value, data) {
      if (!value) return true
      return data.workspaceName.indexOf(value) !== -1
    }
  }
}
</script>

<style lang="scss" scoped></style>
