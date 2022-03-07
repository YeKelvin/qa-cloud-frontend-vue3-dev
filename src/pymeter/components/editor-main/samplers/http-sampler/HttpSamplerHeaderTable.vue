<template>
  <el-card shadow="hover" style="margin: 10px 0" :body-style="{ padding: '10px' }">
    <span slot="header">自定义</span>
    <el-table stripe style="width: 100%; margin-bottom: 10px" v-bind="$attrs">
      <!-- 空表格 -->
      <el-empty slot="empty" :image-size="80">
        <el-button slot="description" type="text" icon="el-icon-plus" :disabled="queryMode" @click="newHeader">
          添加
        </el-button>
      </el-empty>

      <!-- 是否启用 -->
      <el-table-column label="启用" align="center" width="50" min-width="10">
        <template #default="scope">
          <el-checkbox v-model="scope.row.enabled" :disabled="queryMode" />
        </template>
      </el-table-column>

      <!-- header名称 -->
      <el-table-column label="名称" width="auto">
        <template #default="scope">
          <el-input v-model="scope.row.name" :readonly="queryMode" type="textarea" rows="1" autosize />
        </template>
      </el-table-column>

      <!-- header值 -->
      <el-table-column label="值" width="auto">
        <template #default="scope">
          <el-input v-model="scope.row.value" :readonly="queryMode" type="textarea" rows="1" autosize />
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column fixed="right" align="center" width="50" min-width="10">
        <!-- eslint-disable-next-line -->
      <template slot="header" slot-scope="scope">
          <el-button type="text" icon="el-icon-plus" :disabled="queryMode" @click="newHeader" />
        </template>
        <template #default="scope">
          <el-button type="text" icon="el-icon-delete" :disabled="queryMode" @click="removeHeader(scope.$index)" />
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script>
export default {
  name: 'HttpHeaderTable',

  inheritAttrs: false,

  props: {
    editMode: { type: String, default: 'QUERY' }
  },

  computed: {
    queryMode() {
      return this.editMode === 'QUERY'
    }
  },

  methods: {
    newHeader() {
      this.$attrs.data.push({ enabled: true, name: '', value: '' })
    },
    removeHeader(index) {
      this.$attrs.data.splice(index, 1)
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.el-card__header) {
  user-select: none;
  padding: 5px 10px;
}

:deep(.el-empty__description) {
  margin-top: 0;
}

.el-empty {
  padding: 0;
  padding-top: 20px;
}

.el-table {
  &::before {
    height: 0;
  }
}
</style>
