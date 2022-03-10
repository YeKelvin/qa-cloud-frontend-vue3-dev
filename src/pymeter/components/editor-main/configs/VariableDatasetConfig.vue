<template>
  <div class="pymeter-component-container" style="padding-bottom: 40px">
    <!-- 变量集名称和操作按钮 -->
    <div class="header-container">
      <!-- 变量集名称 -->
      <el-form
        ref="elformRef"
        label-position="right"
        label-width="100px"
        style="flex-grow: 1; margin-right: 10px"
        inline-message
        :model="datasetForm"
        :rules="datasetFormRules"
      >
        <el-form-item label="变量集名称：" prop="datasetName">
          <span v-if="queryMode">{{ datasetForm.datasetName }}</span>
          <el-input v-else v-model="datasetForm.datasetName" placeholder="请输入变量集名称" clearable />
        </el-form-item>
      </el-form>

      <!-- 操作按钮 -->
      <span>
        <template v-if="queryMode">
          <el-button type="text" icon="el-icon-edit" @click="editNow">批量编辑</el-button>
          <el-button type="text" icon="el-icon-close" @click="closeTab">关闭</el-button>
        </template>
        <template v-else-if="!createMode">
          <el-button type="text" icon="el-icon-check" @click="saveVariables">保存</el-button>
          <el-button type="text" icon="el-icon-close" @click="cancelEdit">取消</el-button>
        </template>
        <template v-else>
          <el-button type="text" icon="el-icon-check" @click="createVariables">提交</el-button>
        </template>
      </span>
    </div>

    <!-- 变量表格 -->
    <el-table ref="table" :data="rows" fit stripe highlight-current-row>
      <!-- 数据为空时显示添加按钮 -->
      <template #empty><el-empty description=" " /></template>

      <!-- 是否启用 -->
      <el-table-column v-if="queryMode" label="启用" align="center" width="50" min-width="10">
        <template #default="{ row }">
          <el-checkbox v-model="row.enabled" @click.prevent="modifyVariableState(row)" />
        </template>
      </el-table-column>

      <!-- 表格序号 -->
      <el-table-column type="index" label="序号" align="center" />

      <!-- 变量名称 -->
      <el-table-column label="名称">
        <template #default="{ row }">
          <base-textarea v-if="!queryMode || row.editing" v-model="row.varName" />
          <span v-else>{{ row.varName }}</span>
        </template>
      </el-table-column>

      <!-- 初始值 -->
      <el-table-column label="初始值">
        <template #default="{ row }">
          <base-textarea v-if="!queryMode || row.editing" v-model="row.initialValue" />
          <span v-else>{{ row.initialValue }}</span>
        </template>
      </el-table-column>

      <!-- 当前值 -->
      <el-table-column label="当前值">
        <template #default="{ row }">
          <base-textarea v-if="!queryMode || row.editing" v-model="row.currentValue" />
          <span v-else>{{ row.currentValue }}</span>
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column fixed="right" align="center" width="80" min-width="80">
        <!-- 操作列表格头，新增变量按钮 -->
        <!-- eslint-disable-next-line -->
        <!-- <template slot="header" slot-scope="scope"> -->
        <template #header>
          <el-button type="text" icon="el-icon-plus" :disabled="!queryMode" @click="newAndEditVariable">添加</el-button>
        </template>
        <!-- 操作按钮 -->
        <template #default="{ $index, row }">
          <!-- 编辑或新增模式下可用的按钮 -->
          <!-- 删除变量按钮 -->
          <el-button v-if="!queryMode" type="text" icon="el-icon-close" @click="cancelVariable($index, row)" />
          <!-- 查询模式下可用的按钮 -->
          <template v-if="queryMode">
            <!-- 编辑单行变量按钮 -->
            <el-button v-if="!row.editing" type="text" icon="el-icon-edit" @click="$set(row, 'editing', true)" />
            <!-- 取消单行编辑按钮 -->
            <el-button v-if="row.editing" type="text" icon="el-icon-close" @click="queryVariables()" />
            <!-- 提交单行编辑按钮 -->
            <el-button v-if="row.editing" type="text" icon="el-icon-check" @click="submitSingleVariable(row)" />
            <!-- 删除变量按钮 -->
            <el-button v-if="!row.editing" type="text" icon="el-icon-delete" @click="removeVariable($index, row)" />
          </template>
        </template>
      </el-table-column>
    </el-table>
    <!-- 底部添加按钮 -->
    <el-button v-show="queryMode" type="text" icon="el-icon-plus" @click="newAndEditVariable">添加</el-button>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import BaseTextarea from '@/components/BaseTextarea'
import EditorMixin from '@/pymeter/components/mixins/editor-mixin'
import * as VariablesService from '@/api/script/variables'
import * as StringUtil from '@/utils/string-util'
import * as ObjectUtil from '@/utils/object-util'

