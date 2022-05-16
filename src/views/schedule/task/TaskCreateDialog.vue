<template>
  <el-dialog title="新增定时任务" width="50%" center @close="$emit('update:model-value', false)">
    <el-form
      ref="elformRef"
      label-width="140px"
      style="width: 100%; padding-right: 30px"
      inline-message
      :model="formData"
      :rules="formRules"
    >
      <el-form-item label="任务名称：" prop="jobName">
        <el-input v-model="formData.jobName" clearable />
      </el-form-item>
      <el-form-item label="任务描述：" prop="jobDesc">
        <el-input v-model="formData.jobDesc" clearable />
      </el-form-item>
      <el-form-item label="任务类型：" prop="jobType">
        <el-radio-group v-model="formData.jobType">
          <el-radio label="TESTPLAN">测试计划</el-radio>
          <el-radio label="COLLECTION">集合元素</el-radio>
          <el-radio label="GROUP">分组元素</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-card shadow="hover" style="width: 100%; margin-bottom: 18px">
        <template v-if="formData.jobType == 'TESTPLAN'">
          <el-form-item label="测试计划：" prop="testplanNo" style="margin-bottom: 10px">
            <el-select v-model="testplanNo" tag-type="danger" filterable>
              <el-option
                v-for="testplan in testplanList"
                :key="testplan.testplanNo"
                :label="testplan.testplanName"
                :value="testplan.testplanNo"
              />
            </el-select>
          </el-form-item>
        </template>
        <template v-else-if="formData.jobType == 'COLLECTION'">
          <el-form-item label="测试集合：" prop="collectionNo" style="margin-bottom: 10px">
            <el-select v-model="collectionNo" tag-type="danger" filterable>
              <el-option
                v-for="collection in collectionList"
                :key="collection.collectionNo"
                :label="collection.collectionName"
                :value="collection.collectionNo"
              />
            </el-select>
          </el-form-item>
        </template>
        <template v-else>
          <div></div>
        </template>
        <el-form-item label="环境/变量：" prop="jobArgs.datasetNumberedList" style="margin-bottom: 10px">
          <TaskDatasetSelect v-model="formData.jobArgs.datasetNumberedList" :workspace-no="workspaceNo" />
        </el-form-item>
        <el-form-item label="使用当前值：" prop="jobArgs.useCurrentValue" style="margin-bottom: 0">
          <el-switch v-model="formData.jobArgs.useCurrentValue" active-color="#13ce66" />
        </el-form-item>
      </el-card>

      <el-form-item label="触发类型：" prop="triggerType">
        <el-radio-group v-model="formData.triggerType">
          <el-radio label="DATE">固定时间</el-radio>
          <el-radio label="INTERVAL">固定间隔</el-radio>
          <el-radio label="CRON">CRON</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-card shadow="hover" style="width: 100%; margin-bottom: 18px">
        <template v-if="formData.triggerType == 'DATE'">
          <el-form-item label="固定时间：" prop="jobArgs.useCurrentValue" style="margin-bottom: 0">
            <el-date-picker v-model="datetime" type="datetime" />
          </el-form-item>
        </template>
        <template v-else-if="formData.triggerType == 'INTERVAL'">
          <div></div>
        </template>
        <template v-else>
          <div></div>
        </template>
      </el-card>

      <el-form-item>
        <el-button type="primary" @click="submitForm()">提 交</el-button>
        <el-button @click="$refs.elformRef.resetFields()">重 置</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import * as ScheduleService from '@/api/schedule/task'
import * as TestplanService from '@/api/script/testplan'
import * as ElementService from '@/api/script/element'
import useWorkspaceState from '@/composables/useWorkspaceState'
import TaskDatasetSelect from './TaskDatasetSelect.vue'

const emit = defineEmits(['update:model-value', 're-query'])
const { workspaceNo } = useWorkspaceState()
const elformRef = ref()
const formData = ref({
  workspaceNo: workspaceNo.value,
  jobName: '',
  jobDesc: '',
  jobType: 'TESTPLAN',
  jobArgs: {
    datasetNumberedList: [],
    useCurrentValue: false
  },
  triggerType: 'CRON',
  triggerArgs: {}
})
const formRules = reactive({
  jobName: [{ required: true, message: '任务名称不能为空', trigger: 'blur' }],
  jobType: [{ required: true, message: '任务类型不能为空', trigger: 'blur' }],
  triggerType: [{ required: true, message: '触发类型不能为空', trigger: 'blur' }],
  testplanNo: [{ required: true, message: '测试计划不能为空', trigger: 'blur' }],
  collectionNo: [{ required: true, message: '集合元素不能为空', trigger: 'blur' }],
  selectedGroupNumberedList: [{ required: true, message: '分组元素不能为空', trigger: 'blur' }],
  'jobArgs.datasetNumberedList': [{ required: true, message: '测试环境不能为空', trigger: 'blur' }]
})
const testplanList = ref([])
const collectionList = ref([])
const groupList = ref([])
const testplanNo = ref([])
const collectionNo = ref([])
const groupNo = ref([])
const datetime = ref('')
const interval = ref({})
const cron = ref({})

watch(
  () => formData.value.jobType,
  (val) => {
    console.log('formData.jobType: ', val)
    if (val === 'TESTPLAN') {
      queryTestplanAll()
    } else if (val === 'COLLECTION') {
      queryCollectionAll()
    } else {
      queryGroupAll()
    }
  }
)

const queryTestplanAll = () => {
  TestplanService.queryTestplanAll({
    workspaceNo: workspaceNo.value,
    stateList: ['INITIAL', 'TESTING']
  }).then((response) => {
    testplanList.value = response.result
  })
}

const queryCollectionAll = () => {
  ElementService.queryCollectionAll({
    workspaceNo: workspaceNo.value,
    elementClass: 'TestCollection',
    enabled: true
  }).then((response) => {
    collectionList.value = response.result
  })
}

const queryGroupAll = () => {
  ElementService.queryGroupAll({ workspaceNo: workspaceNo.value }).then((response) => {
    groupList.value = response.result
  })
}

/**
 * 提交表单
 */
const submitForm = async () => {
  // 表单校验
  const error = await elformRef.value
    .validate()
    .then(() => false)
    .catch(() => false)
  if (error) {
    ElMessage({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
    return
  }
  // 创建任务
  await ScheduleService.createTask(formData.value)
  // 成功提示
  ElMessage({ message: '新增成功', type: 'info', duration: 2 * 1000 })
  // 关闭dialog
  emit('update:model-value', false)
  // 重新查询列表
  emit('re-query')
}
</script>

<style lang="scss" scoped></style>
