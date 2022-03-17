<template>
  <div id="topbar-variables-dialog">
    <el-dialog width="60%" :show-close="false" center v-bind="$attrs" @close="$emit('update:model-value', false)">
      <!-- 顶栏 -->
      <template #title>
        <div v-show="!_isEmpty(selectedDatasetList)" style="display: flex">
          <el-tabs v-model="activeTabNo" type="card" style="flex-grow: 1">
            <el-tab-pane
              v-for="item in selectedDatasetList"
              :key="item.datasetNo"
              :label="item.datasetName"
              :name="item.datasetNo"
            />
          </el-tabs>
          <el-button type="text" :icon="Edit" @click="openVariableDatasetEditor()">批量编辑</el-button>
        </div>
      </template>

      <el-input v-model="filterText" style="padding: 10px" placeholder="请输入" />

      <!-- 滚动条 -->
      <el-scrollbar
        id="variables-view__scrollbar"
        style="width: 100%; height: 600px"
        wrap-style="overflow-x:auto;"
        view-style="padding: 0 10px 10px 10px;"
      >
        <!-- 变量表格 -->
        <el-table :data="filteredTableData" fit stripe highlight-current-row>
          <!-- 空表格 -->
          <template #empty><el-empty /></template>

          <!-- 变量名称 -->
          <el-table-column label="变量名称" width="auto">
            <template #default="{ row }">
              <span>{{ row.varName }}</span>
            </template>
          </el-table-column>

          <!-- 初始值 -->
          <el-table-column label="初始值" width="auto">
            <template #default="{ row }">
              <span>{{ row.initialValue }}</span>
            </template>
          </el-table-column>

          <!-- 当前值 -->
          <el-table-column label="当前值" width="auto">
            <template #header="{}">
              <span class="current-value-header">
                <span>当前值</span>
                <el-switch v-model="useCurrentValue" size="small" active-color="#67C23A" inactive-color="#F56C6C" />
              </span>
            </template>
            <template #default="{ row }">
              <span v-if="row.editing" class="current-value-item__editing">
                <el-input v-model="row.currentValue" autosize type="textarea" size="small" :rows="1" />
                <span id="current-value-button" style="display: flex; justify-content: flex-end">
                  <el-button type="text" :icon="Close" @click="row.editing = false" />
                  <el-button type="text" :icon="Check" @click="updateCurrentValue(row)" />
                </span>
              </span>
              <span v-else class="current-value-item">
                <span>{{ row.currentValue || '-' }}</span>
                <el-button type="text" :icon="Edit" @click="row.editing = true" />
              </span>
            </template>
          </el-table-column>
        </el-table>
      </el-scrollbar>
      <!-- 回到顶部按钮 -->
      <el-backtop
        target="#variables-view__scrollbar .el-scrollbar__wrap"
        :right="backtop.right"
        :bottom="backtop.bottom"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { isEmpty as _isEmpty } from 'lodash-es'
import { Check, Close, Edit } from '@element-plus/icons-vue'
import { isBlank } from '@/utils/string-util'
import * as VariablesService from '@/api/script/variables'
import usePyMeterState from '@/pymeter/composables/usePyMeterState'

const emit = defineEmits(['update:model-value'])
const store = useStore()
const activeTabNo = ref('')
const rows = ref([])
const backtop = reactive({
  right: 40,
  bottom: 40
})
const filterText = ref('')
const filteredTableData = computed(() => {
  if (isBlank(filterText.value)) {
    return rows.value
  } else {
    return rows.value.filter(
      (item) =>
        item.varName.indexOf(filterText.value.trim()) !== -1 ||
        item.initialValue.indexOf(filterText.value.trim()) !== -1 ||
        item.currentValue.indexOf(filterText.value.trim()) !== -1
    )
  }
})
const { datasetList, selectedDatasetNumberList } = usePyMeterState()
const selectedDatasetList = computed(() =>
  datasetList.value.filter((item) => selectedDatasetNumberList.value.indexOf(item.datasetNo) > -1)
)
const useCurrentValue = computed({
  get() {
    return store.state.pymeter.useCurrentValue
  },
  set(val) {
    store.commit('pymeter/setUseCurrentValue', val)
  }
})

watch(activeTabNo, () => {
  queryVariables()
})

onMounted(() => {
  // 激活第一个 tab 页
  if (!_isEmpty(selectedDatasetNumberList.value)) {
    activeTabNo.value = selectedDatasetNumberList.value[0]
  }
  // 查询第一个变量集
  queryVariables()
  // 计算 backtop 位置
  nextTick(() => {
    const dialog = document.querySelector('#topbar-variables-dialog').querySelector('.el-dialog')
    backtop.right = (document.body.clientWidth - dialog.clientWidth) / 2 + 20
    backtop.bottom = document.body.clientHeight - dialog.offsetTop - 40 - 600 - 40
  })
})

/**
 * 查询变量集下的所有变量
 */
const queryVariables = () => {
  if (_isEmpty(selectedDatasetNumberList.value) || activeTabNo.value === '') return
  VariablesService.queryVariablesByDataset({ datasetNo: activeTabNo.value }).then((response) => {
    rows.value = response.result
  })
}

/**
 * 更新变量的当前值
 */
const updateCurrentValue = (row) => {
  if (row.currentValue === row.cache.currentValue) {
    row.editing = false
    return
  }
  VariablesService.updateCurrentValue({ varNo: row.varNo, value: row.currentValue }).then(() => {
    queryVariables()
  })
}

/**
 * 打开变量集组件
 */
const openVariableDatasetEditor = () => {
  const dataset = datasetList.value.find((item) => item.datasetNo === activeTabNo.value)
  if (!dataset) return

  emit('update:model-value', false)
  store.commit({
    type: 'pymeter/addTab',
    editorNo: dataset.datasetNo,
    editorName: dataset.datasetName,
    editorComponent: 'VariableDataset',
    editorMode: 'QUERY',
    metadata: {
      datasetName: dataset.datasetName,
      datasetType: dataset.datasetType,
      datasetDesc: dataset.datasetDesc
    }
  })
}
</script>

<style lang="scss" scoped>
.el-table {
  &::before {
    height: 0;
  }
}

.current-value-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.current-value-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.current-value-item__editing {
  display: flex;
  flex-direction: column;
  padding-top: 10px;
}

:deep(.el-dialog__header) {
  padding: 0;
  margin-right: 0;

  .el-tabs__header {
    margin: 0;
  }

  .el-button--text {
    height: 40px;
    padding: 0 20px;
    border-bottom: 1px solid #e4e7ed;
  }
}

:deep(.el-dialog__body) {
  padding: 0;
  padding-bottom: 50px;
}

:deep(.el-table td, .el-table th) {
  padding: 0;
}

#current-value-button {
  .el-button--text {
    height: 30px;
    padding: 0;
  }
}
</style>
