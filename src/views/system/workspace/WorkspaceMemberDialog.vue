<template>
  <el-dialog title="成员管理" width="50%" center v-bind="$attrs" @close="$emit('update:model-value', false)">
    <div style="display: flex; flex: 1; flex-direction: column">
      <el-transfer
        v-model="memberList"
        style="display: flex; justify-content: center; align-items: center"
        filterable
        :titles="['用户', '空间成员']"
        :button-texts="['移除', '加入']"
        :data="users"
      >
        <template #default="{ option }">
          <span>{{ option.label }}</span>
        </template>
      </el-transfer>

      <div style="display: flex; justify-content: center; align-items: center; margin-top: 10px">
        <el-button type="primary" @click="save">保 存</el-button>
        <el-button @click="$emit('update:model-value', false)">关 闭</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import * as UserService from '@/api/usercenter/user'
import * as WorkspaceService from '@/api/public/workspace'

export default {
  name: 'WorkspaceMemberDialog',
  props: {
    row: { type: Object, default: () => ({}) }
  },
  emits: ['update:model-value', 're-query'],
  data() {
    return {
      userList: [],
      memberList: []
    }
  },
  computed: {
    users() {
      const data = []
      this.userList.forEach((item) => {
        data.push({
          key: item.userNo,
          label: item.userName,
          disabled: item.state !== 'ENABLE'
        })
      })
      return data
    }
  },
  mounted() {
    this.queryUserAll()
    this.queryWorkspaceUserAll()
  },
  methods: {
    /**
     * 查询所有用户
     */
    queryUserAll() {
      UserService.queryUserAll().then((response) => {
        this.userList = response.result
      })
    },

    /**
     * 查询所有空间
     */
    queryWorkspaceUserAll() {
      WorkspaceService.queryWorkspaceUserAll({ workspaceNo: this.row.workspaceNo }).then((response) => {
        this.memberList = response.result.map((item) => item.userNo)
      })
    },

    /**
     * 修改空间成员
     */
    save() {
      WorkspaceService.modifyWorkspaceUser({ workspaceNo: this.row.workspaceNo, userNumberList: this.memberList }).then(
        () => {
          // 成功提示
          this.$message({ message: '编辑成功', type: 'info', duration: 2 * 1000 })
          // 关闭dialog
          this.$emit('update:model-value', false)
          // 重新查询列表
          this.$emit('re-query')
        }
      )
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.el-transfer-panel) {
  min-width: 200px;
  max-width: 400px;
  width: 300px;
}
</style>
