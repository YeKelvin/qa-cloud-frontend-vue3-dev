<template>
  <el-dialog title="编辑用户" width="50%" center @close="$emit('update:model-value', false)">
    <el-form
      ref="elformRef"
      label-width="100px"
      style="width: 100%; padding-right: 30px"
      inline-message
      :model="formData"
      :rules="formRules"
    >
      <el-form-item label="用户名称：" prop="userName">
        <el-input v-model="formData.userName" clearable />
      </el-form-item>
      <el-form-item label="手机号：" prop="mobileNo">
        <el-input v-model="formData.mobileNo" clearable />
      </el-form-item>
      <el-form-item label="邮箱：" prop="email">
        <el-input v-model="formData.email" clearable />
      </el-form-item>
      <el-form-item label="用户角色：" prop="roleNumberList">
        <el-select v-model="formData.roleNumberList" multiple clearable placeholder="用户角色" style="width: 100%">
          <el-option v-for="role in roleList" :key="role.roleNo" :label="role.roleName" :value="role.roleNo" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="danger" @click="submitForm()">保 存</el-button>
        <el-button @click="$emit('update:model-value', false)">取 消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { omit as _omit } from 'lodash-es'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as RoleService from '@/api/usercenter/role'
import * as UserService from '@/api/usercenter/user'

const emit = defineEmits(['update:model-value', 're-query'])
const props = defineProps({
  row: { type: Object, default: () => {} }
})
const elformRef = ref()
const formData = ref({
  userNo: '',
  userName: '',
  password: '',
  mobileNo: '',
  email: '',
  roleNumberList: []
})
const formRules = reactive({
  userName: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
  roleNumberList: [{ required: true, message: '用户角色不能为空', trigger: 'blur' }]
})
const roleList = ref([])

onMounted(() => {
  // 除 roles 属性外其余赋值给 form
  formData.value = _omit(props.row, ['roles'])
  // 提取 roleNo
  formData.value.roleNumberList = props.row.roles.map((item) => item.roleNo)
  // 查询所有角色
  RoleService.queryRoleAll().then((response) => {
    roleList.value = response.result
  })
})

/**
 * 提交表单
 */
const submitForm = async () => {
  let error = false
  // 表单校验
  error = await elformRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  if (error) {
    ElMessage({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
    return
  }
  // 二次确认
  error = await ElMessageBox.confirm('确定修改吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => false)
    .catch(() => true)
  if (error) return
  // 修改用户
  await UserService.modifyUser(formData.value)
  // 成功提示
  ElMessage({ message: '编辑成功', type: 'info', duration: 2 * 1000 })
  // 关闭dialog
  emit('update:model-value', false)
  // 重新查询列表
  emit('re-query')
}
</script>

<style lang="scss" scoped></style>
