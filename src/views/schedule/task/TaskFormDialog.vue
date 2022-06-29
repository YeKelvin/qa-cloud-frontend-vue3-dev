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
        <el-input v-model="jobForm.jobName" clearable :readonly="queryMode" />
      </el-form-item>
      <el-form-item label="任务描述：" prop="jobDesc" style="padding: 0 10px">
        <el-input v-model="jobForm.jobDesc" clearable :readonly="queryMode" />
      </el-form-item>
      <el-form-item label="任务类型：" prop="jobType" style="padding: 0 10px">
        <el-radio-group v-model="jobForm.jobType" :disabled="queryMode">
          <el-radio label="TESTPLAN">测试计划</el-radio>
          <el-radio label="COLLECTION">集合元素</el-radio>
          <el-radio label="GROUP">分组元素</el-radio>
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
            <el-form-item label="测试计划：" prop="planNo" style="margin-bottom: 10px">
              <el-select
                v-model="taskForm.planNo"
                tag-type="danger"
                style="width: 100%"
                filterable
                :disabled="queryMode"
              >
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
              <el-select
                v-model="taskForm.collectionNo"
                tag-type="danger"
                style="width: 100%"
                filterable
                :disabled="queryMode"
              >
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
            <el-form-item label="测试分组：" prop="groupNo" style="margin-bottom: 10px">
              <el-cascader
                v-model="taskForm.groupNo"
                tag-type="danger"
                style="width: 100%"
                clearable
                filterable
                :filter-method="cascaderFilter"
                :options="groupList"
                :props="{ value: 'elementNo', label: 'elementName', children: 'children' }"
                :disabled="queryMode"
              />
            </el-form-item>
          </template>
        </el-form>
        <el-form-item label="环境/变量：" prop="jobArgs.datasetNumberedList" style="margin-bottom: 10px">
          <DatasetSelect
            v-model="jobForm.jobArgs.datasetNumberedList"
            :workspace-no="workspaceNo"
            :disabled="queryMode"
          />
        </el-form-item>
        <el-form-item label="使用当前值：" prop="jobArgs.useCurrentValue" style="margin-bottom: 0">
          <el-switch v-model="jobForm.jobArgs.useCurrentValue" active-color="#13ce66" :disabled="queryMode" />
        </el-form-item>
      </el-card>

      <el-form-item label="触发类型：" prop="triggerType" style="padding: 0 10px">
        <el-radio-group v-model="jobForm.triggerType" :disabled="queryMode">
          <el-radio label="DATE">固定时间</el-radio>
          <el-radio label="INTERVAL">固定间隔</el-radio>
          <el-radio label="CRON">CRON间隔</el-radio>
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
                :disabled-hours="disabledHours"
                :disabled-minutes="disabledMinutes"
                :disabled-seconds="disabledSeconds"
                :disabled="queryMode"
              />
            </el-form-item>
          </template>
          <template v-else-if="jobForm.triggerType == 'INTERVAL'">
            <el-form-item label="开始-结束：">
              <el-date-picker
                v-model="intervalDatetimeRange"
                type="datetimerange"
                range-separator="-"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                :default-time="[new Date(0, 0, 0, 0, 0, 0), new Date(0, 0, 0, 23, 59, 59)]"
                :disabled-date="(time) => time.getTime() < Date.now() - 1 * 24 * 3600 * 1000"
                :disabled-hours="disabledHours"
                :disabled-minutes="disabledMinutes"
                :disabled-seconds="disabledSeconds"
                :disabled="queryMode"
                @change="datetimeRangeChange"
              />
            </el-form-item>
            <el-form-item label="固定间隔：" prop="interval.value">
              <el-input v-model="triggerForm.interval.value">
                <template #prepend>
                  <el-select v-model="triggerForm.interval.type" style="width: 115px">
                    <el-option label="周" value="weeks" />
                    <el-option label="天" value="days" />
                    <el-option label="时" value="hours" />
                    <el-option label="分" value="minutes" />
                  </el-select>
                </template>
              </el-input>
            </el-form-item>
          </template>
          <template v-else>
            <el-form-item prop="cron.crontab">
              <template #label>
                <span>crontab：</span>
                <el-tooltip trigger="click" effect="light" placement="right-end">
                  <template #content>
                    <CrontabIntroduce />
                  </template>
                  <SvgIcon icon-name="common-question" />
                </el-tooltip>
              </template>
              <el-input v-model="triggerForm.cron.crontab" clearable :readonly="queryMode" />
            </el-form-item>
          </template>
        </el-form>
      </el-card>

      <el-form-item v-if="createMode || modifyMode">
        <el-button type="primary" @click="submitForm()">提 交</el-button>
        <el-button @click="resetFields">重 置</el-button>
      </el-form-item>
      <el-form-item v-else>
        <el-button @click="$emit('update:model-value', false)">关 闭</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { isValidCron } from 'cron-validator'
