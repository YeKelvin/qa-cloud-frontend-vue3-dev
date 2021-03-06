<template>
  <div class="report-container">
    <!-- 报告标题 -->
    <div class="report-header">
      <el-card shadow="hover">
        <el-button type="primary" link :icon="ArrowLeft" @click="goBack()">返 回</el-button>
        <span style="font-size: 16px">接口测试报告</span>
        <el-button type="primary" link :icon="DataAnalysis" @click="openOverview()">统 计</el-button>
      </el-card>
    </div>

    <!-- 报告主体 -->
    <div class="report-body">
      <!-- collection-card 列表 -->
      <el-card shadow="hover" class="collection-container">
        <!-- 卡片头部 -->
        <template #header><span style="font-size: 16px">集合</span></template>
        <!-- 过滤input -->
        <el-input
          v-model="collectionsFilterText"
          placeholder="请输入搜索内容"
          style="padding: 10px 10px 0 10px; margin-bottom: 10px"
          clearable
        />
        <!-- collection-card -->
        <el-scrollbar
          style="width: 100%; height: 100%; padding-bottom: 50px"
          wrap-style="overflow-x:auto;"
          view-style="padding: 0 10px;"
        >
          <ReportCollectionCard :collections="filteredCollections" @click="handleCollectionCardClick" />
        </el-scrollbar>
      </el-card>

      <!-- element-tree -->
      <el-card v-show="showTree" shadow="hover" class="result-tree-container">
        <!-- 卡片头部 -->
        <template #header><span style="font-size: 16px">脚本</span></template>
        <!-- 过滤input -->
        <el-input
          v-model="resultTreeFilterText"
          placeholder="请输入搜索内容"
          style="padding: 10px 10px 0 10px; margin-bottom: 10px"
          clearable
        />
        <!-- 脚本结果列表 -->
        <el-scrollbar
          style="width: 100%; height: 100%; padding-bottom: 50px"
          wrap-style="overflow-x:auto;"
          view-style="padding: 0 10px;"
        >
          <ReportResultTree :data="groups" :filter-text="resultTreeFilterText" @node-click="handleNodeClick" />
        </el-scrollbar>
      </el-card>

      <!-- ResultDetails -->
      <el-card shadow="hover" class="result-details-container">
        <!-- 卡片头部 -->
        <template #header><span style="font-size: 16px">详情</span></template>
        <el-scrollbar
          style="width: 100%; height: 100%; padding-bottom: 50px"
          wrap-style="overflow-x: auto;"
          view-style="padding: 10px;"
        >
          <ReportOverview v-if="showOverview" :overview="overview" />
          <ReportCollectionResult v-if="showCollectionResult" :details="collectionDetails" />
          <ReportGroupResult v-if="showGroupResult" :group-id="groupId" />
          <ReportSamplerResult v-if="showSamplerResult" :sampler-id="samplerId" />
        </el-scrollbar>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { isEmpty as _isEmpty } from 'lodash-es'
import { isBlank } from '@/utils/string-util'
import { ArrowLeft, DataAnalysis } from '@element-plus/icons-vue'
import * as ReportService from '@/api/script/report'
import ReportOverview from './ReportOverview.vue'
import ReportCollectionResult from './ReportCollectionResult.vue'
import ReportGroupResult from './ReportGroupResult.vue'
import ReportSamplerResult from './ReportSamplerResult.vue'
import ReportCollectionCard from './ReportCollectionCard.vue'
import ReportResultTree from './ReportResultTree'

const route = useRoute()
const router = useRouter()
const reportNo = ref(route.query.reportNo)
const overview = ref({})
const collections = ref([])
const groups = ref([])
const collectionId = ref('')
const collectionDetails = ref({})
const groupId = ref('')
const samplerId = ref('')
const collectionsFilterText = ref('')
const resultTreeFilterText = ref('')
const showOverview = ref(true)
const showCollectionResult = ref(false)
const showGroupResult = ref(false)
const showSamplerResult = ref(false)
const showTree = computed(() => !_isEmpty(groups.value))
const filteredCollections = computed(() => {
  if (isBlank(collectionsFilterText.value)) {
    return collections.value
  } else {
    return collections.value.filter((item) => item.name.indexOf(collectionsFilterText.value.trim()) !== -1)
  }
})

onMounted(() => {
  if (!reportNo.value) {
    goBack()
    return
  }
  queryReport()
})

/**
 * 查询报告
 */
const queryReport = () => {
  ReportService.queryReport({ reportNo: reportNo.value }).then((response) => {
    overview.value = response.result.details
    collections.value = response.result.collections
  })
}

/**
 * 查询集合结果
 */
const queryCollectionResult = () => {
  ReportService.queryCollectionResult({ collectionId: collectionId.value }).then((response) => {
    collectionDetails.value = response.result.details
    groups.value = response.result.children
  })
}

/**
 * 打开统计面板
 */
const openOverview = () => {
  groups.value = []
  showOverview.value = true
  showCollectionResult.value = false
  showGroupResult.value = false
  showSamplerResult.value = false
}

/**
 * el-card handler
 */
const handleCollectionCardClick = (collection) => {
  // 记录当前点击的 CollectionId
  collectionId.value = collection.id
  // 查询集合结果
  queryCollectionResult()

  // 设置当前显示的结果视图为 CollectionResultDetails
  showOverview.value = false
  showCollectionResult.value = true
  showGroupResult.value = false
  showSamplerResult.value = false
}

/**
 * el-tree handler
 */
const handleNodeClick = (data, node) => {
  showOverview.value = false
  showCollectionResult.value = false
  if (node.level === 1) {
    // 记录当前点击的 GroupId
    groupId.value = data.id
    // 设置当前显示的结果视图为 GroupResultDetails
    showGroupResult.value = true
    showSamplerResult.value = false
  } else {
    // 记录当前点击的 SamplerId
    samplerId.value = data.id
    // 设置当前显示的结果视图为 SamplerResultDetails
    showGroupResult.value = false
    showSamplerResult.value = true
  }
}

/**
 * 返回上一页
 */
const goBack = () => {
  window.history.length > 1 ? router.go(-1) : router.push('/')
}
</script>

<style lang="scss" scoped>
.report-container {
  position: absolute;
  overflow: hidden;

  display: flex;
  flex: 1;
  flex-direction: column;

  width: 100%;
  height: 100%;

  color: #606266;
}

.report-header {
  display: flex;
  flex-direction: column;

  padding: 0 10px;
  margin: 5px 0;

  .el-button {
    -webkit-appearance: button;
    padding: 5px;
    font-size: 16px;
  }

  :deep(.el-card__body) {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 36px;
  }
}

.report-body {
  display: flex;
  flex: 1;

  height: 0;
  width: 100%;

  padding: 0 10px;
  padding-bottom: 5px;
}

.collection-container {
  display: flex;
  flex: 1;
  flex-direction: column;

  height: 100%;
  min-width: 300px;
  max-width: 400px;

  margin-right: 10px;
}

.result-tree-container {
  display: flex;
  flex: 1;
  flex-direction: column;

  height: 100%;
  min-width: 300px;
  max-width: 400px;

  margin-right: 10px;
}

.result-details-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 500px;
}

.el-card {
  color: #606266;
}

:deep(.el-card__header) {
  padding: 10px 10px;
}

:deep(.el-card__body) {
  display: flex;
  flex: 1;
  flex-direction: column;

  height: 100%;
  width: 100%;

  padding: 0;
}

:deep(.el-tree-node__content) {
  height: 100%;
}
</style>
