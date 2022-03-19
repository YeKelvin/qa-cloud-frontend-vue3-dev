<template>
  <el-table ref="eltableRef" style="width: 100%; margin-bottom: 10px" stripe>
    <!-- 空表格 -->
    <template #empty><el-empty description=" " /></template>

    <!-- 参数名称 -->
    <el-table-column label="参数名称" width="auto">
      <template #default="{ row }">
        <el-input v-if="!queryMode" v-model="row.name" type="textarea" rows="1" autosize />
        <span v-else>{{ row.name }}</span>
      </template>
    </el-table-column>

    <!-- 默认值 -->
    <el-table-column label="参数默认值" width="auto">
      <template #default="{ row }">
        <el-input v-if="!queryMode" v-model="row.default" type="textarea" rows="1" autosize />
        <span v-else>{{ row.default }}</span>
      </template>
    </el-table-column>

    <!-- 参数描述 -->
    <el-table-column label="参数描述" width="auto">
      <template #default="{ row }">
        <el-input v-if="!queryMode" v-model="row.desc" type="textarea" rows="1" autosize />
        <span v-else>{{ row.desc }}</span>
      </template>
    </el-table-column>

    <!-- 操作列 -->
    <el-table-column v-if="!queryMode" fixed="right" align="center" width="50" min-width="10">
      <template #header>
        <el-button type="text" :icon="Plus" :disabled="queryMode" @click="newParameter" />
      </template>
      <template #default="scope">
        <el-button type="text" :icon="Delete" :disabled="queryMode" @click="removeParameter(scope.$index)" />
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
import { Delete, Plus } from '@element-plus/icons-vue'
import { isEmpty } from 'lodash-es'
import { isBlankAll } from '@/utils/string-util'

const props = defineProps({
  editMode: { type: String, default: 'QUERY' }
})
const attrs = useAttrs()
const eltableRef = ref()
const queryMode = computed(() => props.editMode === 'QUERY')
const tableData = computed(() => attrs.data)

watch(queryMode, () => {
  // 动态显隐表格列后重新渲染表格
  nextTick(() => {
    eltableRef.value.doLayout()
  })
  // 表格没有数据时自动添加一行
  if (!queryMode.value && isEmpty(tableData.value)) {
    newParameter()
  }
})

watch(
  tableData,
  () => {
    if (queryMode.value) return
    if (isEmpty(tableData.value)) {
      newParameter()
    } else {
      if (!isBlankRow(tableData.value[tableData.value.length - 1])) newParameter()
    }
  },
  { deep: true }
)

onMounted(() => {
  if (queryMode.value) return
  if (isEmpty(tableData.value)) newParameter()
})

const newParameter = () => {
  attrs.data.push({ name: '', default: '', desc: '' })
}
const removeParameter = (index) => {
  attrs.data.splice(index, 1)
}
const isBlankRow = (param) => {
  return isBlankAll(param.name, param.default, param.desc)
}
</script>

<style lang="scss" scoped>
span {
  letter-spacing: 0.6px;
  white-space: pre-wrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
