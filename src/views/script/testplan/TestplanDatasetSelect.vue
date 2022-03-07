<template>
  <el-form label-position="right" label-width="110px" style="width: 100%" :model="formModel" :rules="formRules">
    <el-form-item label="当前测试阶段：">
      <b style="color: #f56c6c">{{ testPhase }}</b>
    </el-form-item>

    <!-- 环境/变量 -->
    <el-form-item label="环境/变量：" prop="datasetNumberList">
      <!-- 变量选择下拉框 -->
      <el-select
        v-model="formModel.datasetNumberList"
        placeholder="环境 / 变量"
        tag-type="danger"
        effect="dark"
        style="width: 100%"
        multiple
        v-bind="$attrs"
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
    </el-form-item>
    <!-- 是否使用当前值 -->
    <el-form-item label="使用当前值：" prop="useCurrentValue" style="margin-bottom: 0">
      <el-switch v-model="formModel.useCurrentValue" active-color="#13ce66" />
    </el-form-item>
  </el-form>
</template>

<script setup>
import { isEmpty } from 'lodash-es'
import * as VariablesService from '@/api/script/variables'
</script>

<script>
export default {
  name: 'TestplanDatasetSelect',

  props: {
    workspaceNo: { type: String, required: true },
    testPhase: { type: String, required: true }
  },

  emits: ['change-dataset-number-list', 'change-use-current-value'],

  data() {
    return {
      globalDatasetList: [],
      environmentDatasetList: [],
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
    },
    'formModel.datasetNumberList'(val) {
      // 没有选中任何变量集时，开放所有环境变量集
      if (val.length === 0) {
        this.environmentDatasetList.forEach((env) => {
          env.disabled = false
        })
      }
      // 判断当前选中的变量集是否需要禁用
      val.forEach((datasetNo) => {
        const index = this.environmentDatasetList.findIndex((item) => item.datasetNo === datasetNo)
        // 已经选择了环境变量集，禁用其余环境变量集
        if (index > -1) {
          this.environmentDatasetList.forEach((env) => {
            env.disabled = env.datasetNo !== datasetNo
          })
          // 没有选择环境变量集时，开放所有环境变量集
        } else {
          this.environmentDatasetList.forEach((env) => {
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
      this.globalDatasetList = (await VariablesService.queryVariableDatasetAll({ datasetType: 'GLOBAL' })).result
      this.environmentDatasetList = (
        await VariablesService.queryVariableDatasetAll({ workspaceNo: this.workspaceNo, datasetType: 'ENVIRONMENT' })
      ).result
      this.customDatasetList = (
        await VariablesService.queryVariableDatasetAll({ workspaceNo: this.workspaceNo, datasetType: 'CUSTOM' })
      ).result
    }
  }
}
</script>

<style lang="scss" scoped></style>
