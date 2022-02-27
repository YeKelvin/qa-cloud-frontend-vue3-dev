<template>
  <el-card shadow="hover" style="width: 100%">
    <template #header>
      <el-select v-model="manager" style="flex-grow: 1; padding-right: 10px">
        <el-option label="脚本" value="ELEMENT" />
        <el-option label="环境 / 变量" value="DATASET" />
        <el-option label="HTTP请求头" value="HTTP_HEADERS" />
      </el-select>
    </template>

    <component :is="managerComponents[manager]" />
  </el-card>
</template>

<script setup>
import ElementManager from './element-manager'
import DatasetManager from './dataset-manager'
import HttpHeadersManager from './http-headers-manager'
</script>

<script>
export default {
  name: 'EditorAside',
  data() {
    return {
      manager: 'ELEMENT',
      managerComponents: {
        ELEMENT: ElementManager,
        DATASET: DatasetManager,
        HTTP_HEADERS: HttpHeadersManager
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
