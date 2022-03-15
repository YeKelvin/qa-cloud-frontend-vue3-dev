<template>
  <div ref="echartRef" :style="style" />
</template>

<script setup>
import * as echarts from 'echarts'

const props = defineProps({
  option: { type: Object, default: () => ({}) }
})
const echartRef = ref()

onMounted(() => {
  echarts.init(echartRef.value).setOption(props.option)
})
</script>

<style lang="scss" scoped></style>
