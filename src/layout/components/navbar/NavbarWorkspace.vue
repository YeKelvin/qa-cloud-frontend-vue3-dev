<template>
  <el-popover ref="popover" placement="bottom" width="400" trigger="click">

    <!-- 切换工作空间的按钮 -->
    <el-button slot="reference" type="text" style="color:#606266; font:14px; font-family:inherit">
      <svg-icon icon-class="workspace" style="height:1.5em; width:1.5em; vertical-align:-0.25em;" />
      {{ workspaceName }}
      <i class="el-icon-caret-bottom" />
    </el-button>

    <!-- 过滤input -->
    <el-input v-model="filterText" size="small" placeholder="请输入搜索内容" />

    <!-- 工作空间列表 -->
    <el-tree
      ref="tree"
      style="margin-top:10px;"
      highlight-current
      :props="{ label: 'workspaceName' }"
      :data="workspaceList"
      :filter-node-method="filterNode"
      @node-click="handleNodeClick"
    >
      <span slot-scope="{ node, data }">
        <!-- 空间名称 -->
        <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ node.label }}</span>
        <!-- 标签 -->
        <el-tag
          v-if="data.workspaceScope == 'PRIVATE'"
          size="mini"
          type="danger"
          style="margin-left:5px;"
        >Private</el-tag>
        <el-tag
          v-if="data.workspaceScope == 'PROTECTED'"
          size="mini"
          type="warning"
          style="margin-left:5px;"
        >Protected</el-tag>
        <el-tag
          v-if="data.workspaceScope == 'PUBLIC'"
          size="mini"
          type="success"
          style="margin-left:5px;"
        >Public</el-tag>
      </span>
    </el-tree>

  </el-popover>
</template>

<script>
import { mapState } from 'vuex'

export default {

  name: 'NavbarWorkspace',

  data() {
    return {
      filterText: ''
    }
  },

  computed: {
    ...mapState('workspace', {
      workspaceList: state => state.workspaceList,
      workspaceNo: state => state.workspaceNo,
      workspaceName: state => state.workspaceName,
      workspaceScope: state => state.workspaceScope
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

<style lang="scss" scoped>
</style>
