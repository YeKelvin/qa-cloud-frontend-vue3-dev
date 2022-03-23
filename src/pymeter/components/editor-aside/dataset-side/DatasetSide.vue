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
                <el-dropdown-item @click="createEnvironmentDataset()">环境变量</el-dropdown-item>
                <el-dropdown-item @click="createCustomDataset()">自定义变量</el-dropdown-item>
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

<script lang="jsx" setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import useWorkspaceState from '@/composables/useWorkspaceState'
import NameInput from '@/pymeter/components/editor-aside/common/NameInput.vue'
import DatasetTree from './DatasetTree.vue'
import * as VariablesService from '@/api/script/variables'

const store = useStore()
const datasetTreeRef = ref()
const filterText = ref('')
const { workspaceNo } = useWorkspaceState()

watch(filterText, (val) => {
  datasetTreeRef.value.filter(val)
})

/**
 * 新增环境变量集
 */
const createEnvironmentDataset = async () => {
  let datasetName = ''
  // 弹出名称对话框
  const error = await ElMessageBox.confirm(null, {
    title: '新增环境变量集',
    message: <NameInput onUpdate:modelValue={(val) => (datasetName = val)} />,
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(() => false)
    .catch(() => true)
  if (error) return
  if (datasetName === '') {
    ElMessage({ message: '名称不能为空', type: 'error', duration: 2 * 1000 })
    return
  }
  // 修改变量集
  await VariablesService.createVariableDataset({
    workspaceNo: workspaceNo.value,
    datasetName: datasetName,
    datasetType: 'ENVIRONMENT'
  })
  // 重新查询列表
  store.dispatch('pymeter/queryDatasetAll')
  // 成功提示
  ElMessage({ message: '新增成功', type: 'info', duration: 2 * 1000 })
}

/**
 * 新增自定义变量集
 */
const createCustomDataset = async () => {
  let datasetName = ''
  // 弹出名称对话框
  const error = await ElMessageBox.confirm(null, {
    title: '新增自定义变量集',
    message: <NameInput onUpdate:modelValue={(val) => (datasetName = val)} />,
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(() => false)
    .catch(() => true)
  if (error) return
  if (datasetName === '') {
    ElMessage({ message: '名称不能为空', type: 'error', duration: 2 * 1000 })
    return
  }
  // 修改变量集
  await VariablesService.createVariableDataset({
    workspaceNo: workspaceNo.value,
    datasetName: datasetName,
    datasetType: 'CUSTOM'
  })
  // 重新查询列表
  store.dispatch('pymeter/queryDatasetAll')
  // 成功提示
  ElMessage({ message: '新增成功', type: 'info', duration: 2 * 1000 })
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
