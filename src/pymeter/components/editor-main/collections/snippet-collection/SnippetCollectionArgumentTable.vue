<template>
  <el-table style="width: 100%" stripe v-bind="$attrs">
    <!-- 参数名称 -->
    <el-table-column label="参数名称" width="auto">
      <template #default="scope">
        <span>{{ scope.row.name }}</span>
      </template>
    </el-table-column>

    <!-- 参数值 -->
    <el-table-column label="参数值" width="auto">
      <template #default="scope">
        <el-input v-model="scope.row.default" type="textarea" rows="1" autosize :placeholder="scope.row.default" />
      </template>
    </el-table-column>

    <!-- 参数描述 -->
    <el-table-column label="描述" width="auto">
      <template #default="scope">
        <span>{{ scope.row.desc }}</span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup></script>

<style lang="scss" scoped>
.el-table {
  &::before {
    height: 0;
  }
}

span {
  letter-spacing: 0.6px;
  white-space: pre-wrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
