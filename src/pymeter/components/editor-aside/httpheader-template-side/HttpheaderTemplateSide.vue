<template>
  <div class="manager-container">
    <!-- 过滤 -->
    <span style="padding: 10px">
      <el-input v-model="filterText" placeholder="请输入搜索内容" size="large" clearable>
        <!-- 新增请求头模板 -->
        <template #prepend>
          <el-button type="primary" link :icon="Plus" style="padding: 6px 20px" @click="createTemplate()" />
        </template>
      </el-input>
    </span>

    <!-- 变量集列表 -->
    <el-scrollbar style="width: 100%; height: 100%" wrap-style="overflow-x:auto;" view-style="padding:10px;">
      <HttpheaderTemplateTree ref="templateTreeRef" />
    </el-scrollbar>
  </div>
</template>

<script lang="jsx" setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import useWorkspaceState from '@/composables/useWorkspaceState'
import NameInput from '@/pymeter/components/editor-aside/common/NameInput.vue'
import HttpheaderTemplateTree from './HttpheaderTemplateTree.vue'
import * as HeadersService from '@/api/script/headers'

const store = useStore()
const templateTreeRef = ref()
const filterText = ref('')
const { workspaceNo } = useWorkspaceState()

watch(filterText, (val) => {
  templateTreeRef.value.filter(val)
})

/**
 * 新增请求头模板
 */
const createTemplate = async () => {
  let templateName = ''
  // 弹出名称对话框
  const error = await ElMessageBox.confirm(null, {
    title: '新增请求头模板',
    message: <NameInput onUpdate:modelValue={(val) => (templateName = val)} />,
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
    .then(() => false)
    .catch(() => true)
  if (error) return
  if (templateName === '') {
    ElMessage({ message: '名称不能为空', type: 'error', duration: 2 * 1000 })
    return
  }
  // 修改请求头模板
  await HeadersService.createHttpHeaderTemplate({ workspaceNo: workspaceNo.value, templateName: templateName })
  // 重新查询列表
  store.dispatch('pymeter/queryHttpHeaderTemplateAll')
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
