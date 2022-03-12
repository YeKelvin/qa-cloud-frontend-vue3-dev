<template>
  <el-table stripe style="width: 100%; margin-bottom: 10px" v-bind="$attrs">
    <!-- 空表格 -->
    <el-empty slot="empty" :image-size="80">
      <el-button slot="description" type="text" :icon="Plus" :disabled="queryMode" @click="newParam">添加</el-button>
    </el-empty>

    <!-- 是否启用 -->
    <el-table-column label="启用" align="center" width="50" min-width="10">
      <template #default="scope">
        <el-checkbox v-model="scope.row.enabled" :disabled="queryMode" />
      </template>
    </el-table-column>

    <!-- 参数名称 -->
    <el-table-column label="名称" width="auto">
      <template #default="scope">
        <el-input v-model="scope.row.name" :readonly="queryMode" type="textarea" rows="1" autosize />
      </template>
    </el-table-column>

    <!-- 参数值 -->
    <el-table-column label="值" width="auto">
      <template #default="scope">
        <el-input v-model="scope.row.value" :readonly="queryMode" type="textarea" rows="1" autosize />
      </template>
    </el-table-column>

    <!-- 参数描述 -->
    <el-table-column label="描述" width="auto">
      <template #default="scope">
        <el-input v-model="scope.row.desc" :readonly="queryMode" type="textarea" rows="1" autosize />
      </template>
    </el-table-column>

    <!-- 操作列 -->
    <el-table-column fixed="right" align="center" width="50" min-width="10">
      <template v-slot:header="scope" >
        <el-button type="text" :icon="Plus" :disabled="queryMode" @click="newParam" />
      </template>
      <template #default="scope">
        <el-button type="text" :icon="Delete" :disabled="queryMode" @click="removeParam(scope.$index)" />
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'HttpParameterTable',

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
    newParam() {
      this.$attrs.data.push({ enabled: true, name: '', value: '', desc: '' })
    },
    removeParam(index) {
      this.$attrs.data.splice(index, 1)
    }
  }
}
</script>

<style lang="scss" scoped></style>
