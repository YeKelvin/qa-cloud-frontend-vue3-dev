<template>
  <el-dialog title="新增分组" width="50%" center @close="$emit('update:model-value', false)">
    <el-form
      ref="elformRef"
      label-width="100px"
      style="width: 100%; padding-right: 30px"
      inline-message
      :model="formData"
      :rules="formRules"
    >
      <el-form-item label="分组名称：" prop="groupName">
        <el-input v-model="formData.groupName" clearable />
      </el-form-item>
      <el-form-item label="分组备注：" prop="groupDesc">
        <el-input v-model="formData.groupDesc" clearable />
      </el-form-item>
      <el-form-item label="分组角色：" prop="roleNumberedList">
        <el-select v-model="formData.roleNumberedList" style="width: 100%" multiple clearable>
          <el-option v-for="role in roleList" :key="role.roleNo" :label="role.roleName" :value="role.roleNo" />
        </el-select>
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
import * as RoleService from '@/api/usercenter/role'
import * as GroupService from '@/api/usercenter/group'

const emit = defineEmits(['update:model-value', 're-query'])
const elformRef = ref()
const formData = ref({
  groupName: '',
  groupDesc: '',
  roleNumberedList: []
})
const formRules = reactive({
  groupName: [{ required: true, message: '分组名称不能为空', trigger: 'blur' }]
})
const roleList = ref([])

onMounted(() => {
  RoleService.queryRoleAll().then((response) => {
    roleList.value = response.result
  })
})

/**
 * 提交表单
 */
const submitForm = async () => {
  // 表单校验
  const error = await elformRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  if (error) {
    ElMessage({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
    return
  }
  // 新增分组
  await GroupService.createGroup(formData.value)
  // 成功提示
  ElMessage({ message: '新增成功', type: 'info', duration: 2 * 1000 })
  // 关闭dialog
  emit('update:model-value', false)
  // 重新查询列表
  emit('re-query')
}
</script>

<style lang="scss" scoped></style>
