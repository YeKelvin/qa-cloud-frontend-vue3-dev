<template>
  <div class="details-container">
    <el-descriptions :column="1">
      <el-descriptions-item label="案例名称：">{{ details.groupName }}</el-descriptions-item>
      <el-descriptions-item v-if="details.groupRemark" label="案例描述：">
        {{ details.groupRemark }}
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions :column="3" style="margin-bottom: 20px">
      <el-descriptions-item label="开始时间：">
        <el-tag type="warning">{{ details.startTime }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="结束时间：">
        <el-tag type="warning">{{ details.endTime }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="耗时：">
        <el-tag type="danger">{{ details.elapsedTime }}</el-tag>
      </el-descriptions-item>
    </el-descriptions>

    <div style="display: flex; justify-content: space-between; align-content: center">
      <el-table :data="totalData" highlight-current-row style="width: 50%; height: 400px">
        <el-table-column prop="totalType" label="统计" />
        <el-table-column prop="samplerTotal" label="请求" />
      </el-table>

      <div ref="pieChart" style="width: 50%; height: 400px" />
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import * as ReportService from '@/api/script/report'

export default {
  name: 'GroupResultDetails',

  props: {
    groupId: { type: String, default: '' }
  },

  data() {
    return {
      details: {},
      pieChart: null,
      pieChartOption: {
        title: {
          text: '请求',
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
            name: '请求',
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
      }
    }
  },

  computed: {
    totalData() {
      return [
        {
          totalType: '总数',
          samplerTotal: this.details.successfulSamplersTotal + this.details.failedSamplersTotal
        },
        {
          totalType: '成功总数',
          samplerTotal: this.details.successfulSamplersTotal
        },
        {
          totalType: '失败总数',
          samplerTotal: this.details.failedSamplersTotal
        },
        {
          totalType: '成功率',
          samplerTotal: this.successRate(this.details.successfulSamplersTotal, this.details.failedSamplersTotal)
        },
        {
          totalType: '平均响应时间',
          samplerTotal: this.details.avgSamplersElapsedTime
        }
      ]
    }
  },

  watch: {
    groupId(val) {
      if (!val) return
      this.queryGroupResult()
    }
  },

  mounted() {
    // 初始化 ECharts
    this.pieChart = echarts.init(this.$refs.pieChart)
    this.pieChart.setOption(this.pieChartOption, true)
    // 添加窗口尺寸变更事件
    window.addEventListener('resize', this.pieChart.resize)
    // 查询 CollectionResult
    if (!this.groupId) return
    this.queryGroupResult()
  },

  unmounted() {
    // 移除窗口尺寸变更事件
    window.removeEventListener('resize', this.pieChart.resize)
    // 销毁 echarts 实例
    this.pieChart.dispose()
  },

  methods: {
    queryGroupResult() {
      ReportService.queryGroupResult({ groupId: this.groupId })
        .then((response) => {
          this.details = response.result
          this.setPieChartData([
            { value: this.details.successfulSamplersTotal, name: '成功', itemStyle: { color: '#44B197' } },
            { value: this.details.failedSamplersTotal, name: '失败', itemStyle: { color: '#FF7676' } }
          ])
        })
        .catch(() => {})
    },
    setPieChartData(data) {
      const option = this.pieChart.getOption()
      option.series[0].data = data.sort((a, b) => {
        return a.value - b.value
      })
      this.pieChart.setOption(option, true)
      this.pieChart.resize()
    },
    successRate(successfulTotal, failedTotal) {
      const total = successfulTotal + failedTotal
      return `${Math.round((successfulTotal / total) * 10000) / 100}%`
    }
  }
}
</script>

<style lang="scss" scoped>
.details-container {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.el-table {
  &:before {
    height: 0;
  }
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
