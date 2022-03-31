<template>
  <el-card shadow="hover" style="margin: 10px 0" :body-style="{ padding: '10px' }">
    <template #header><span>自定义</span></template>
    <el-table stripe style="width: 100%; margin-bottom: 10px" v-bind="$attrs">
      <!-- 空表格 -->
      <template #empty>
        <el-empty :image-size="80">
          <template #description>
            <el-button type="text" :icon="Plus" :disabled="queryMode" @click="newHeader()">添加</el-button>
          </template>
        </el-empty>
      </template>

      <!-- 是否启用 -->
      <el-table-column label="启用" align="center" width="60" min-width="60">
        <template #default="{ row }">
          <el-checkbox v-model="row.enabled" :disabled="queryMode" />
        </template>
      </el-table-column>

      <!-- header名称 -->
      <el-table-column label="请求头名称" width="auto">
        <template #default="{ row }">
          <SimpleTextarea v-if="!queryMode" v-model="row.name" />
          <span v-else>{{ row.name }}</span>
        </template>
      </el-table-column>

      <!-- header值 -->
      <el-table-column label="请求头内容" width="auto">
        <template #default="{ row }">
          <SimpleTextarea v-if="!queryMode" v-model="row.value" />
          <span v-else>{{ row.value }}</span>
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column fixed="right" align="center" width="50" min-width="10">
        <template #header>
          <el-button type="text" :icon="Plus" :disabled="queryMode" @click="newHeader()" />
        </template>
        <template #default="{ $index }">
          <el-button type="text" :icon="Delete" :disabled="queryMode" @click="delHeader($index)" />
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
import { Delete, Plus } from '@element-plus/icons-vue'
import SimpleTextarea from '@/components/simple-textarea/SimpleTextarea.vue'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  editMode: { type: String, default: 'QUERY' }
})
const attrs = useAttrs()
const queryMode = computed(() => props.editMode === 'QUERY')
const tableData = computed(() => attrs.data)

const newHeader = () => {
  tableData.value.push({ enabled: true, name: '', value: '' })
}
const delHeader = (index) => {
  tableData.value.splice(index, 1)
}
</script>

<style lang="scss" scoped>
:deep(.el-card__header) {
  user-select: none;
  padding: 5px 10px;
}

:deep(.el-empty__description) {
  margin-top: 0;
}

.el-empty {
  padding: 0;
  padding-top: 20px;
}

.el-table {
  &::before {
    height: 0;
  }
}

span {
  white-space: pre-wrap;
  text-overflow: ellipsis;
  letter-spacing: 0.6px;
}
</style>
