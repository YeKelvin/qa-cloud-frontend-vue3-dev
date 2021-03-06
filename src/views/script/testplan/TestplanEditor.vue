<template>
  <div class="testplan-container">
    <span class="testplan-title">
      <span style="color: #606266; font-weight: 700">测试计划</span>
      <el-divider />
    </span>

    <div class="testplan-body">
      <!-- 脚本列表 -->
      <TestplanCollectionTree ref="collectionTreeRef" style="width: 50%" :readonly="queryMode" />
      <!-- 设置表单 -->
      <div style="width: 50%" class="settings-container">
        <el-form
          ref="elformRef"
          label-position="right"
          label-width="140px"
          style="width: 100%"
          inline-message
          :model="formData"
          :rules="formRules"
        >
          <!-- 计划名称 -->
          <el-form-item label="计划名称：" prop="planName">
            <el-input v-model="formData.planName" clearable :readonly="queryMode" />
          </el-form-item>

          <!-- 计划描述 -->
          <el-form-item label="计划描述：" prop="planDesc">
            <el-input v-model="formData.planDesc" clearable :readonly="queryMode" />
          </el-form-item>

          <!-- 版本号 -->
          <el-form-item label="版本号：" prop="productRequirementsVersion">
            <el-input v-model="formData.productRequirementsVersion" clearable :readonly="queryMode" />
          </el-form-item>

          <!-- 并发数 -->
          <el-form-item label="并发数：" prop="concurrency">
            <el-input v-model="formData.concurrency" clearable disabled>
              <template #append>个</template>
            </el-input>
          </el-form-item>

          <!-- 迭代次数 -->
          <el-form-item label="迭代数：" prop="iterations">
            <el-input v-model="formData.iterations" clearable :readonly="queryMode">
              <template #append>次</template>
            </el-input>
          </el-form-item>

          <!-- 迭代间隔时间 -->
          <el-form-item label="迭代间隔：" prop="delay">
            <el-input v-model="formData.delay" clearable :readonly="queryMode">
              <template #append>ms</template>
            </el-input>
          </el-form-item>

          <!-- 保存结果 -->
          <el-form-item label="保存结果：" prop="save">
            <el-switch v-model="formData.save" active-color="#13ce66" :disabled="queryMode" />
          </el-form-item>

          <!-- 仅保存失败结果 -->
          <el-form-item label="仅保存失败结果：" prop="saveOnError">
            <el-switch v-model="formData.saveOnError" active-color="#13ce66" disabled />
          </el-form-item>

          <!-- 通知机器人 -->
          <el-form-item label="结果通知：" prop="property.engineNo">
            <el-select
              v-model="formData.notificationRobotNumberedList"
              filterable
              multiple
              style="width: 100%"
              tag-type="danger"
              :disabled="queryMode"
            >
              <el-option
                v-for="item in notificationRobotList"
                :key="item.robotNo"
                :label="item.robotName"
                :value="item.robotNo"
              >
                <span class="robot-type-option">
                  <span>{{ item.robotName }}</span>
                  <el-tag type="danger" size="small">{{ RobotType[item.robotType] }}</el-tag>
                </span>
              </el-option>
            </el-select>
          </el-form-item>

          <!-- 操作按钮 -->
          <el-form-item v-if="queryMode">
            <el-button :icon="Edit" type="primary" @click="editorMode = 'MODIFY'">编 辑</el-button>
            <el-button :icon="Close" @click="goBack()">关 闭</el-button>
          </el-form-item>
          <el-form-item v-else-if="modifyMode">
            <el-button :icon="Check" type="danger" @click="modifyTestplan()">保 存</el-button>
            <el-button :icon="Close" @click="goBack()">关 闭</el-button>
          </el-form-item>
          <el-form-item v-else-if="createMode">
            <el-button :icon="Check" type="primary" @click="createTestplan()">创建计划</el-button>
            <el-button :icon="Close" @click="goBack()">关 闭</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { assign as _assign } from 'lodash-es'
import { ElMessage } from 'element-plus'
import { Check, Close, Edit } from '@element-plus/icons-vue'
import { RobotType } from '@/api/enum'
import * as NotificationService from '@/api/public/notification'
import * as TestplanService from '@/api/script/testplan'
import useWorkspaceState from '@/composables/useWorkspaceState'
import TestplanCollectionTree from './TestplanCollectionTree.vue'