export default {
  name: 'VariableDatasetEditor',

  components: { BaseTextarea },

  mixins: [EditorMixin],

  data() {
    return {
      datasetNo: this.editorNo,
      datasetForm: {
        datasetName: this.metadata.datasetName,
        datasetType: this.metadata.datasetType,
        datasetDesc: this.metadata.datasetDesc
      },
      datasetFormRules: {
        datasetName: [{ required: true, message: '变量集名称不能为空', trigger: 'blur' }]
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
        this.newVariable()
      }
    },
    rows: {
      handler(val) {
        if (this.queryMode) return
        if (val.length === 0) {
          this.newVariable()
        } else if (val.length > 0 && this.isNotBlankRow(val[val.length - 1])) {
          this.newVariable()
        }
      },
      deep: true
    }
  },

  mounted() {
    // 查询或编辑模式时先拉取变量信息
    if (this.queryMode || this.modifyMode) {
      this.queryVariables()
    }
    if (this.createMode) {
      this.newVariable()
    }
  },

  methods: {
    /**
     * 查询变量集下的所有变量
     */
    queryVariables() {
      VariablesService.queryVariablesByDataset({ datasetNo: this.datasetNo }).then((response) => {
        this.rows = response.result
        this.pendingDeletionList = []
      })
    },

    /**
     * 新增一行空行
     */
    newVariable() {
      this.rows.push({ varName: '', varDesc: '', initialValue: '', currentValue: '', enabled: true })
    },

    /**
     * 新增一行空行并滚动至底部
     */
    newAndEditVariable() {
      this.rows.push({ varName: '', varDesc: '', initialValue: '', currentValue: '', enabled: true, editing: true })
      const scrollbar = document.querySelector('#editor-main-scrollbar > .el-scrollbar__wrap')
      scrollbar.scrollTop = scrollbar.scrollHeight
    },

    /**
     * 根据索引号删除行
     */
    cancelVariable(index, row) {
      if (ObjectUtil.hasOwnProp(row, 'varNo')) {
        // 存在 varNo 时，添加至待删除列表中，等待提交时调用批量删除变量接口
        this.pendingDeletionList.push(row)
        this.rows.splice(index, 1)
      } else {
        // 没有 varNo 时，代表数据库中没有该变量，直接移出提交列表
        this.rows.splice(index, 1)
      }
    },

    /**
     * 新增或修改单个变量
     */
    submitSingleVariable(row) {
      if (StringUtil.isBlank(row.varName)) {
        this.$message({ message: '变量不允许为空', type: 'error', duration: 2 * 1000 })
        return
      }

      if (StringUtil.isNotBlank(row.varNo)) {
        // 修改变量
        VariablesService.modifyVariable({
          varNo: row.varNo,
          varName: row.varName,
          varDesc: row.varDesc,
          initialValue: row.initialValue,
          currentValue: row.currentValue
        }).then(() => {
          this.$message({ message: '修改成功', type: 'info', duration: 1 * 1000 })
          this.queryVariables()
        })
      } else {
        // 新增变量
        VariablesService.createVariable({
          datasetNo: this.datasetNo,
          varName: row.varName,
          varDesc: row.varDesc,
          initialValue: row.initialValue,
          currentValue: row.currentValue
        }).then(() => {
          // 成功提示
          this.$message({ message: '新增成功', type: 'info', duration: 1 * 1000 })
          // 重新查询变量
          this.queryVariables()
        })
      }
    },

    /**
     * 根据索引号删除行
     */
    async removeVariable(index, row) {
      // 删除前二次确认
      if (!(await this.deletionComfirm(row.varName))) return
      try {
        // 删除变量
        await VariablesService.deleteVariable({ varNo: row.varNo })
        // 删除变量所在行数据
        this.rows.splice(index, 1)
      } catch {
        return
      }
    },

    /**
     * 修改变量启用状态
     */
    modifyVariableState(row) {
      // 切换变量状态
      row.enabled = !row.enabled
      // 调用接口变更变量状态
      if (row.enabled) {
        VariablesService.enableVariable({ varNo: row.varNo })
      } else {
        VariablesService.disableVariable({ varNo: row.varNo })
      }
    },

    async deletionComfirm(...args) {
      const h = this.$createElement
      const msgList = [h('p', null, '确定删除以下变量吗？')]
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
     * 保存编辑后的变量
     * TODO: 提交前过滤空行
     */
    async saveVariables() {
      try {
        // 待删除列表非空时，需要二次确认
        if (this.pendingDeletionList.length > 0) {
          // 删除前二次确认
          if (!(await this.deletionComfirm(...this.pendingDeletionList.map((item) => item.varName)))) return

          // 批量删除变量
          await VariablesService.deleteVariables(this.pendingDeletionList.map((item) => item.varNo))
        }

        // 批量更新变量
        await VariablesService.modifyVariables({
          datasetNo: this.datasetNo,
          datasetName: this.datasetForm.datasetName,
          datasetDesc: this.datasetForm.datasetDesc,
          variableList: this.rows
        })

        // 成功提示
        this.$message({ message: '编辑成功', type: 'info', duration: 1 * 1000 })
        // 重新查询变量
        this.queryVariables()
        // 切换为只读模式
        this.setReadonly()
        // 重新加载列表
        this.$store.dispatch('pymeter/queryDatasetAll')
      } catch {
        return
      }
    },

    /**
     * 新增变量集和变量
     * TODO: 提交前过滤空行
     */
    async createVariables() {
      try {
        // 批量新增变量
        await VariablesService.createVariables({
          workspaceNo: this.workspaceNo,
          ...this.datasetForm,
          variableList: this.rows
        })

        // 成功提示
        this.$message({ message: '新增成功', type: 'info', duration: 2 * 1000 })
        // 切换为只读模式
        this.setReadonly()
        // 重新加载列表
        this.$store.dispatch('pymeter/queryDatasetAll')
        // 关闭tab
        this.$store.commit('pymeter/removeTab', { editorNo: 'UNSAVED_ENVIRONMENT_DATASET' })
        this.$store.commit('pymeter/removeTab', { editorNo: 'UNSAVED_CUSTOM_DATASET' })
      } catch {
        return
      }
    },

    /**
     * 取消编辑
     */
    cancelEdit() {
      this.queryVariables()
      this.setReadonly()
    },

    /**
     * 判断是否为空行
     */
    isBlankRow(row) {
      return StringUtil.isBlankAll(row.varName, row.varDesc, row.initialValue, row.currentValue)
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
