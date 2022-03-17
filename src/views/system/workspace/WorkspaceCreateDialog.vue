<template>
  <el-dialog title="新增工作空间" width="50%" center v-bind="$attrs" @close="$emit('update:model-value', false)">
    <el-form ref="form" label-width="120px" style="width: 100%" inline-message :model="form" :rules="formRules">
      <el-form-item label="空间名称：" prop="workspaceName">
        <el-input v-model="form.workspaceName" clearable />
      </el-form-item>
      <el-form-item label="空间作用域：" prop="workspaceScope">
        <el-select v-model="form.workspaceScope" style="width: 100%">
          <el-option label="私有" value="PRIVATE" />
          <el-option label="保护" value="PROTECTED" />
          <el-option label="公共" value="PUBLIC" />
        </el-select>
      </el-form-item>
      <el-form-item label="空间描述：" prop="workspaceDesc">
        <el-input v-model="form.workspaceDesc" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm()">提 交</el-button>
        <el-button @click="$refs.form.resetFields()">重 置</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import * as WorkspaceService from '@/api/public/workspace'

export default {
  name: 'WorkspaceCreateDialog',
  emits: ['update:model-value', 're-query'],
  data() {
    return {
      form: {
        workspaceName: '',
        workspaceScope: '',
        workspaceDesc: ''
      },
      formRules: {
        workspaceName: [{ required: true, message: '工作空间名称不能为空', trigger: 'blur' }],
        workspaceScope: [{ required: true, message: '工作空间作用域不能为空', trigger: 'blur' }]
      }
    }
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
      // 创建空间
      await WorkspaceService.createWorkspace(this.form)
      // 成功提示
      this.$message({ message: '新增成功', type: 'info', duration: 2 * 1000 })
      // 关闭dialog
      this.$emit('update:model-value', false)
      // 重新查询列表
      this.$emit('re-query')
      // 重新查询工作空间列表
      this.$store.dispatch('workspace/setWorkspaceList')
    }
  }
}
</script>

<style lang="scss" scoped></style>
