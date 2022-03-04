<template>
  <div class="manager-container">
    <!-- 过滤 -->
    <span style="padding: 10px">
      <el-input v-model="filterText" placeholder="请输入搜索内容" size="large" clearable>
        <!-- 新增请求头模板 -->
        <template #prepend>
          <el-button type="text" :icon="Plus" style="padding: 6px 20px" @click="openNewTemplateTab" />
        </template>
      </el-input>
    </span>

    <!-- 变量集列表 -->
    <el-scrollbar style="width: 100%; height: 100%" wrap-style="overflow-x:auto;" view-style="padding:10px;">
      <HttpheaderTemplateTree :filter-text="filterText" />
    </el-scrollbar>
  </div>
</template>

<script setup>
import { Plus } from '@element-plus/icons-vue'
import HttpheaderTemplateTree from './HttpheaderTemplateTree.vue'
</script>

<script>
export default {
  name: 'HttpHeadersAside',
  data() {
    return {
      // 关键字
      filterText: ''
    }
  },

  methods: {
    openNewTemplateTab() {
      this.$store.commit({
        type: 'pymeter/addTab',
        editorNo: 'UNSAVED_HTTP_HEADERS_TEMPLATE',
        editorName: 'New Template',
        editorComponent: 'HttpHeadersTemplate',
        editorMode: 'CREATE'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.manager-container {
  display: flex;
  flex: 1;
  flex-direction: column;

  height: 100%;
  width: 100%;

  .el-divider--horizontal {
    width: 95%;
    margin: 5px 10px;
  }
}

:deep(.el-input-group__prepend button.el-button) {
  border-color: transparent;
  background-color: transparent;
  color: #409eff;
  border-top: 0;
  border-bottom: 0;
}

:deep(.el-input-group__prepend) {
  background-color: #fff;
}

:deep(.el-divider--horizontal) {
  margin: 20px 0;
}

:deep(.el-divider__text) {
  color: #606266;
  user-select: none;
}
</style>
