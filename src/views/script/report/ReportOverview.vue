<template>
  <div class="details-container">
    <el-descriptions :column="1">
      <el-descriptions-item label="报告名称：">{{ overview.reportName }}</el-descriptions-item>
      <el-descriptions-item v-if="overview.reportDesc" label="报告描述：">
        {{ overview.reportDesc }}
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions :column="3" style="margin-bottom: 20px">
      <el-descriptions-item label="开始时间：">
        <el-tag type="warning">{{ overview.startTime }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="结束时间：">
        <el-tag type="warning">{{ overview.endTime }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="耗时：">
        <el-tag type="danger">{{ overview.elapsedTime }}</el-tag>
      </el-descriptions-item>
    </el-descriptions>

    <el-table :data="totalData" style="width: 100%" highlight-current-row>
      <el-table-column prop="totalType" label="统计" />
      <el-table-column prop="collectionTotal" label="集合" />
      <el-table-column prop="groupTotal" label="案例" />
      <el-table-column prop="samplerTotal" label="请求" />
    </el-table>

    <div ref="pieChartRef" style="width: 100%; height: 400px" />
  </div>
</template>

<script setup>
import useECharts from '@/composables/useECharts'

const props = defineProps({
  overview: { type: Object, default: () => ({}) }
})
const { echarts } = useECharts()
const pieChartRef = ref()
const pieChart = ref(null)
const pieChartOption = reactive({
  title: {
    text: '集合',
    left: 'center',
    top: '20',
    textStyle: { color: '#606266' }
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b} : {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    top: '60',
    data: ['成功', '失败']
  },
  series: [
    {
      name: '集合',
      type: 'pie',
      radius: [0, '60%'],
      center: ['50%', '50%'],
      data: [
        { value: 0, name: '成功', itemStyle: { color: '#44B197' } },
        { value: 0, name: '失败', itemStyle: { color: '#FF7676' } }
      ],
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      },
      animationType: 'scale',
      animationEasing: 'elasticOut',
      animationDelay: function (idx) {
        return Math.random() * 200
      }
    }
  ]
})
const totalData = computed(() => {
  return [
    {
      totalType: '总数',
      collectionTotal: props.overview.successfulCollectionsTotal + props.overview.failedCollectionsTotal,
      groupTotal: props.overview.successfulGroupsTotal + props.overview.failedGroupsTotal,
      samplerTotal: props.overview.successfulSamplersTotal + props.overview.failedSamplersTotal
    },
    {
      totalType: '成功总数',
      collectionTotal: props.overview.successfulCollectionsTotal,
      groupTotal: props.overview.successfulGroupsTotal,
      samplerTotal: props.overview.successfulSamplersTotal
    },
    {
      totalType: '失败总数',
      collectionTotal: props.overview.failedCollectionsTotal,
      groupTotal: props.overview.failedGroupsTotal,
      samplerTotal: props.overview.failedSamplersTotal
    },
    {
      totalType: '成功率',
      collectionTotal: successRate(props.overview.successfulCollectionsTotal, props.overview.failedCollectionsTotal),
      groupTotal: successRate(props.overview.successfulGroupsTotal, props.overview.failedGroupsTotal),
      samplerTotal: successRate(props.overview.successfulSamplersTotal, props.overview.failedSamplersTotal)
    },
    {
      totalType: '平均响应时间',
      collectionTotal: props.overview.avgCollectionsElapsedTime,
      groupTotal: props.overview.avgGroupsElapsedTime,
      samplerTotal: props.overview.avgSamplersElapsedTime
    }
  ]
})

watch(
  () => props.overview,
  (val) => {
    setPieChartData([
      { value: val.successfulCollectionsTotal, name: '成功', itemStyle: { color: '#44B197' } },
      { value: val.failedCollectionsTotal, name: '失败', itemStyle: { color: '#FF7676' } }
    ])
  }
)

onMounted(() => {
  // 初始化 ECharts
  pieChart.value = echarts.init(pieChartRef.value)
  pieChart.value.setOption(pieChartOption, true)
  // 添加窗口尺寸变更事件
  window.addEventListener('resize', pieChart.value.resize)
})

onUnmounted(() => {
  // 移除窗口尺寸变更事件
  window.removeEventListener('resize', pieChart.value.resize)
  // 销毁 echarts 实例
  pieChart.value.dispose()
})

const setPieChartData = (data) => {
  const option = pieChart.value.getOption()
  option.series[0].data = data.sort((a, b) => {
    return a.value - b.value
  })
  pieChart.value.setOption(option, true)
  pieChart.value.resize()
}

const successRate = (successfulTotal, failedTotal) => {
  const total = successfulTotal + failedTotal
  return `${Math.round((successfulTotal / total) * 10000) / 100}%`
}
</script>

<style lang="scss" scoped>
.details-container {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.el-descriptions {
  :deep(.el-descriptions__label) {
    color: #606266;
    font-weight: bold;
    margin-right: 0;
  }
  :deep(.el-descriptions-item__container) {
    display: inline-flex;
    align-items: center;
  }
}

:deep(.el-descriptions-row) {
  display: flex;
  flex-wrap: wrap;

  .el-descriptions-item {
    margin-right: 20px;
  }

  .el-descriptions-item__label {
    margin-right: 5px;
  }
}
</style>
