<template>
  <el-dialog title="新增权限" width="50%" center @close="$emit('update:model-value', false)">
    <el-form
      ref="elformRef"
      label-width="100px"
      style="width: 100%; padding-right: 30px"
      inline-message
      :model="formData"
      :rules="formRules"
    >
      <el-form-item label="权限名称：" prop="permissionName">
        <el-input v-model="formData.permissionName" clearable />
      </el-form-item>
      <el-form-item label="权限描述：" prop="permissionDesc">
        <el-input v-model="formData.permissionDesc" clearable />
      </el-form-item>
      <el-form-item label="请求方法：" prop="method">
        <el-select v-model="formData.method" clearable style="width: 100%">
          <el-option v-for="(value, key) in HttpMethods" :key="key" :label="value" :value="value" />
        </el-select>
      </el-form-item>
      <el-form-item label="请求路由：" prop="endpoint">
        <el-input v-model="formData.endpoint" clearable />
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
import { HttpMethods } from '@/api/enum'
import * as PermissionService from '@/api/usercenter/permission'

const emit = defineEmits(['update:model-value', 're-query'])
const elformRef = ref()
const formData = ref({
  permissionName: '',
  permissionDesc: '',
  method: '',
  endpoint: ''
})
const formRules = reactive({
  permissionName: [{ required: true, message: '权限名称不能为空', trigger: 'blur' }],
  method: [{ required: true, message: '请求方法不能为空', trigger: 'change' }],
  endpoint: [{ required: true, message: '请求路由不能为空', trigger: 'blur' }]
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
  // 创建权限
  await PermissionService.createPermission(formData.value)
  // 成功提示
  ElMessage({ message: '新增成功', type: 'info', duration: 2 * 1000 })
  // 关闭dialog
  emit('update:model-value', false)
  // 重新查询列表
  emit('re-query')
}
</script>

<style lang="scss" scoped></style>
