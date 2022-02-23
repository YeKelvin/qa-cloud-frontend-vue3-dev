<template>
  <el-icon class="el-svg-icon">
    <component :is="ElementIcons[iconName]" />
  </el-icon>
</template>

<script setup>
import * as ElementIcons from '@element-plus/icons-vue'
</script>

<script>
export default {
  name: 'ElSvgItem',
  props: {
    iconName: { type: String, required: true }
  }
}
</script>

<style lang="scss" scoped>
.el-svg-icon {
  width: 1em;
  height: 1em;
  margin-left: -2px;
  font-size: 20px !important;
  text-align: left !important;
}
</style>
