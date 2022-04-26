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
      <el-form-item label="豁免分组：" prop="exemptionGroupNumberedList">
        <el-select
          v-model="formData.exemptionGroupNumberedList"
          style="width: 100%"
          tag-type="danger"
          filterable
          multiple
        >
          <el-option v-for="group in groupList" :key="group.groupNo" :label="group.groupName" :value="group.groupNo" />
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { MatchMethod, MatchType } from '@/api/enum'
import * as GroupService from '@/api/usercenter/group'
import * as UserService from '@/api/usercenter/user'
import * as WorkspaceService from '@/api/public/workspace'

const emit = defineEmits(['update:model-value', 're-query'])
const props = defineProps({
  row: { type: Object, default: () => ({}) }
})
const formData = ref({
  restrictionNo: '',
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
const userList = ref([])
const groupList = ref([])

onMounted(() => {
  formData.value.restrictionNo = props.row.restrictionNo
  formData.value.matchMethod = props.row.matchMethod
  formData.value.matchType = props.row.matchType
  formData.value.matchContent = props.row.matchContent
  formData.value.exemptionUserNumberedList = props.row.exemptionUserList.map((item) => item.userNo)
  formData.value.exemptionGroupNumberedList = props.row.exemptionGroupList.map((item) => item.groupNo)
  // 查询所有用户
  UserService.queryUserAll().then((response) => {
    userList.value = response.result
  })
  // 查询所有分组
  GroupService.queryGroupAll().then((response) => {
    groupList.value = response.result
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
  error = await ElMessageBox.confirm('确定修改吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => false)
    .catch(() => true)
  if (error) return
  // 修改空间限制
  await WorkspaceService.modifyWorkspaceRestriction(formData.value)
  // 成功提示
  ElMessage({ message: '编辑成功', type: 'info', duration: 2 * 1000 })
  // 关闭dialog
  emit('update:model-value', false)
  // 重新查询列表
  emit('re-query')
}
</script>

<style lang="scss" scoped></style>
