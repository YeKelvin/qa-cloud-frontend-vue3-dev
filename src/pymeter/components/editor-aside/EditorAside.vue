<template>
  <el-card shadow="hover" style="width: 100%">
    <template #header>
      <el-select v-model="asideName" style="flex-grow: 1; padding-right: 10px">
        <el-option label="脚本" value="ELEMENT" />
        <el-option label="环境 / 变量" value="DATASET" />
        <el-option label="HTTP请求头" value="HTTP_HEADERS" />
      </el-select>
    </template>

    <component :is="asideComponents[asideName]" />
  </el-card>
</template>

<script setup>
import ElementAside from './ElementAside.vue'
import DatasetAside from './DatasetAside.vue'
import HttpHeadersAside from './HttpHeadersAside.vue'
</script>

<script>
export default {
  name: 'EditorAside',
  data() {
    return {
      asideName: 'ELEMENT',
      asideComponents: {
        ELEMENT: ElementAside,
        DATASET: DatasetAside,
        HTTP_HEADERS: HttpHeadersAside
      }
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.el-card__header) {
  display: flex;
  padding: 0;

  .el-input__inner {
    border: 0;
  }
}

:deep(.el-card__body) {
  height: 100%;
  width: 100%;
  padding: 0;
  padding-bottom: 50px;
}
</style>
