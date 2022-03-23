<template>
  <el-select
    v-model="selectedDatasetNumberList"
    placeholder="环境 / 变量"
    tag-type="danger"
    multiple
    collapse-tags
    collapse-tags-tooltip
    clearable
  >
    <el-option-group v-if="!isEmpty(customDatasetList)" key="custom" label="自定义">
      <el-option
        v-for="item in customDatasetList"
        :key="item.datasetNo"
        :label="item.datasetName"
        :value="item.datasetNo"
      />
    </el-option-group>
    <el-option-group v-if="!isEmpty(environmentDatasetList)" key="environment" label="环境">
      <el-option
        v-for="item in environmentDatasetList"
        :key="item.datasetNo"
        :label="item.datasetName"
        :value="item.datasetNo"
        :disabled="item.disabled"
      />
    </el-option-group>

    <el-option-group key="global" label="全局">
      <el-option
        v-for="item in globalDatasetList"
        :key="item.datasetNo"
        :label="item.datasetName"
        :value="item.datasetNo"
      />
    </el-option-group>
  </el-select>
</template>

<script setup>
import { isEmpty } from 'lodash-es'
import usePyMeterState from '@/pymeter/composables/usePyMeterState'

const props = defineProps({
  show: { type: Boolean, default: () => false }
})

const { globalDatasetList, environmentDatasetList, customDatasetList } = usePyMeterState()
const store = useStore()
const selectedDatasetNumberList = computed({
  get() {
    return store.state.pymeter.selectedDatasetNumberList
  },
  set(val) {
    if (props.show) store.dispatch('pymeter/setSelectedDatasetNumberList', val)
  }
})

onMounted(() => {
  store.dispatch('pymeter/queryDatasetAll')
})
</script>

<style lang="scss" scoped>
.el-select {
  --el-select-border-color-hover: none;
  --el-select-input-focus-border-color: none;

  :deep(.el-select__tags-text) {
    display: inline-block;
    max-width: 100px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  :deep(.el-tag__close) {
    display: none;
  }
}

:deep(.el-select-dropdown__item span) {
  padding-right: 10px;
}

:deep(.el-input__inner) {
  border: 0;
  border-radius: 0;
  box-shadow: none;
}
</style>
