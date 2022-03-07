<template>
  <el-table style="width: 100%; margin-bottom: 10px" stripe v-bind="$attrs">
    <!-- 空表格 -->
    <template #empty><el-empty description=" " /></template>
    <!-- 参数名称 -->
    <el-table-column label="参数名称" width="auto">
      <template #default="scope">
        <span>{{ scope.row.name }}</span>
      </template>
    </el-table-column>

    <!-- 参数值 -->
    <el-table-column label="参数值" width="auto">
      <template #default="scope">
        <el-input
          v-if="!queryMode"
          v-model="scope.row.value"
          type="textarea"
          rows="1"
          autosize
          :placeholder="scope.row.default"
        />
        <span v-else>{{ scope.row.value }}</span>
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

<script>
export default {
  name: 'SnippetParamsTable',

  inheritAttrs: false,

  props: {
    editMode: { type: String, default: 'QUERY' }
  },

  computed: {
    queryMode() {
      return this.editMode === 'QUERY'
    }
  },

  methods: {
    newParam() {
      this.$attrs.data.push({ name: '', value: '', desc: '', default: '' })
    },
    removeParam(index) {
      this.$attrs.data.splice(index, 1)
    }
  }
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
