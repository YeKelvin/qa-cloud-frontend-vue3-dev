<template>
  <el-table style="width: 100%" stripe v-bind="$attrs">
    <!-- 参数名称 -->
    <el-table-column label="参数名称" width="auto">
      <span slot-scope="scope">{{ scope.row.name }}</span>
    </el-table-column>

    <!-- 参数值 -->
    <el-table-column label="参数值" width="auto">
      <el-input
        v-model="scope.row.default"
        slot-scope="scope"
        type="textarea"
        rows="1"
        autosize
        :placeholder="scope.row.default"
      />
    </el-table-column>

    <!-- 参数描述 -->
    <el-table-column label="描述" width="auto">
      <span slot-scope="scope">{{ scope.row.desc }}</span>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'SnippetsRuntimeVariablesTable'
}
</script>

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
