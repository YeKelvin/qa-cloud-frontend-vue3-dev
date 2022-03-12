<template>
  <div class="pymeter-component-container" style="padding-bottom: 40px">
    <!-- 模板名称和操作按钮 -->
    <div class="header-container">
      <!-- 模板名称 -->
      <el-form
        ref="elformRef"
        label-position="right"
        label-width="100px"
        style="flex-grow: 1; margin-right: 10px"
        inline-message
        :model="templateForm"
        :rules="templateFormRules"
      >
        <el-form-item label="模板名称：" prop="templateName">
          <span v-if="queryMode">{{ templateForm.templateName }}</span>
          <el-input v-else v-model="templateForm.templateName" placeholder="请输入模板名称" clearable />
        </el-form-item>
      </el-form>

      <!-- 操作按钮 -->
      <span>
        <template v-if="queryMode">
          <el-button type="text" :icon="Edit" @click="editNow">批量编辑</el-button>
          <el-button type="text" :icon="Close" @click="closeTab">关闭</el-button>
        </template>
        <template v-else-if="!createMode">
          <el-button type="text" :icon="Check" @click="saveHeaders">保存</el-button>
          <el-button type="text" :icon="Close" @click="cancelEdit">取消</el-button>
        </template>
        <template v-else>
          <el-button type="text" :icon="Check" @click="createHeaders">提交</el-button>
        </template>
      </span>
    </div>

    <!-- 请求头表格 -->
    <el-table ref="table" :data="rows" fit stripe highlight-current-row>
      <!-- 数据为空时显示添加按钮 -->
      <template #empty><el-empty description=" " /></template>

      <!-- 是否启用 -->
      <el-table-column v-if="queryMode" label="启用" align="center" width="50" min-width="10">
        <template #default="{ row }">
          <el-checkbox v-model="row.enabled" @click.prevent="modifyHeaderState(row)" />
        </template>
      </el-table-column>

      <!-- 表格序号 -->
      <el-table-column type="index" label="序号" align="center" />

      <!-- 请求头名称 -->
      <el-table-column label="名称">
        <template #default="{ row }">
          <base-textarea v-if="!queryMode || row.editing" v-model="row.headerName" />
          <span v-else>{{ row.headerName }}</span>
        </template>
      </el-table-column>

      <!-- 请求头的值 -->
      <el-table-column label="值">
        <template #default="{ row }">
          <base-textarea v-if="!queryMode || row.editing" v-model="row.headerValue" />
          <span v-else>{{ row.headerValue }}</span>
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column fixed="right" align="center" width="80" min-width="80">
        <!-- 操作列表格头，新增请求头按钮 -->
        <template #header>
          <el-button type="text" :icon="Plus" :disabled="!queryMode" @click="newAndEditHeader">添加</el-button>
        </template>
        <!-- 操作按钮 -->
        <template #default="{ $index, row }">
          <!-- 编辑或新增模式下可用的按钮 -->
          <!-- 删除请求头按钮 -->
          <el-button v-if="!queryMode" type="text" :icon="Close" @click="cancelHeader($index, row)" />
          <!-- 查询模式下可用的按钮 -->
          <template v-if="queryMode">
            <!-- 编辑单行请求头按钮 -->
            <el-button v-if="!row.editing" type="text" :icon="Edit" @click="$set(row, 'editing', true)" />
            <!-- 取消单行编辑按钮 -->
            <el-button v-if="row.editing" type="text" :icon="Close" @click="queryHeaders()" />
            <!-- 提交单行编辑按钮 -->
            <el-button v-if="row.editing" type="text" :icon="Check" @click="submitSingleHeader(row)" />
            <!-- 删除请求头按钮 -->
            <el-button v-if="!row.editing" type="text" :icon="Delete" @click="removeHeader($index, row)" />
          </template>
        </template>
      </el-table-column>
    </el-table>
    <!-- 底部添加按钮 -->
    <el-button v-show="queryMode" type="text" :icon="Plus" @click="newAndEditHeader">添加</el-button>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import BaseTextarea from '@/components/BaseTextarea'
