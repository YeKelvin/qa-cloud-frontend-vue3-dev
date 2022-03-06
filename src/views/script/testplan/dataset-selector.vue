<template>
  <el-form
    label-position="right"
    label-width="auto"
    style="width: 100%"
    size="small"
    :model="formModel"
    :rules="formRules"
  >

    <el-form-item label="当前测试阶段："><b style="color: #f56c6c;">{{ testPhase }}</b></el-form-item>

    <!-- 环境/变量 -->
    <el-form-item label="环境/变量：" prop="datasetNumberList">
      <!-- 变量选择下拉框 -->
      <el-select
        v-model="formModel.datasetNumberList"
        multiple
        size="small"
        placeholder="环境 / 变量"
        style="width:100%"
        v-bind="$attrs"
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
    </el-form-item>
    <!-- 是否使用当前值 -->
    <el-form-item label="使用当前值：" prop="useCurrentValue" style="margin-bottom:0;">
      <el-switch v-model="formModel.useCurrentValue" active-color="#13ce66" />
    </el-form-item>
  </el-form>
</template>

<script>
import * as VariablesService from '@/api/script/variables'

export default {

  name: 'DatasetSelector',

  props: {
    workspaceNo: { type: String, required: true },
    testPhase: { type: String, required: true }
  },

  data() {
    return {
      // 全局变量集列表
      globalDatasetList: [],
      // 环境变量集列表
      environmentDatasetList: [],
      // 自定义变量集列表
      customDatasetList: [],
      formModel: {
        datasetNumberList: [],
        useCurrentValue: false
      },
      formRules: {
        datasetNumberList: [{ required: true, message: '测试环境不能为空', trigger: 'blur' }]
      }
    }
  },

  watch: {
    workspaceNo() {
      // 重新查询变量集
      this.queryDatasetALL()
      // 清空已选择的变量集
      this.localModelValue = []
    },
    'formModel.datasetNumberList'(val) {
      // 没有选中任何变量集时，开放所有环境变量集
      if (val.length === 0) {
        this.environmentDatasetList.forEach(env => {
          env.disabled = false
        })
      }
      // 判断当前选中的变量集是否需要禁用
      val.forEach(datasetNo => {
        const index = this.environmentDatasetList.findIndex(item => item.datasetNo === datasetNo)
        // 已经选择了环境变量集，禁用其余环境变量集
        if (index > -1) {
          this.environmentDatasetList.forEach(env => {
            env.disabled = env.datasetNo !== datasetNo
          })
          // 没有选择环境变量集时，开放所有环境变量集
        } else {
          this.environmentDatasetList.forEach(env => {
            env.disabled = false
          })
        }
      })

      this.$emit('change-dataset-number-list', val)
    },
    'formModel.useCurrentValue'(val) {
      this.$emit('change-use-current-value', val)
    }
  },

  mounted() {
    this.queryDatasetALL()
  },

  methods: {
    /**
     * 查询所有数据集列表
     */
    async queryDatasetALL() {
      // 查询变量集列表
      this.globalDatasetList = (
        await VariablesService.queryVariableDatasetAll({ datasetType: 'GLOBAL' })).result
      this.environmentDatasetList = (
        await VariablesService.queryVariableDatasetAll({ workspaceNo: this.workspaceNo, datasetType: 'ENVIRONMENT' })).result
      this.customDatasetList = (
        await VariablesService.queryVariableDatasetAll({ workspaceNo: this.workspaceNo, datasetType: 'CUSTOM' })).result
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
