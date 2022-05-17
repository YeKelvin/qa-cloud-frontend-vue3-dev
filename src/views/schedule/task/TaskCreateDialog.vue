<template>
  <el-dialog title="新增定时任务" width="50%" center @close="$emit('update:model-value', false)">
    <el-form
      ref="jobformRef"
      label-width="120px"
      style="width: 100%; padding-right: 30px"
      inline-message
      :model="jobForm"
      :rules="jobFormRules"
    >
      <el-form-item label="任务名称：" prop="jobName" style="padding: 0 10px">
        <el-input v-model="jobForm.jobName" clearable />
      </el-form-item>
      <el-form-item label="任务描述：" prop="jobDesc" style="padding: 0 10px">
        <el-input v-model="jobForm.jobDesc" clearable />
      </el-form-item>
      <el-form-item label="任务类型：" prop="jobType" style="padding: 0 10px">
        <el-radio-group v-model="jobForm.jobType">
          <el-radio label="TESTPLAN">测试计划</el-radio>
          <el-radio label="COLLECTION">集合元素</el-radio>
          <el-radio label="GROUP" disabled>分组元素</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-card shadow="hover" style="width: 100%; margin-bottom: 18px">
        <el-form
          ref="taskformRef"
          label-width="120px"
          style="width: 100%"
          inline-message
          :model="taskForm"
          :rules="taskFormRules"
        >
          <template v-if="jobForm.jobType == 'TESTPLAN'">
            <el-form-item label="测试计划：" prop="testplanNo" style="margin-bottom: 10px">
              <el-select v-model="taskForm.testplanNo" tag-type="danger" style="width: 100%" filterable>
                <el-option
                  v-for="testplan in testplanList"
                  :key="testplan.planNo"
                  :label="testplan.planName"
                  :value="testplan.planNo"
                />
              </el-select>
            </el-form-item>
          </template>
          <template v-else-if="jobForm.jobType == 'COLLECTION'">
            <el-form-item label="测试集合：" prop="collectionNo" style="margin-bottom: 10px">
              <el-select v-model="taskForm.collectionNo" tag-type="danger" style="width: 100%" filterable>
                <el-option
                  v-for="collection in collectionList"
                  :key="collection.elementNo"
                  :label="collection.elementName"
                  :value="collection.elementNo"
                />
              </el-select>
            </el-form-item>
          </template>
          <template v-else>
            <div></div>
          </template>
        </el-form>
        <el-form-item label="环境/变量：" prop="jobArgs.datasetNumberedList" style="margin-bottom: 10px">
          <TaskDatasetSelect v-model="jobForm.jobArgs.datasetNumberedList" :workspace-no="workspaceNo" />
        </el-form-item>
        <el-form-item label="使用当前值：" prop="jobArgs.useCurrentValue" style="margin-bottom: 0">
          <el-switch v-model="jobForm.jobArgs.useCurrentValue" active-color="#13ce66" />
        </el-form-item>
      </el-card>

      <el-form-item label="触发类型：" prop="triggerType" style="padding: 0 10px">
        <el-radio-group v-model="jobForm.triggerType">
          <el-radio label="DATE">固定时间</el-radio>
          <el-radio label="INTERVAL">固定间隔</el-radio>
          <el-radio label="CRON">CRON</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-card shadow="hover" style="width: 100%; margin-bottom: 18px">
        <el-form
          ref="triggerformRef"
          label-width="120px"
          style="width: 100%"
          inline-message
          :model="triggerForm"
          :rules="triggerFormRules"
        >
          <template v-if="jobForm.triggerType == 'DATE'">
            <el-form-item label="固定时间：" prop="date.datetime" style="margin-bottom: 0">
              <el-date-picker
                v-model="triggerForm.date.datetime"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                :disabled-date="(time) => time.getTime() < Date.now() - 1 * 24 * 3600 * 1000"
                :disabled-hours="() => makeRange(0, 0)"
                :disabled-minutes="(hour) => makeRange(0, 0)"
                :disabled-seconds="(hour, minute) => makeRange(0, 0)"
              />
            </el-form-item>
          </template>
          <template v-else-if="jobForm.triggerType == 'INTERVAL'">
            <el-form-item label="开始-结束：" prop="interval.datetimerange">
              <el-date-picker
                v-model="triggerForm.interval.datetimerange"
                type="datetimerange"
                range-separator="-"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
              />
            </el-form-item>
            <el-form-item label="周：" prop="interval.weeks">
              <el-input v-model="triggerForm.interval.weeks" clearable />
            </el-form-item>
            <el-form-item label="日：" prop="interval.days">
              <el-input v-model="triggerForm.interval.days" clearable />
            </el-form-item>
            <el-form-item label="时：" prop="interval.hours" style="margin-bottom: 0">
              <el-input v-model="triggerForm.interval.hours" clearable />
            </el-form-item>
          </template>
          <template v-else>
            <el-form-item label="开始-结束：" prop="cron.datetimerange">
              <el-date-picker
                v-model="triggerForm.cron.datetimerange"
                type="datetimerange"
                range-separator="-"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
              />
            </el-form-item>
            <el-form-item label="年：" prop="cron.year">
              <el-input v-model="triggerForm.interval.year" clearable />
            </el-form-item>
            <el-form-item label="月：" prop="cron.month">
              <el-input v-model="triggerForm.interval.month" clearable />
            </el-form-item>
            <el-form-item label="日：" prop="cron.day">
              <el-input v-model="triggerForm.interval.day" clearable />
            </el-form-item>
            <el-form-item label="周：" prop="cron.week">
              <el-input v-model="triggerForm.interval.week" clearable />
            </el-form-item>
            <el-form-item label="星期：" prop="cron.day_of_week">
              <el-input v-model="triggerForm.interval.day_of_week" clearable />
            </el-form-item>
            <el-form-item label="小时：" prop="cron.hour" style="margin-bottom: 0">
              <el-input v-model="triggerForm.interval.hour" clearable />
            </el-form-item>
          </template>
        </el-form>
      </el-card>

      <el-form-item>
        <el-button type="primary" @click="submitForm()">提 交</el-button>
        <el-button @click="resetFields">重 置</el-button>
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
const jobformRef = ref()
const jobForm = ref({
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
const jobFormRules = reactive({
  jobName: [{ required: true, message: '任务名称不能为空', trigger: 'blur' }],
  jobType: [{ required: true, message: '任务类型不能为空', trigger: 'blur' }],
  triggerType: [{ required: true, message: '触发类型不能为空', trigger: 'blur' }],
  'jobArgs.datasetNumberedList': [{ required: true, message: '测试环境不能为空', trigger: 'blur' }]
})
const testplanList = ref([])
const collectionList = ref([])
const groupList = ref([])
const taskformRef = ref()
const taskForm = ref({
  testplanNo: '',
  collectionNo: '',
  groupNo: ''
})
const taskFormRules = reactive({
  testplanNo: [{ required: true, message: '测试计划不能为空', trigger: 'blur' }],
  collectionNo: [{ required: true, message: '集合元素不能为空', trigger: 'blur' }],
  groupNo: [{ required: true, message: '分组元素不能为空', trigger: 'blur' }]
})
const triggerformRef = ref()
const triggerForm = ref({
  date: {
    datetime: ''
  },
  interval: {
    datetimerange: [],
    weeks: '',
    days: '',
    hours: '',
    minutes: '',
    seconds: '',
    start_date: '',
    end_date: ''
  },
  cron: {
    datetimerange: [],
    year: '',
    month: '',
    day: '',
    week: '',
    day_of_week: '',
    hour: '',
    minute: '',
    second: '',
    start_date: '',
    end_date: ''
  }
})
const triggerFormRules = reactive({
  'date.datetime': [{ required: true, message: '时间不能为空', trigger: 'blur' }]
})
const requestData = computed(() => {
  if (jobForm.value.jobType === 'TESTPLAN') {
    jobForm.value.jobArgs.testplanNo = taskForm.value.testplanNo
  } else if (jobForm.value.jobType === 'COLLECTION') {
    jobForm.value.jobArgs.collectionNo = taskForm.value.collectionNo
  } else {
    jobForm.value.jobArgs.groupNo = taskForm.value.groupNo
  }

  if (jobForm.value.triggerType === 'DATE') {
    jobForm.value.triggerArgs = triggerForm.value.date
  } else if (jobForm.value.triggerType === 'INTERVAL') {
    jobForm.value.triggerArgs = triggerForm.value.interval
  } else {
    jobForm.value.triggerArgs = triggerForm.value.cron
  }

  return jobForm.value
})

watch(
  () => jobForm.value.jobType,
  (val) => {
    if (val === 'TESTPLAN') {
      queryTestplanAll()
    } else if (val === 'COLLECTION') {
      queryCollectionAll()
    } else {
      queryGroupAll()
    }
  }
)

onMounted(() => {
  if (jobForm.value.jobType === 'TESTPLAN') {
    queryTestplanAll()
  } else if (jobForm.value.jobType === 'COLLECTION') {
    queryCollectionAll()
  } else {
    queryGroupAll()
  }
})

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
  const jobFormError = await jobformRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  // 表单校验
  const taskFormError = await taskformRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  // 表单校验
  const triggerFormError = await triggerformRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  if (jobFormError || taskFormError || triggerFormError) {
    ElMessage({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
    return
  }
  // 创建任务
  // await ScheduleService.createTask(requestData.value)
  console.log('requestData.value: ', requestData.value)
  // 成功提示
  ElMessage({ message: '新增成功', type: 'info', duration: 2 * 1000 })
  // 关闭dialog
  emit('update:model-value', false)
  // 重新查询列表
  emit('re-query')
}

/**
 * 清空表单
 */
const resetFields = () => {
  jobformRef.value.resetFields()
  taskformRef.value.resetFields()
  triggerformRef.value.resetFields()
}

const makeRange = (start, end) => {
  const result = []
  for (let i = start; i <= end; i++) {
    result.push(i)
  }
  return result
}
</script>

<style lang="scss" scoped></style>
