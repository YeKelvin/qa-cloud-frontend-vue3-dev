<template>
  <el-dialog title="新增通知机器人" width="50%" center @close="$emit('update:model-value', false)">
    <el-form
      ref="elformRef"
      label-width="140px"
      style="width: 100%; padding-right: 30px"
      inline-message
      :model="formData"
      :rules="formRules"
    >
      <el-form-item label="机器人名称：" prop="robotName">
        <el-input v-model="formData.robotName" clearable />
      </el-form-item>
      <el-form-item label="机器人描述：" prop="robotDesc">
        <el-input v-model="formData.robotDesc" clearable />
      </el-form-item>
      <el-form-item label="Webhook Key：" prop="robotConfig.key">
        <el-input v-model="formData.robotConfig.key" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm()">提 交</el-button>
        <el-button @click="$refs.elformRef.resetFields()">重 置</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import useWorkspaceState from '@/composables/useWorkspaceState'
import * as NotificationService from '@/api/public/notification'

const emit = defineEmits(['update:model-value', 're-query'])
const { workspaceNo } = useWorkspaceState()
const elformRef = ref()
const formData = ref({
  workspaceNo: workspaceNo.value,
  robotName: '',
  robotDesc: '',
  robotType: 'WECOM',
  robotConfig: {
    key: ''
  }
})
const formRules = reactive({
  robotName: [{ required: true, message: '机器人名称不能为空', trigger: 'blur' }],
  'robotConfig.key': [{ required: true, message: '机器人配置不能为空', trigger: 'blur' }]
})

/**
 * 提交表单
 */
const submitForm = async () => {
  // 表单校验
  const error = await elformRef.value
    .validate()
    .then(() => false)
    .catch(() => false)
  if (error) {
    ElMessage({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
    return
  }
  // 创建机器人
  await NotificationService.createNotificationRobot(formData.value)
  // 成功提示
  ElMessage({ message: '新增成功', type: 'info', duration: 2 * 1000 })
  // 关闭dialog
  emit('update:model-value', false)
  // 重新查询列表
  emit('re-query')
}
</script>

<style lang="scss" scoped></style>
