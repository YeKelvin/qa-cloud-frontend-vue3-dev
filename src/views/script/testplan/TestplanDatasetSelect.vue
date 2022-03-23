<template>
  <el-form label-position="right" label-width="110px" style="width: 100%" :model="formData" :rules="formRules">
    <el-form-item label="当前测试阶段：">
      <b style="color: #f56c6c">{{ testPhase }}</b>
    </el-form-item>

    <!-- 环境/变量 -->
    <el-form-item label="环境/变量：" prop="datasetNumberList">
      <!-- 变量选择下拉框 -->
      <el-select
        v-model="formData.datasetNumberList"
        placeholder="环境 / 变量"
        tag-type="danger"
        style="width: 100%"
        multiple
        v-bind="$attrs"
      >
        <el-option-group v-if="!_isEmpty(customDatasetList)" key="custom" label="自定义">
          <el-option
            v-for="item in customDatasetList"
            :key="item.datasetNo"
            :label="item.datasetName"
            :value="item.datasetNo"
          />
        </el-option-group>
        <el-option-group v-if="!_isEmpty(environmentDatasetList)" key="environment" label="环境">
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
      <el-switch v-model="formData.useCurrentValue" active-color="#13ce66" />
    </el-form-item>
  </el-form>
</template>

<script setup>
import { isEmpty as _isEmpty } from 'lodash-es'
import * as VariablesService from '@/api/script/variables'

const emit = defineEmits(['change-dataset-number-list', 'change-use-current-value'])
const props = defineProps({
  workspaceNo: { type: String, required: true },
  testPhase: { type: String, required: true }
})
const globalDatasetList = ref([])
const environmentDatasetList = ref([])
const customDatasetList = ref([])
const formData = reactive({
  datasetNumberList: [],
  useCurrentValue: false
})
const formRules = reactive({
  datasetNumberList: [{ required: true, message: '测试环境不能为空', trigger: 'blur' }]
})

watch(
  () => formData.datasetNumberList,
  () => {
    // 没有选中任何变量集时，开放所有环境变量集
    if (_isEmpty(formData.datasetNumberList)) {
      environmentDatasetList.value.forEach((env) => (env.disabled = false))
    }
    // 判断当前选中的变量集是否需要禁用
    let environmentCount = 0
    formData.datasetNumberList.forEach((datasetNo) => {
      if (isGlobal(datasetNo) || isCustom(datasetNo)) return
      // 已经选择了环境变量集，禁用其余环境变量集
      if (isEnvironment(datasetNo)) {
        environmentCount += 1
        environmentDatasetList.value.forEach((env) => (env.disabled = env.datasetNo !== datasetNo))
      }
    })
    // 没有选择环境变量集时，开放所有环境变量集
    if (environmentCount === 0) {
      environmentDatasetList.value.forEach((env) => (env.disabled = false))
    }
    emit('change-dataset-number-list', formData.datasetNumberList)
  }
)
watch(
  () => formData.useCurrentValue,
  () => emit('change-use-current-value', formData.useCurrentValue)
)

onMounted(() => {
  queryDatasetALL()
})

const isGlobal = (datasetNo) => {
  const index = globalDatasetList.value.findIndex((item) => item.datasetNo === datasetNo)
  return index > -1
}
const isEnvironment = (datasetNo) => {
  const index = environmentDatasetList.value.findIndex((item) => item.datasetNo === datasetNo)
  return index > -1
}
const isCustom = (datasetNo) => {
  const index = customDatasetList.value.findIndex((item) => item.datasetNo === datasetNo)
  return index > -1
}

/**
 * 查询全局变量集
 */
const queryDatasetByGlobal = async () => {
  return (await VariablesService.queryVariableDatasetAll({ datasetType: 'GLOBAL' })).result
}

/**
 * 查询环境变量集
 */
const queryDatasetByEnvironment = async () => {
  return (
    await VariablesService.queryVariableDatasetAll({
      workspaceNo: props.workspaceNo,
      datasetType: 'ENVIRONMENT'
    })
  ).result
}

/**
 * 查询自定义变量集
 */
const queryDatasetByCustom = async () => {
  return (
    await VariablesService.queryVariableDatasetAll({
      workspaceNo: props.workspaceNo,
      datasetType: 'CUSTOM'
    })
  ).result
}

/**
 * 查询所有变量集
 */
const queryDatasetALL = async () => {
  globalDatasetList.value = await queryDatasetByGlobal()
  environmentDatasetList.value = await queryDatasetByEnvironment()
  customDatasetList.value = await queryDatasetByCustom()
}
</script>

<style lang="scss" scoped></style>
