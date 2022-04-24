<template>
  <el-dialog title="成员管理" width="50%" center @close="$emit('update:model-value', false)">
    <div style="display: flex; flex: 1; flex-direction: column">
      <el-transfer
        v-model="memberList"
        style="display: flex; justify-content: center; align-items: center"
        filterable
        :titles="['用户', '空间成员']"
        :button-texts="['移除', '加入']"
        :data="users"
      >
        <template #default="{ option }">
          <span>{{ option.label }}</span>
        </template>
      </el-transfer>

      <div style="display: flex; justify-content: center; align-items: center; margin-top: 10px">
        <el-button type="primary" @click="save">保 存</el-button>
        <el-button @click="$emit('update:model-value', false)">关 闭</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import * as UserService from '@/api/usercenter/user'
import * as WorkspaceService from '@/api/public/workspace'

const emit = defineEmits(['update:model-value'])
const props = defineProps({
  row: { type: Object, default: () => ({}) }
})
const userList = ref([])
const memberList = ref([])
const users = computed(() => {
  const data = []
  userList.value.forEach((item) =>
    data.push({ key: item.userNo, label: item.userName, disabled: item.state !== 'ENABLE' })
  )
  return data
})

onMounted(() => {
  queryUserAll()
  queryWorkspaceUserAll()
})

/**
 * 查询所有用户
 */
const queryUserAll = () => {
  UserService.queryUserAll().then((response) => {
    userList.value = response.result
  })
}

/**
 * 查询所有空间
 */
const queryWorkspaceUserAll = () => {
  WorkspaceService.queryWorkspaceUserAll({ workspaceNo: props.row.workspaceNo }).then((response) => {
    memberList.value = response.result.map((item) => item.userNo)
  })
}

/**
 * 修改空间成员
 */
const save = () => {
  WorkspaceService.modifyWorkspaceUser({ workspaceNo: props.row.workspaceNo, userNumberList: memberList.value }).then(
    () => {
      // 成功提示
      ElMessage({ message: '编辑成功', type: 'info', duration: 2 * 1000 })
      // 关闭dialog
      emit('update:model-value', false)
    }
  )
}
</script>

<style lang="scss" scoped>
:deep(.el-transfer-panel) {
  min-width: 200px;
  max-width: 400px;
  width: 300px;
}
</style>
