<template>
  <el-dialog ref="dialog" center destroy-on-close width="50%" :show-close="false" v-bind="$attrs">
    <!-- 顶栏 -->
    <div v-show="selectedDatasetList.length > 0" slot="title" style="display: flex">
      <el-tabs v-model="activeTabNo" type="card" style="flex-grow: 1">
        <el-tab-pane
          v-for="item in selectedDatasetList"
          :key="item.datasetNo"
          :label="item.datasetName"
          :name="item.datasetNo"
        />
      </el-tabs>
      <el-button type="text" icon="el-icon-edit" @click="openVariableDatasetEditor">编辑</el-button>
    </div>

    <!-- 滚动条 -->
    <el-scrollbar
      id="variables-view__scrollbar"
      style="width: 100%; height: 600px"
      wrap-style="overflow-x:auto;"
      view-style="padding: 0 10px 10px 10px;"
    >
      <!-- 变量表格 -->
      <el-table ref="table" :data="rows" fit stripe highlight-current-row>
        <!-- 空表格 -->
        <el-empty slot="empty" />

        <!-- 变量名称 -->
        <el-table-column label="名称" width="auto">
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
            <span style="display: flex; align-items: center; justify-content: space-between">
              <span>当前值</span>
              <el-switch v-model="useCurrentValue" active-color="#13ce66" inactive-color="#ff4949" />
            </span>
          </template>
          <template #default="{ row }">
            <span v-if="row.editing" style="display: flex; flex-direction: column; padding-top: 10px">
              <el-input v-model="row.currentValue" autosize type="textarea" size="mini" :rows="1" />
              <span id="current-value-button" style="display: flex; justify-content: flex-end">
                <el-button type="text" icon="el-icon-close" @click="row.editing = false" />
                <el-button type="text" icon="el-icon-check" @click="updateCurrentValue(row)" />
              </span>
            </span>
            <span v-else style="display: flex; align-items: center; justify-content: space-between">
              <span>{{ row.currentValue || '-' }}</span>
              <el-button type="text" icon="el-icon-edit" @click="$set(row, 'editing', true)" />
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
</template>

<script>
import { mapState } from 'vuex'
import * as VariablesService from '@/api/script/variables'

export default {
  name: 'VariablesDialog',
  data() {
    return {
      activeTabNo: '',
      rows: [],
      backtop: {
        right: 40,
        bottom: 40
      }
    }
  },

  computed: {
    ...mapState('pymeter', {
      globalDatasetList: (state) => state.globalDatasetList,
      environmentDatasetList: (state) => state.environmentDatasetList,
      customDatasetList: (state) => state.customDatasetList,
      selectedDatasetNumberList: (state) => state.selectedDatasetNumberList
    }),
    // 是否使用当前值
    useCurrentValue: {
      get() {
        return this.$store.state.pymeter.useCurrentValue
      },
      set(val) {
        this.$store.commit('pymeter/setUseCurrentValue', val)
      }
    },
    datasetList() {
      return [...this.globalDatasetList, ...this.environmentDatasetList, ...this.customDatasetList]
    },
    selectedDatasetList() {
      return this.datasetList.filter((item) => this.selectedDatasetNumberList.indexOf(item.datasetNo) > -1)
    }
  },

  mounted() {
    // 激活第一个 tab 页
    if (this.selectedDatasetNumberList.length > 0) {
      this.activeTabNo = this.selectedDatasetNumberList[0]
    }
    // 查询第一个变量集
    this.queryVariables()
    // 计算 backtop 位置
    const dialog = this.$refs.dialog.$el.querySelector('.el-dialog')
    this.backtop.right = (document.body.clientWidth - dialog.clientWidth) / 2 + 20
    this.backtop.bottom = document.body.clientHeight - dialog.offsetTop - 40 - 600 - 40
  },

  methods: {
    /**
     * 查询变量集下的所有变量
     */
    queryVariables() {
      if (this.selectedDatasetNumberList.length === 0 || this.activeTabNo === '') return
      VariablesService.queryVariablesByDataset({ datasetNo: this.activeTabNo })
        .then((response) => {
          this.rows = response.result
        })
        .catch(() => {})
    },

    updateCurrentValue(row) {
      if (row.currentValue === row.cache.currentValue) {
        row.editing = false
        return
      }
      VariablesService.updateCurrentValue({ varNo: row.varNo, value: row.currentValue }).then(() => {
        this.queryVariables()
      })
    },
    openVariableDatasetEditor() {
      const dataset = this.datasetList.find((item) => item.datasetNo === this.activeTabNo)
      if (!dataset) return

      this.$emit('update:visible', false)
      this.$store.commit({
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
  }
}
</script>

<style lang="scss" scoped>
:deep(.el-dialog__header) {
  padding: 0;

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

.el-table {
  &::before {
    height: 0;
  }
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
