<template>
  <el-table style="width: 100%; margin-bottom: 10px" stripe>
    <!-- 空表格 -->
    <template #empty><el-empty description=" " /></template>
    <!-- 参数名称 -->
    <el-table-column label="参数名称" width="auto">
      <template #default="{ row }">
        <span>{{ row.name }}</span>
      </template>
    </el-table-column>

    <!-- 参数值 -->
    <el-table-column label="参数值" width="auto">
      <template #default="{ row }">
        <span v-if="useDefault">{{ row.default }}</span>
        <el-input
          v-else-if="!queryMode"
          v-model="row.value"
          type="textarea"
          rows="1"
          autosize
          :placeholder="row.default"
        />
        <span v-else>{{ row.value }}</span>
      </template>
    </el-table-column>

    <!-- 参数描述 -->
    <el-table-column label="描述" width="auto">
      <template #default="{ row }">
        <span>{{ row.desc }}</span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
const props = defineProps({
  editMode: { type: String, default: 'QUERY' },
  useDefault: Boolean
})
const queryMode = computed(() => props.editMode === 'QUERY')
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
  text-overflow: ellipsis;
}
</style>