import { isEmpty as _isEmpty, omit as _omit } from 'lodash-es'
import * as ScheduleService from '@/api/schedule/task'
import * as TestplanService from '@/api/script/testplan'
import * as ElementService from '@/api/script/element'
import dayjs from 'dayjs'
import useWorkspaceState from '@/composables/useWorkspaceState'
import DatasetSelect from './TaskDatasetSelect.vue'
import CrontabIntroduce from './TaskCrontabIntroduce.vue'

const emit = defineEmits(['update:model-value', 're-query'])
const props = defineProps({
  editMode: { type: String, required: true },
  data: { type: Object, default: () => {} }
})
const { workspaceNo } = useWorkspaceState()
const queryMode = computed(() => props.editMode === 'QUERY')
const modifyMode = computed(() => props.editMode === 'MODIFY')
const createMode = computed(() => props.editMode === 'CREATE')
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
  triggerType: [{ required: true, message: '触发类型不能为空', trigger: 'blur' }]
})
const testplanList = ref([])
const collectionList = ref([])
const groupList = ref([])
const taskformRef = ref()
const taskForm = ref({
  planNo: '',
  collectionNo: '',
  groupNo: ''
})
const taskFormRules = reactive({
  planNo: [{ required: true, message: '测试计划不能为空', trigger: 'blur' }],
  collectionNo: [{ required: true, message: '集合元素不能为空', trigger: 'blur' }],
  groupNo: [{ required: true, message: '分组元素不能为空', trigger: 'blur' }]
})
const checkIntervalValue = (_, value, callback) => {
  if (!value) {
    return callback(new Error('间隔时长不能为空'))
  }
  const val = parseInt(value)
  if (!Number.isInteger(val)) {
    return callback(new Error('间隔时长必须为整数'))
  } else {
    if (val <= 0) {
      return callback(new Error('间隔时长必须大于0'))
    } else {
      return callback()
    }
  }
}
const triggerformRef = ref()
const triggerForm = ref({
  date: {
    datetime: ''
  },
  interval: {
    start_date: '',
    end_date: '',
    type: 'hours',
    value: ''
  },
  cron: {
    crontab: ''
  }
})
const triggerFormRules = reactive({
  'date.datetime': [{ required: true, message: '时间不能为空', trigger: 'blur' }],
  'interval.value': [{ validator: checkIntervalValue, trigger: 'blur' }],
  'cron.crontab': [{ required: true, message: 'crontab不能为空', trigger: 'blur' }]
})
const intervalDatetimeRange = ref([])
const requestData = computed(() => {
  const jobType = jobForm.value.jobType
  const triggerType = jobForm.value.triggerType
  const query = { ...jobForm.value }
  if (jobType === 'TESTPLAN') {
    query.jobArgs.planNo = taskForm.value.planNo
  } else if (jobType === 'COLLECTION') {
    query.jobArgs.collectionNo = taskForm.value.collectionNo
  } else {
    query.jobArgs.groupNo = taskForm.value.groupNo
  }

  if (triggerType === 'DATE') {
    query.triggerArgs = triggerForm.value.date
  } else if (triggerType === 'INTERVAL') {
    query.triggerArgs = triggerForm.value.interval
  } else {
    query.triggerArgs = triggerForm.value.cron
  }

  return query
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
  // 查询测试计划、测试集合或测试分组的列表数据
  if (jobForm.value.jobType === 'TESTPLAN') {
    queryTestplanAll()
  } else if (jobForm.value.jobType === 'COLLECTION') {
    queryCollectionAll()
  } else {
    queryGroupAll()
  }
  // 新增模式时无需查询定时任务信息
  if (createMode.value) return
  // 查询定时任务信息
  ElementService.queryTaskInfo({ jobNo: props.data.jobNo }).then((response) => {
    // 除 jobArgs, triggerArgs 属性外，其余赋值给 jobForm
    jobForm.value = _omit(response.result, ['jobArgs', 'triggerArgs'])
    jobForm.value.datasetNumberedList = response.result.jobArgs.datasetNumberedList
    jobForm.value.useCurrentValue = response.result.jobArgs.useCurrentValue

    // 赋值任务参数
    const jobType = jobForm.value.jobType
    if (jobType === 'TESTPLAN') {
      taskForm.value.planNo = response.result.jobArgs.planNo
    } else if (jobType === 'COLLECTION') {
      taskForm.value.collectionNo = response.result.jobArgs.collectionNo
    } else {
      taskForm.value.groupNo = response.result.jobArgs.groupNo
    }

    // 赋值触发器参数
    const triggerType = jobForm.value.triggerType
    if (triggerType === 'DATE') {
      triggerForm.value.date = response.result.triggerArgs
    } else if (triggerType === 'INTERVAL') {
      triggerForm.value.interval = response.result.triggerArgs
    } else {
      triggerForm.value.cron = response.result.triggerArgs
    }
  })
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
  ElementService.queryElementAll({
    workspaceNo: workspaceNo.value,
    elementType: 'COLLECTION',
    elementClass: 'TestCollection',
    enabled: true
  }).then((response) => {
    collectionList.value = response.result
  })
}

const queryGroupAll = () => {
  ElementService.queryElementAllWithChildren({
    workspaceNo: workspaceNo.value,
    elementType: 'COLLECTION',
    elementClass: 'TestCollection',
    childType: 'GROUP',
    childClass: 'TestGroup',
    enabled: true
  }).then((response) => {
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
  // cron格式校验
  if (
    jobForm.value.triggerType === 'CRON' &&
    !isValidCron(triggerForm.value.cron.crontab, { alias: true, allowBlankDay: true })
  ) {
    ElMessage({ message: 'cron表达式不正确', type: 'error', duration: 2 * 1000 })
    return
  }
  // 没有选择变量集时给出提示
  if (_isEmpty(jobForm.value.jobArgs.datasetNumberedList)) {
    await ElMessageBox.confirm('当前没有选择[环境/变量]，确定执行吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  }
  // 创建或修改任务
  if (createMode.value) {
    await ScheduleService.createTask(requestData.value)
  } else {
    await ScheduleService.modifyTask(requestData.value)
  }
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

/**
 * 生成区间数组
 */
const makeRange = (start, end) => {
  const result = []
  for (let i = start; i <= end; i++) {
    result.push(i)
  }
  return result
}

/**
 * 判断是否同一天
 */
const isSameDate = (current, strftime) => {
  const sameYear = current.isSame(strftime, 'year')
  const sameMonth = current.isSame(strftime, 'month')
  const sameDate = current.isSame(strftime, 'date')
  return sameYear && sameMonth && sameDate
}

/**
 * el-date-picker handler
 */
const disabledHours = () => {
  const current = dayjs()
  if (isSameDate(current, triggerForm.value.date.datetime)) {
    return makeRange(0, current.hour() - 1)
  }
  return []
}

/**
 * el-date-picker handler
 */
const disabledMinutes = (hour) => {
  const current = dayjs()
  if (hour === current.hour()) {
    return makeRange(0, current.minute() - 1)
  }
  return []
}

/**
 * el-date-picker handler
 */
const disabledSeconds = () => {
  return makeRange(0, 60)
}

/**
 * el-cascader handler
 */
const cascaderFilter = (node, keyword) => {
  return node.data.elementName.includes(keyword)
}

const datetimeRangeChange = () => {
  triggerForm.value.interval.start_date = intervalDatetimeRange.value[0]
  triggerForm.value.interval.end_date = intervalDatetimeRange.value[1]
}
</script>

<style lang="scss" scoped>
:deep(.el-form-item__label) {
  align-items: center;
}
</style>
