<template>
  <el-table stripe style="width: 100%; margin-bottom: 10px">
    <!-- 空表格 -->
    <template #empty>
      <el-empty :image-size="80">
        <template #description>
          <el-button type="text" :icon="Plus" :disabled="queryMode" @click="newItem()">添加</el-button>
        </template>
      </el-empty>
    </template>

    <!-- 是否启用 -->
    <el-table-column label="启用" align="center" width="60" min-width="60">
      <template #default="{ row }">
        <el-checkbox v-model="row.enabled" :disabled="queryMode" />
      </template>
    </el-table-column>

    <!-- 参数名称 -->
    <el-table-column label="名称" width="auto">
      <template #default="{ row }">
        <SimpleTextarea v-if="!queryMode" v-model="row.name" />
        <span v-else>{{ row.name }}</span>
      </template>
    </el-table-column>

    <!-- 参数值 -->
    <el-table-column label="值" width="auto">
      <template #default="{ row }">
        <SimpleTextarea v-if="!queryMode" v-model="row.value" />
        <span v-else>{{ row.value }}</span>
      </template>
    </el-table-column>

    <!-- 参数描述 -->
    <el-table-column label="描述" width="auto">
      <template #default="{ row }">
        <SimpleTextarea v-if="!queryMode" v-model="row.desc" />
        <span v-else>{{ row.desc }}</span>
      </template>
    </el-table-column>

    <!-- 操作列 -->
    <el-table-column fixed="right" align="center" width="50" min-width="10">
      <template #header>
        <el-button type="text" :icon="Plus" :disabled="queryMode" @click="newItem()" />
      </template>
      <template #default="{ $index }">
        <el-button type="text" :icon="Delete" :disabled="queryMode" @click="delItem($index)" />
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { Delete, Plus } from '@element-plus/icons-vue'
import SimpleTextarea from '@/components/simple-textarea/SimpleTextarea.vue'

const props = defineProps({
  editMode: { type: String, default: 'QUERY' }
})
const attrs = useAttrs()
const queryMode = computed(() => props.editMode === 'QUERY')
const tableData = computed(() => attrs.data)

const newItem = () => {
  tableData.value.push({ enabled: true, name: '', value: '', desc: '' })
}
const delItem = (index) => {
  tableData.value.splice(index, 1)
}
</script>

<style lang="scss" scoped>
span {
  white-space: pre-wrap;
  text-overflow: ellipsis;
  letter-spacing: 0.6px;
}
</style>
