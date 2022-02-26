<template>
  <el-dialog title="编辑权限" width="50%" center v-bind="$attrs" @close="$emit('update:model-value', false)">
    <el-form ref="form" label-width="100px" style="width: 100%" inline-message :model="form" :rules="formRules">
      <el-form-item label="权限名称：" prop="permissionName">
        <el-input v-model="form.permissionName" clearable />
      </el-form-item>
      <el-form-item label="权限描述：" prop="permissionDesc">
        <el-input v-model="form.permissionDesc" clearable />
      </el-form-item>
      <el-form-item label="请求方法：" prop="method">
        <el-select v-model="form.method" clearable style="width: 100%">
          <el-option v-for="(value, key) in HttpMethods" :key="key" :label="value" :value="value" />
        </el-select>
      </el-form-item>
      <el-form-item label="请求路由：" prop="endpoint">
        <el-input v-model="form.endpoint" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="danger" @click="submitForm()">保 存</el-button>
        <el-button @click="$emit('update:model-value', false)">取 消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import * as UsercenterService from '@/api/usercenter'
import { HttpMethods } from '@/api/enum'

export default {
  name: 'PermissionModifyDialog',
  props: {
    row: { type: Object, default: () => {} }
  },
  emits: ['update:model-value', 're-query'],
  data() {
    return {
      HttpMethods: HttpMethods,
      form: {
        permissionNo: '',
        permissionName: '',
        permissionDesc: '',
        method: '',
        endpoint: ''
      },
      formRules: {
        permissionName: [{ required: true, message: '权限名称不能为空', trigger: 'blur' }],
        method: [{ required: true, message: '请求方法不能为空', trigger: 'change' }],
        endpoint: [{ required: true, message: '请求路由不能为空', trigger: 'blur' }]
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
      try {
        // 表单校验
        await this.$refs.form.validate()
        // 二次确认
        await this.$confirm('确定修改吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        // 修改权限
        await UsercenterService.modifyPermission(this.form)
        // 成功提示
        this.$message({ message: '编辑成功', type: 'info', duration: 2 * 1000 })
        // 关闭dialog
        this.$emit('update:model-value', false)
        // 重新查询列表
        this.$emit('re-query')
      } catch {
        this.$message({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
