<template>
  <div class="manager-container">
    <!-- 过滤 -->
    <span style="padding: 10px">
      <el-input v-model="filterText" placeholder="请输入搜索内容" size="large" clearable>
        <!-- 新增菜单 -->
        <template #prepend>
          <el-dropdown trigger="click" placement="bottom-start">
            <!-- 菜单弹出按钮 -->
            <el-button type="text" :icon="Plus" style="padding: 6px 20px" />
            <!-- 菜单 -->
            <template #dropdown>
              <el-dropdown-menu>
                <!-- 新增按钮 -->
                <el-dropdown-item @click="openNewEnvironmentTab">环境变量</el-dropdown-item>
                <el-dropdown-item @click="openNewCustomTab">自定义变量</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-input>
    </span>

    <!-- 变量集列表 -->
    <el-scrollbar style="width: 100%; height: 100%" wrap-style="overflow-x:auto;" view-style="padding:10px;">
      <DatasetTree ref="datasetTreeRef" />
    </el-scrollbar>
  </div>
</template>

<script setup>
import { useStore } from 'vuex'
import { Plus } from '@element-plus/icons-vue'
import DatasetTree from './DatasetTree'

const store = useStore()
const datasetTreeRef = ref()
const filterText = ref('')

watch(filterText, (val) => {
  datasetTreeRef.value.filter(val)
})

const openNewEnvironmentTab = () => {
  store.commit({
    type: 'pymeter/addTab',
    editorNo: 'UNSAVED_ENVIRONMENT_DATASET',
    editorName: 'New Environment',
    editorComponent: 'VariableDataset',
    editorMode: 'CREATE',
    metadata: {
      datasetType: 'ENVIRONMENT'
    }
  })
}

const openNewCustomTab = () => {
  store.commit({
    type: 'pymeter/addTab',
    editorNo: 'UNSAVED_CUSTOM_DATASET',
    editorName: 'New Custom',
    editorComponent: 'VariableDataset',
    editorMode: 'CREATE',
    metadata: {
      datasetType: 'CUSTOM'
    }
  })
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
