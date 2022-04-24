<template>
  <el-dialog title="新增空间限制" width="50%" center @close="$emit('update:model-value', false)">
    <el-form
      ref="elformRef"
      label-width="120px"
      style="width: 100%; padding-right: 30px"
      inline-message
      :model="formData"
      :rules="formRules"
    >
      <el-form-item label="匹配方法：" prop="matchMethod">
        <el-select v-model="formData.matchMethod" style="width: 100%">
          <el-option v-for="(value, key) in MatchMethod" :key="key" :label="value" :value="key" />
        </el-select>
      </el-form-item>
      <el-form-item label="匹配类型：" prop="matchType">
        <el-select v-model="formData.matchType" style="width: 100%" clearable>
          <el-option v-for="(value, key) in MatchType" :key="key" :label="value" :value="key" />
        </el-select>
      </el-form-item>
      <el-form-item label="匹配内容：" prop="matchContent">
        <el-input v-model="formData.matchContent" clearable />
      </el-form-item>
      <el-form-item label="豁免成员：" prop="exemptionUserNumberedList">
        <el-select
          v-model="formData.exemptionUserNumberedList"
          style="width: 100%"
          tag-type="danger"
          filterable
          multiple
        >
          <el-option v-for="user in userList" :key="user.userNo" :label="user.userName" :value="user.userNo" />
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
import { MatchMethod, MatchType } from '@/api/enum'
import * as UserService from '@/api/usercenter/user'
import * as WorkspaceService from '@/api/public/workspace'

const emit = defineEmits(['update:model-value', 're-query'])
const route = useRoute()
const workspaceNo = ref(route.query.workspaceNo)
const userList = ref([])
const formData = ref({
  workspaceNo: workspaceNo.value,
  matchMethod: '',
  matchType: '',
  matchContent: '',
  exemptionUserNumberedList: [],
  exemptionGroupNumberedList: []
})
const formRules = reactive({
  matchMethod: [{ required: true, message: '匹配方法不能为空', trigger: 'blur' }],
  matchType: [{ required: true, message: '匹配类型不能为空', trigger: 'blur' }]
})
const elformRef = ref()

onMounted(() => {
  queryUserAll()
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
  // 新增空间限制
  await WorkspaceService.createWorkspaceRestriction(formData.value)
  // 成功提示
  ElMessage({ message: '新增成功', type: 'info', duration: 2 * 1000 })
  // 关闭dialog
  emit('update:model-value', false)
  // 重新查询列表
  emit('re-query')
}
</script>

<style lang="scss" scoped></style>
