<template>
  <el-tree ref="tree" highlight-current :props="{ label: 'workspaceName' }" v-bind="$attrs">
    <template #default="{ node, data }">
      <!-- 空间名称 -->
      <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ node.label }}</span>
      <!-- 标签 -->
      <el-tag v-if="data.workspaceScope == 'PRIVATE'" size="mini" type="danger">Private</el-tag>
      <el-tag v-if="data.workspaceScope == 'PROTECTED'" size="mini" type="warning">Protected</el-tag>
      <el-tag v-if="data.workspaceScope == 'PUBLIC'" size="mini" type="success">Public</el-tag>
    </template>
  </el-tree>
</template>

<style lang="scss" scoped>
.el-tag {
  margin-left: 5px;
}
</style>
