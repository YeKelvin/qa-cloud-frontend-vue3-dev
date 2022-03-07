<template>
  <!-- 请求头模板卡片 -->
  <el-card shadow="hover" :body-style="{ padding: '10px' }">
    <!-- 卡片头 -->
    <span slot="header">模板</span>

    <el-tag v-if="showWarning" type="danger" style="margin-bottom: 10px">
      警告：部分请求头模板不属于此工作空间，请重新编辑
    </el-tag>

    <!-- 请求头模板列表 -->
    <el-select
      v-model="localValue"
      placeholder="请求头模板"
      style="width: 100%"
      multiple
      :disabled="queryMode"
      v-bind="$attrs"
      @change="handleChange"
    >
      <el-option
        v-for="item in httpHeaderTemplateList"
        :key="item.templateNo"
        :label="item.templateName"
        :value="item.templateNo"
      />
    </el-select>

    <!-- 查看详情按钮 -->
    <el-button
      v-if="!showDetails"
      type="text"
      icon="el-icon-arrow-down"
      :disabled="localValue.length == 0"
      @click="showHeaders"
    >
      查看详情
    </el-button>

    <!-- 模板下的请求头表格 -->
    <el-table v-else-if="headerRows.length > 0" style="width: 100%; margin-bottom: 10px" stripe :data="headerRows">
      <!-- header名称 -->
      <el-table-column prop="headerName" label="名称" />
      <!-- header值 -->
      <el-table-column prop="headerValue" label="值" />
    </el-table>
  </el-card>
</template>

<script>
import { mapState } from 'vuex'
import * as HeadersService from '@/api/script/headers'

export default {
  name: 'HttpHeadersTemplate',

  inheritAttrs: false,

  props: {
    editMode: { type: String, default: 'QUERY' }
  },

  data() {
    return {
      headerRows: [],
      showDetails: false
    }
  },

  computed: {
    ...mapState('workspace', {
      workspaceNo: (state) => state.workspaceNo
    }),
    httpHeaderTemplateList() {
      return this.$store.state.pymeter.httpHeaderTemplateList
    },
    templateNumberList() {
      return this.httpHeaderTemplateList.map((item) => item.templateNo)
    },
    localValue: {
      get() {
        return this.$attrs.value
      },
      set(val) {
        this.$emit('input', val)
      }
    },
    showWarning() {
      for (const templateNo of this.localValue) {
        if (!this.templateNumberList.includes(templateNo)) {
          return true
        }
      }
      return false
    },
    queryMode() {
      return this.editMode === 'QUERY'
    }
  },

  methods: {
    /**
     * 查询请求头模板下的所有请求头
     */
    queryHttpHeaders() {
      HeadersService.queryHttpHeaders([...this.localValue]).then((response) => {
        this.headerRows = response.result
      })
    },

    /**
     * 选择变更事件
     */
    handleChange() {
      this.$nextTick(() => {
        if (!this.showDetails) return
        this.queryHttpHeaders()
      })
    },

    showHeaders() {
      this.queryHttpHeaders()
      this.showDetails = true
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.el-card__header) {
  user-select: none;
  padding: 5px 10px;
}
</style>
