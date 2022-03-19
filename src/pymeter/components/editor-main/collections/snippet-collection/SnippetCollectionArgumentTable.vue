<template>
  <el-table style="width: 100%" stripe>
    <!-- 参数名称 -->
    <el-table-column label="参数名称" width="auto">
      <template #default="{ row }">
        <span>{{ row.name }}</span>
      </template>
    </el-table-column>

    <!-- 参数值 -->
    <el-table-column label="参数值" width="auto">
      <template #default="{ row }">
        <el-input v-model="row.default" type="textarea" rows="1" autosize :placeholder="row.default" />
      </template>
    </el-table-column>

    <!-- 参数描述 -->
    <el-table-column label="参数描述" width="auto">
      <template #default="{ row }">
        <span>{{ row.desc }}</span>
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
