<template>
  <!-- 请求头模板卡片 -->
  <el-card shadow="hover" :body-style="{ padding: '10px' }">
    <!-- 卡片头 -->
    <template #header><span>模板</span></template>

    <el-tag v-if="showWarning" type="danger" style="margin-bottom: 10px">
      警告：部分请求头模板不属于此工作空间，请重新编辑
    </el-tag>

    <!-- 请求头模板列表 -->
    <el-select
      v-model="localModel"
      v-bind="$attrs"
      placeholder="请求头模板"
      style="width: 100%"
      multiple
      :disabled="queryMode"
      @change="handleChange"
    >
      <el-option
        v-for="item in httpHeaderTemplateList"
        :key="item.templateNo"
        :label="item.templateName"
        :value="item.templateNo"
      />
    </el-select>

    <!-- 查看详情按钮 -->
    <el-button v-if="!showDetails" type="text" :icon="ArrowDown" :disabled="_isEmpty(localModel)" @click="showHeaders">
      查看详情
    </el-button>

    <!-- 模板下的请求头表格 -->
    <el-table v-else-if="rows.length > 0" style="width: 100%; margin-bottom: 10px" stripe :data="rows">
      <!-- header名称 -->
      <el-table-column prop="headerName" label="名称" />
      <!-- header值 -->
      <el-table-column prop="headerValue" label="值" />
    </el-table>
  </el-card>
</template>

<script setup>
import { isEmpty as _isEmpty } from 'lodash-es'
import { ArrowDown } from '@element-plus/icons-vue'
import useWorkspaceState from '@/composables/useWorkspaceState'
import usePyMeterState from '@/pymeter/composables/usePyMeterState'
import * as HeadersService from '@/api/script/headers'

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  editMode: { type: String, default: 'QUERY' }
})
const attrs = useAttrs()
const { workspaceNo } = useWorkspaceState()
const { httpHeaderTemplateList } = usePyMeterState()
const rows = ref([])
const showDetails = ref(false)
const queryMode = computed(() => props.editMode === 'QUERY')
const templateNumberList = computed(() => httpHeaderTemplateList.value.map((item) => item.templateNo))
const showWarning = computed(() => {
  for (const templateNo of localModel.value) {
    if (!templateNumberList.value.includes(templateNo)) {
      return true
    }
  }
  return false
})
const localModel = computed({
  get() {
    return attrs.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})

/**
 * 查询请求头模板下的所有请求头
 */
const queryHttpHeaders = () => {
  HeadersService.queryHttpHeaders([...localModel.value]).then((response) => {
    rows.value = response.result
  })
}

/**
 * 选择变更事件
 */
const handleChange = () => {
  nextTick(() => {
    if (!showDetails.value) return
    queryHttpHeaders()
  })
}

const showHeaders = () => {
  queryHttpHeaders()
  showDetails.value = true
}
</script>

<style lang="scss" scoped>
:deep(.el-card__header) {
  user-select: none;
  padding: 5px 10px;
}
</style>
