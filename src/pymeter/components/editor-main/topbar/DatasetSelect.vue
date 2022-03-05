<template>
  <el-select
    v-model="selectedDatasetNumberList"
    multiple
    collapse-tags
    clearable
    size="small"
    placeholder="环境 / 变量"
  >
    <el-option-group v-if="customDatasetList.length > 0" key="custom" label="自定义">
      <el-option
        v-for="item in customDatasetList"
        :key="item.datasetNo"
        :label="item.datasetName"
        :value="item.datasetNo"
      />
    </el-option-group>
    <el-option-group v-if="environmentDatasetList.length > 0" key="environment" label="环境">
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

<script>
import { mapState } from 'vuex'

export default {
  name: 'DatasetSelect',
  props: {
    show: { type: Boolean, default: () => false }
  },
  computed: {
    ...mapState('pymeter', {
      globalDatasetList: (state) => state.globalDatasetList,
      environmentDatasetList: (state) => state.environmentDatasetList,
      customDatasetList: (state) => state.customDatasetList
    }),

    // 当前选中的变量集编号列表
    selectedDatasetNumberList: {
      get() {
        return this.$store.state.pymeter.selectedDatasetNumberList
      },
      set(val) {
        if (this.show) this.$store.dispatch('pymeter/setSelectedDatasetNumberList', val)
      }
    }
  },

  mounted() {
    this.$store.dispatch('pymeter/queryDatasetAll')
  },

  methods: {}
}
</script>

<style lang="scss" scoped>
.el-select {
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
}
</style>
