<template>
  <el-dialog title="编辑用户" width="50%" center v-bind="$attrs">
    <el-form ref="form" label-width="auto" style="width: 100%" inline-message :model="form" :rules="formRules">
      <el-form-item label="用户名称：" prop="userName">
        <el-input v-model="form.userName" clearable />
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
        <el-button type="danger" @click="submitForm()">保 存</el-button>
        <el-button @click="$emit('update:model-value', false)">取 消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import * as RoleService from '@/api/usercenter/role'
import * as UserService from '@/api/usercenter/user'

export default {
  name: 'UserModifyDialog',
  props: {
    row: { type: Object, default: () => {} }
  },
  emits: ['update:model-value', 're-query'],
  data() {
    return {
      form: {
        userNo: '',
        userName: '',
        password: '',
        mobileNo: '',
        email: '',
        roleNumberList: []
      },
      formRules: {
        userName: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
        roleNumberList: [{ required: true, message: '用户角色不能为空', trigger: 'blur' }]
      },
      roleList: []
    }
  },
  mounted() {
    this.form = this.$_.omit(this.row, ['roles'])
    // 查询所有角色
    RoleService.queryRoleAll().then((response) => {
      this.roleList = response.result
      this.form.roleNumberList = this.row.roles.map((item) => item.roleNo)
    })
  },
  methods: {
    /**
     * 提交表单
     */
    async submitForm() {
      // 表单校验
      await this.$refs.form.validate().catch(() => {
        this.$message({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
      })
      // 二次确认
      await this.$confirm('确定修改吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      // 修改用户
      await UserService.modifyUser(this.form)
      // 成功提示
      this.$message({ message: '编辑成功', type: 'info', duration: 2 * 1000 })
      // 关闭dialog
      this.$emit('update:model-value', false)
      // 重新查询列表
      this.$emit('re-query')
    }
  }
}
</script>

<style lang="scss" scoped></style>
