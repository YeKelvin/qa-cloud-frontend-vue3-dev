<template>
  <div ref="chart" :style="style" />
</template>

<script>
import * as echarts from 'echarts'

export default {

  name: 'PieChart',

  props: {
    width: { type: [String, Number], default: '400' },
    height: { type: [String, Number], default: '400' },
    title: { type: String, default: '' }
  },

  data() {
    return {
      option: {}
    }
  },

  computed: {
    style() {
      const { width, height } = this
      const fixedWidth = width.toString().indexOf('%') !== -1 ? width : `${width}px`
      const fixedHeight = height.toString().indexOf('%') !== -1 ? height : `${height}px`
      return {
        width: fixedWidth,
        height: fixedHeight
      }
    }
  },

  mounted() {
    echarts.init(this.$refs.chart).setOption(this.testSuitePieChartOption)
  },

  methods: {}

}
</script>

<style lang="scss" scoped>

</style>
