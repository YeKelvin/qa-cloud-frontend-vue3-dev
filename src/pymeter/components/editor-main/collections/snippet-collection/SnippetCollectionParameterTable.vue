<template>
  <el-table ref="table" style="width: 100%; margin-bottom: 10px" stripe v-bind="$attrs">
    <!-- 空表格 -->
    <template #empty><el-empty description=" " /></template>

    <!-- 参数名称 -->
    <el-table-column label="参数名称" width="auto">
      <template #default="scope">
        <el-input v-if="!queryMode" v-model="scope.row.name" type="textarea" rows="1" autosize />
        <span v-else>{{ scope.row.name }}</span>
      </template>
    </el-table-column>

    <!-- 默认值 -->
    <el-table-column label="默认值" width="auto">
      <template #default="scope">
        <el-input v-if="!queryMode" v-model="scope.row.default" type="textarea" rows="1" autosize />
        <span v-else>{{ scope.row.default }}</span>
      </template>
    </el-table-column>

    <!-- 参数描述 -->
    <el-table-column label="描述" width="auto">
      <template #default="scope">
        <el-input v-if="!queryMode" v-model="scope.row.desc" type="textarea" rows="1" autosize />
        <span v-else>{{ scope.row.desc }}</span>
      </template>
    </el-table-column>

    <!-- 操作列 -->
    <el-table-column v-if="!queryMode" fixed="right" align="center" width="50" min-width="10">
      <!-- eslint-disable-next-line -->
      <template slot="header" slot-scope="scope">
        <el-button type="text" icon="el-icon-plus" :disabled="queryMode" @click="newParam" />
      </template>
      <template #default="scope">
        <el-button type="text" icon="el-icon-delete" :disabled="queryMode" @click="removeParam(scope.$index)" />
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import * as StringUtil from '@/utils/string-util'

export default {
  name: 'SnippetsParamsTable',

  inheritAttrs: false,

  props: {
    editMode: { type: String, default: 'QUERY' }
  },

  computed: {
    queryMode() {
      return this.editMode === 'QUERY'
    }
  },

  watch: {
    queryMode(val) {
      // 动态显隐表格列后重新渲染表格
      this.$nextTick(() => {
        this.$refs.table.doLayout()
      })
      // 表格没有数据时自动添加一行
      if (!val && this.$attrs.data.length === 0) {
        this.newParam()
      }
    },
    '$attrs.data': {
      handler(val) {
        if (this.queryMode) return
        if (val.length === 0) {
          this.newParam()
        } else if (val.length > 0 && this.isNotBlankRow(val[val.length - 1])) {
          this.newParam()
        }
      },
      deep: true
    }
  },

  methods: {
    newParam() {
      this.$attrs.data.push({ name: '', default: '', desc: '' })
    },
    removeParam(index) {
      this.$attrs.data.splice(index, 1)
    },
    isBlankRow(param) {
      return StringUtil.isBlankAll(param.name, param.default, param.desc)
    },
    isNotBlankRow(param) {
      return !this.isBlankRow(param)
    }
  }
}
</script>

<style lang="scss" scoped>
span {
  letter-spacing: 0.6px;
  white-space: pre-wrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
