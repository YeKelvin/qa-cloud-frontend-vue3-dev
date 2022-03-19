<template>
  <el-dialog title="编辑角色" width="50%" center @close="$emit('update:model-value', false)">
    <el-form ref="form" label-width="100px" style="width: 100%" inline-message :model="form" :rules="formRules">
      <el-form-item label="角色名称：" prop="roleName">
        <el-input v-model="form.roleName" clearable />
      </el-form-item>
      <el-form-item label="角色代码：" prop="roleCode">
        <el-input v-model="form.roleCode" clearable />
      </el-form-item>
      <el-form-item label="角色等级：" prop="roleRank">
        <el-input v-model="form.roleRank" clearable />
      </el-form-item>
      <el-form-item label="角色备注：" prop="roleDesc">
        <el-input v-model="form.roleDesc" clearable />
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

export default {
  name: 'RoleModifyDialog',
  props: {
    row: { type: Object, default: () => {} }
  },
  emits: ['update:model-value', 're-query'],
  data() {
    return {
      form: {
        roleNo: '',
        roleName: '',
        roleCode: '',
        roleRank: 1,
        roleDesc: ''
      },
      formRules: {
        roleName: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
        roleCode: [{ required: true, message: '角色代码不能为空', trigger: 'blur' }],
        roleRank: [{ required: true, message: '角色等级不能为空', trigger: 'blur' }]
      }
    }
  },
  watch: {
    row(val) {
      if (!val) return
      this.form = val
    }
  },
  methods: {
    /**
     * 提交表单
     */
    async submitForm() {
      let error = false
      // 表单校验
      error = await this.$refs.form
        .validate()
        .then(() => false)
        .catch(() => true)
      if (error) {
        this.$message({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
        return
      }
      // 二次确认
      error = await this.$confirm('确定修改吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => false)
        .catch(() => true)
      if (error) return
      // 修改角色
      await RoleService.modifyRole(this.form)
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