const { workspaceNo } = useWorkspaceState()
const route = useRoute()
const router = useRouter()
const checkIterations = (_, value, callback) => {
  if (!value) {
    return callback(new Error('迭代次数不能为空'))
  }
  const val = parseInt(value)
  if (!Number.isInteger(val)) {
    return callback(new Error('迭代次数必须为整数'))
  } else {
    if (val < 1 || val > 999) {
      return callback(new Error('迭代次数仅支持[1-999]'))
    } else {
      return callback()
    }
  }
}
const elformRef = ref()
const collectionTreeRef = ref()
const planNo = ref(route.query.planNo)
const editorMode = ref(route.params.editorMode)
const notificationRobotList = ref([])
const formData = reactive({
  planName: '',
  planDesc: '',
  productRequirementsVersion: '',
  concurrency: '1',
  iterations: '1',
  delay: '0',
  save: true,
  saveOnError: false,
  stopTestOnErrorCount: '3',
  notificationRobotNumberedList: []
})
const formRules = reactive({
  planName: [{ required: true, message: '计划名称不能为空', trigger: 'blur' }],
  concurrency: [{ required: true, message: '并发数不能为空', trigger: 'blur' }],
  iterations: [{ required: true, message: '迭代数不能为空', validator: checkIterations, trigger: 'blur' }]
})

const queryMode = computed(() => editorMode.value === 'QUERY')
const modifyMode = computed(() => editorMode.value === 'MODIFY')
const createMode = computed(() => editorMode.value === 'CREATE')

watch(
  () => formData.iterations,
  (val) => {
    if (val && val > 1) {
      formData.save = false
      formData.saveOnError = false
    }
  }
)
watch(
  () => formData.save,
  (val) => {
    if (val) {
      formData.iterations = '1'
      formData.delay = '0'
    }
  }
)

onMounted(() => {
  queryNotificationRobotAll()
  if (createMode.value) return
  if (!planNo.value) {
    editorMode.value = 'CREATE'
    return
  }
  editorMode.value = 'QUERY'
  queryTestplan()
})

/**
 * 查询测试计划
 */
const queryTestplan = () => {
  TestplanService.queryTestplan({ planNo: planNo.value }).then((response) => {
    _assign(formData, response.result)
    collectionTreeRef.value.setCheckedKeys(response.result.collectionNumberList)
  })
}

/**
 * 查询所有通知机器人
 */
const queryNotificationRobotAll = () => {
  NotificationService.queryNotificationRobotAll({ workspaceNo: workspaceNo.value }).then((response) => {
    notificationRobotList.value = response.result
  })
}

/**
 * 创建测试计划
 */
const createTestplan = async () => {
  // 表单校验
  const error = await elformRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  if (error) {
    ElMessage({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
    return
  }

  // 获取已勾选的集合
  const collectionList = collectionTreeRef.value.getCheckedCollections()
  if (collectionList.length === 0) {
    ElMessage({ message: '脚本至少选择一个', type: 'warning', duration: 2 * 1000 })
    return
  }

  // 新增测试计划
  await TestplanService.createTestplan({ workspaceNo: workspaceNo.value, collectionList: collectionList, ...formData })
  // 成功提示
  ElMessage({ message: '创建成功', type: 'info', duration: 2 * 1000 })
  // 返回上一页
  goBack()
}

/**
 * 修改测试计划
 */
const modifyTestplan = async () => {
  // 表单校验
  const error = await elformRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  if (error) {
    ElMessage({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
    return
  }

  // 获取已勾选的集合
  const collectionList = collectionTreeRef.value.getCheckedCollections()
  if (collectionList.length === 0) {
    ElMessage({ message: '脚本至少选择一个', type: 'warning', duration: 2 * 1000 })
    return
  }

  // 修改测试计划
  await TestplanService.modifyTestplan({ collectionList: collectionList, ...formData })
  // 成功提示
  ElMessage({ message: '修改成功', type: 'info', duration: 2 * 1000 })
  // 返回上一页
  goBack()
}

/**
 * 返回上一页
 */
const goBack = () => {
  window.history.length > 1 ? router.go(-1) : router.push('/script/testplan')
}
</script>

<style lang="scss" scoped>
.testplan-container {
  position: absolute;
  width: 100%;
  height: 100%;

  display: flex;
  flex: 1;
  flex-direction: column;
}

.testplan-title {
  display: flex;
  flex-direction: column;
  width: 100%;

  padding: 0 10px;
  padding-top: 20px;

  :deep(.el-divider--horizontal) {
    margin: 10px 0;
  }
}

.testplan-body {
  display: flex;
  flex: 1;

  height: 100%;
  width: 100%;

  padding: 20px;
  padding-top: 10px;
}

.settings-container {
  padding: 20px;
}

.robot-type-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-form-item--small.el-form-item {
  padding: 0 10px;
}

:deep(.el-input-group__append) {
  width: 60px;
}
</style>