import EditorMixin from '@/pymeter/components/mixins/editor-mixin'
import * as HttpHeadersService from '@/api/script/headers'
import * as StringUtil from '@/utils/string-util'
import * as ObjectUtil from '@/utils/object-util'

export default {
  name: 'HttpHeadersTemplateEditor',

  components: { BaseTextarea },

  mixins: [EditorMixin],

  data() {
    return {
      templateNo: this.editorNo,
      templateForm: {
        templateName: this.metadata.templateName,
        templateDesc: this.metadata.templateDesc
      },
      templateFormRules: {
        templateName: [{ required: true, message: '模板名称不能为空', trigger: 'blur' }]
      },
      rows: [],
      pendingDeletionList: []
    }
  },

  computed: {
    ...mapState('workspace', {
      workspaceNo: (state) => state.workspaceNo
    })
  },

  watch: {
    queryMode(val) {
      // 动态显隐表格列后重新渲染表格
      this.$nextTick(() => {
        this.$refs.table.doLayout()
      })
      // 表格没有数据时自动添加一行
      if (!val && this.rows.length === 0) {
        this.newHeader()
      }
    },
    rows: {
      handler(val) {
        if (this.queryMode) return
        if (val.length === 0) {
          this.newHeader()
        } else if (val.length > 0 && this.isNotBlankRow(val[val.length - 1])) {
          this.newHeader()
        }
      },
      deep: true
    }
  },

  mounted() {
    // 查询或编辑模式时先拉取请求头模板信息
    if (this.queryMode || this.modifyMode) {
      this.queryHeaders()
    }
    if (this.createMode) {
      this.newHeader()
    }
  },

  methods: {
    /**
     * 查询模板下的所有请求头
     */
    queryHeaders() {
      HttpHeadersService.queryHttpHeadersByTemplate({ templateNo: this.templateNo }).then((response) => {
        this.rows = response.result
        this.pendingDeletionList = []
      })
    },

    /**
     * 新增一行空行
     */
    newHeader() {
      this.rows.push({ headerName: '', headerValue: '', headerDesc: '', enabled: true })
    },

    /**
     * 新增一行空行并滚动至底部
     */
    newAndEditHeader() {
      this.rows.push({ headerName: '', headerValue: '', headerDesc: '', enabled: true, editing: true })
      const scrollbar = document.querySelector('#editor-main-scrollbar > .el-scrollbar__wrap')
      scrollbar.scrollTop = scrollbar.scrollHeight
    },

    /**
     * 根据索引号删除行
     */
    cancelHeader(index, row) {
      if (ObjectUtil.hasOwnProp(row, 'headerNo')) {
        // 存在 headerNo 时，添加至待删除列表中，等待提交时调用批量删除请求头接口
        this.pendingDeletionList.push(row)
        this.rows.splice(index, 1)
      } else {
        // 没有 headerNo 时，代表数据库中没有该请求头，直接移出提交列表
        this.rows.splice(index, 1)
      }
    },

    /**
     * 新增或修改单个请求头
     */
    submitSingleHeader(row) {
      if (StringUtil.isBlank(row.headerName)) {
        this.$message({ message: '请求头不允许为空', type: 'error', duration: 2 * 1000 })
        return
      }

      if (StringUtil.isNotBlank(row.headerNo)) {
        // 修改请求头
        HttpHeadersService.modifyHttpHeader({
          headerNo: row.headerNo,
          headerName: row.headerName,
          headerValue: row.headerValue,
          headerDesc: row.headerDesc
        }).then(() => {
          this.$message({ message: '修改成功', type: 'info', duration: 1 * 1000 })
          this.queryHeaders()
        })
      } else {
        // 新增请求头
        HttpHeadersService.createHttpHeader({
          templateNo: this.templateNo,
          headerName: row.headerName,
          headerValue: row.headerValue,
          headerDesc: row.headerDesc
        }).then(() => {
          // 成功提示
          this.$message({ message: '新增成功', type: 'info', duration: 1 * 1000 })
          // 重新查询请求头
          this.queryHeaders()
        })
      }
    },

    /**
     * 根据索引号删除行
     */
    async removeHeader(index, row) {
      // 删除前二次确认
      if (!(await this.deletionComfirm(row.headerName))) return
      try {
        // 删除请求头
        await HttpHeadersService.deleteHttpHeader({ headerNo: row.headerNo })
        // 删除请求头所在行数据
        this.rows.splice(index, 1)
      } catch {
        return
      }
    },

    /**
     * 修改请求头启用状态
     */
    modifyHeaderState(row) {
      // 切换请求头状态
      row.enabled = !row.enabled
      // 调用接口变更请求头状态
      if (row.enabled) {
        HttpHeadersService.enableHttpHeader({ headerNo: row.headerNo })
      } else {
        HttpHeadersService.disableHttpHeader({ headerNo: row.headerNo })
      }
    },

    async deletionComfirm(...args) {
      const h = this.$createElement
      const msgList = [h('p', null, '确定删除以下请求头吗？')]
      args.forEach((item) => msgList.push(h('p', null, item)))
      try {
        await this.$confirm(null, {
          title: '警告',
          message: h('div', null, msgList),
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        })
        return true
      } catch {
        return false
      }
    },

    /**
     * 保存编辑后的请求头
     * TODO: 提交前过滤空行
     */
    async saveVariables() {
      try {
        // 待删除列表非空时，需要二次确认
        if (this.pendingDeletionList.length > 0) {
          // 删除前二次确认
          if (!(await this.deletionComfirm(...this.pendingDeletionList.map((item) => item.headerName)))) return

          // 批量删除请求头
          await HttpHeadersService.deleteHttpHeaders(this.pendingDeletionList.map((item) => item.headerNo))
        }

        // 批量更新请求头
        await HttpHeadersService.modifyHttpHeaders({
          templateNo: this.templateNo,
          templateName: this.templateForm.templateName,
          templateDesc: this.templateForm.templateDesc,
          headerList: [...this.rows]
        })

        // 成功提示
        this.$message({ message: '编辑成功', type: 'info', duration: 1 * 1000 })
        // 重新查询请求头
        this.queryHeaders()
        // 切换为只读模式
        this.setReadonly()
        // 重新加载列表
        this.$store.dispatch('pymeter/queryHttpHeaderTemplateAll')
      } catch {
        return
      }
    },

    /**
     * 新增模板和请求头
     * TODO: 提交前过滤空行
     */
    async createHeaders() {
      try {
        // 批量新增请求头
        await HttpHeadersService.createHttpHeaders({
          workspaceNo: this.workspaceNo,
          ...this.templateForm,
          headerList: this.rows
        })

        // 成功提示
        this.$message({ message: '新增成功', type: 'info', duration: 2 * 1000 })
        // 切换为只读模式
        this.setReadonly()
        // 重新加载列表
        this.$store.dispatch('pymeter/queryHttpHeaderTemplateAll')
        // 关闭tab
        this.$store.commit('pymeter/removeTab', { editorNo: 'UNSAVED_HTTP_HEADERS_TEMPLATE' })
      } catch {
        return
      }
    },

    /**
     * 取消编辑
     */
    cancelEdit() {
      this.queryHeaders()
      this.setReadonly()
    },

    /**
     * 判断是否为空行
     */
    isBlankRow(row) {
      return StringUtil.isBlankAll(row.headerName, row.headerValue, row.headerDesc)
    },

    /**
     * 判断是否为非空行
     */
    isNotBlankRow(row) {
      return !this.isBlankRow(row)
    }
  }
}
</script>

<style lang="scss" scoped>
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;

  width: 100%;
  padding: 0 15px;
  margin-bottom: 10px;

  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}

span {
  overflow: hidden;
  white-space: pre-wrap;
  text-overflow: ellipsis;
  letter-spacing: 0.6px;
}
</style>
