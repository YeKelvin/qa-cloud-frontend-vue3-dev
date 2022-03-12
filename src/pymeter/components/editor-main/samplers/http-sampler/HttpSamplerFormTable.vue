<template>
  <el-table stripe style="width: 100%; margin-bottom: 10px" v-bind="$attrs">
    <!-- 空表格 -->
    <el-empty slot="empty" :image-size="80">
      <el-button slot="description" type="text" :icon="Plus" :disabled="queryMode" @click="newItem">添加</el-button>
    </el-empty>

    <!-- 是否启用 -->
    <el-table-column label="启用" align="center" width="50" min-width="10">
      <template #default="scope">
        <el-checkbox v-model="scope.row.enabled" :disabled="queryMode" />
      </template>
    </el-table-column>

    <!-- 键名 -->
    <el-table-column label="键名" width="auto">
      <template #default="scope">
        <el-input v-model="scope.row.name" :readonly="queryMode" type="textarea" rows="1" autosize />
      </template>
    </el-table-column>

    <!-- 键值 -->
    <el-table-column label="键值" width="auto">
      <template #default="scope">
        <el-input v-model="scope.row.value" :readonly="queryMode" type="textarea" rows="1" autosize />
      </template>
    </el-table-column>

    <!-- 键值描述 -->
    <el-table-column label="描述" width="auto">
      <template #default="scope">
        <el-input v-model="scope.row.desc" :readonly="queryMode" type="textarea" rows="1" autosize />
      </template>
    </el-table-column>

    <!-- 操作列 -->
    <el-table-column fixed="right" align="center" width="50" min-width="10">
      <template v-slot:header="scope" >
        <el-button type="text" :icon="Plus" :disabled="queryMode" @click="newItem" />
      </template>
      <template #default="scope">
        <el-button type="text" :icon="Delete" :disabled="queryMode" @click="removeItem(scope.$index)" />
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'HttpFormTable',

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
    newItem() {
      this.$attrs.data.push({ enabled: true, name: '', value: '', desc: '' })
    },
    removeItem(index) {
      this.$attrs.data.splice(index, 1)
    }
  }
}
</script>

<style lang="scss" scoped></style>
