<template>
  <div class="report-container">
    <!-- 报告标题 -->
    <div class="report-header">
      <el-card shadow="hover">
        <el-button type="text" icon="el-icon-arrow-left" @click="goBack">返回</el-button>
        <span>接口测试报告</span>
        <el-button type="text" icon="el-icon-s-data" @click="openOverview">统计</el-button>
      </el-card>
    </div>

    <!-- 报告主体 -->
    <div class="report-body">
      <!-- collection-card 列表 -->
      <el-card shadow="hover" class="collection-container">
        <!-- 卡片头部 -->
        <span slot="header">集合</span>
        <!-- 过滤input -->
        <el-input
          v-model="collectionsFilterText"
          size="small"
          placeholder="请输入搜索内容"
          style="padding: 10px 10px 0 10px; margin-bottom:10px;"
          clearable
        />
        <!-- collection-card -->
        <el-scrollbar
          style="width:100%; height:100%; padding-bottom:50px;"
          wrap-style="overflow-x:auto;"
          view-style="padding: 0 10px;"
        >
          <collection-card :collections="filteredCollections" @click="handleCollectionCardClick" />
        </el-scrollbar>
      </el-card>

      <!-- element-tree -->
      <el-card v-show="showTree" shadow="hover" class="result-tree-container">
        <!-- 卡片头部 -->
        <span slot="header">脚本</span>
        <!-- 过滤input -->
        <el-input
          v-model="resultTreeFilterText"
          size="small"
          placeholder="请输入搜索内容"
          style="padding: 10px 10px 0 10px; margin-bottom:10px;"
          clearable
        />
        <!-- 脚本结果列表 -->
        <el-scrollbar
          style="width:100%; height:100%; padding-bottom:50px;"
          wrap-style="overflow-x:auto;"
          view-style="padding: 0 10px;"
        >
          <result-tree :data="groups" :filter-text="resultTreeFilterText" @node-click="handleNodeClick" />
        </el-scrollbar>
      </el-card>

      <!-- ResultDetails -->
      <el-card shadow="hover" style="display:flex; flex:1; flex-direction:column; min-width:500px;">
        <!-- 卡片头部 -->
        <span slot="header">详情</span>
        <el-scrollbar
          style="width:100%; height:100%; padding-bottom:50px;"
          wrap-style="overflow-x:auto;"
          view-style="padding:10px;"
        >
          <overview-details v-if="showOverview" :overview="overview" />
          <collection-result-details v-if="showCollectionResult" :details="collectionDetails" />
          <group-result-details v-if="showGroupResult" :group-id="groupId" />
          <sampler-result-details v-if="showSamplerResult" :sampler-id="samplerId" />
        </el-scrollbar>
      </el-card>
    </div>
  </div>
</template>

<script>
import * as ReportService from '@/api/script/report'
import * as StringUtil from '@/utils/string-util'
import OverviewDetails from './overview-details'
import CollectionResultDetails from './collection-result-details'
import GroupResultDetails from './group-result-details'
import SamplerResultDetails from './sampler-result-details'
import CollectionCard from './collection-card'
import ResultTree from './result-tree'

export default {

  name: 'TestReport',

  components: {
    OverviewDetails, CollectionResultDetails, GroupResultDetails, SamplerResultDetails, CollectionCard, ResultTree
  },

  data() {
    return {
      reportNo: this.$route.query.reportNo,
      overview: {},
      collections: [],
      groups: [],
      collectionId: '',
      collectionDetails: {},
      groupId: '',
      samplerId: '',
      collectionsFilterText: '',
      resultTreeFilterText: '',
      showOverview: true,
      showCollectionResult: false,
      showGroupResult: false,
      showSamplerResult: false
    }
  },

  computed: {
    showTree() {
      return this.groups.length > 0
    },
    filteredCollections() {
      if (StringUtil.isBlank(this.collectionsFilterText)) {
        return this.collections
      } else {
        return this.collections.filter(item => item.name.indexOf(StringUtil.trim(this.collectionsFilterText)) !== -1)
      }
    }
  },

  mounted() {
    if (!this.reportNo) {
      this.goBack()
      return
    }
    this.queryReport()
  },

  methods: {
    queryReport() {
      ReportService.queryReport({ reportNo: this.reportNo })
        .then(response => {
          this.overview = response.result.details
          this.collections = response.result.collections
        }).catch(() => {})
    },
    queryCollectionResult() {
      ReportService.queryCollectionResult({ collectionId: this.collectionId })
        .then(response => {
          this.collectionDetails = response.result.details
          this.groups = response.result.children
        }).catch(() => {})
    },
    handleCollectionCardClick(collection) {
      // 记录当前点击的 CollectionId
      this.collectionId = collection.id
      // 查询集合结果
      this.queryCollectionResult()

      // 设置当前显示的结果视图为 CollectionResultDetails
      this.showOverview = false
      this.showCollectionResult = true
      this.showGroupResult = false
      this.showSamplerResult = false
    },
    handleNodeClick(data, node) {
      this.showOverview = false
      this.showCollectionResult = false
      if (node.level === 1) {
        // 记录当前点击的 GroupId
        this.groupId = data.id
        // 设置当前显示的结果视图为 GroupResultDetails
        this.showGroupResult = true
        this.showSamplerResult = false
      } else {
        // 记录当前点击的 SamplerId
        this.samplerId = data.id
        // 设置当前显示的结果视图为 SamplerResultDetails
        this.showGroupResult = false
        this.showSamplerResult = true
      }
    },
    goBack() {
      window.history.length > 1 ? this.$router.go(-1) : this.$router.push('/')
    },
    openOverview() {
      this.groups = []
      this.showOverview = true
      this.showCollectionResult = false
      this.showGroupResult = false
      this.showSamplerResult = false
    }
  }
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
  max-width: 400px;

  margin-right: 10px;
}

.result-tree-container {
  display: flex;
  flex: 1;
  flex-direction: column;

  height: 100%;
  max-width: 400px;

  margin-right: 10px;
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
