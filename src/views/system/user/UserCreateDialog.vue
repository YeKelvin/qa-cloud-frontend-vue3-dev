<template>
  <el-dialog title="用户注册" width="50%" center v-bind="$attrs" @close="$emit('update:model-value', false)">
    <el-form ref="form" label-width="100px" style="width: 100%" inline-message :model="form" :rules="formRules">
      <el-form-item label="用户名称：" prop="userName">
        <el-input v-model="form.userName" clearable />
      </el-form-item>
      <el-form-item label="登录账号：" prop="loginName">
        <el-input v-model="form.loginName" clearable />
      </el-form-item>
      <el-form-item label="登录密码：" prop="password">
        <el-input v-model="form.password" clearable />
      </el-form-item>
      <el-form-item label="手机号：" prop="mobileNo">
        <el-input v-model="form.mobileNo" clearable />
      </el-form-item>
      <el-form-item label="邮箱：" prop="email">
        <el-input v-model="form.email" clearable />
      </el-form-item>
      <el-form-item label="用户角色：" prop="roleNumberList">
        <el-select v-model="form.roleNumberList" multiple clearable placeholder="用户角色" style="width: 100%">
          <el-option v-for="role in roleList" :key="role.roleNo" :label="role.roleName" :value="role.roleNo" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm()">提 交</el-button>
        <el-button @click="$refs.form.resetFields()">重 置</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import * as RoleService from '@/api/usercenter/role'
import * as UserService from '@/api/usercenter/user'

export default {
  name: 'UserCreateDialog',
  emits: ['update:model-value', 're-query'],
  data() {
    return {
      form: {
        userName: '',
        loginName: '',
        password: '',
        mobileNo: '',
        email: '',
        roleNumberList: []
      },
      formRules: {
        userName: [{ required: true, message: '用户名称不能为空', trigger: 'blur' }],
        loginName: [{ required: true, message: '登录账号不能为空', trigger: 'blur' }],
        password: [
          { required: true, message: '密码不能为空', trigger: 'blur' },
          { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
        ],
        roleNumberList: [{ required: true, message: '用户角色不能为空', trigger: 'blur' }]
      },
      roleList: []
    }
  },
  mounted() {
    RoleService.queryRoleAll().then((response) => {
      this.roleList = response.result
    })
  },
  methods: {
    /**
     * 提交表单
     */
    async submitForm() {
      // 表单校验
      const error = await this.$refs.form
        .validate()
        .then(() => false)
        .catch(() => true)
      if (error) {
        this.$message({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
        return
      }
      // 新增用户
      await UserService.register(this.form)
      // 成功提示
      this.$message({ message: '注册成功', type: 'info', duration: 2 * 1000 })
      // 关闭dialog
      this.$emit('update:model-value', false)
      // 重新查询列表
      this.$emit('re-query')
    }
  }
}
</script>

<style lang="scss" scoped></style>
