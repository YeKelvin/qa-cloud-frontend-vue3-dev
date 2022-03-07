<template>
  <div class="pymeter-component-container">
    <el-form
      ref="elformVNode"
      label-position="right"
      label-width="100px"
      style="width: 100%"
      inline-message
      :model="elementInfo"
      :rules="elementFormRules"
    >
      <!-- 元素名称 -->
      <el-form-item label="名称：" prop="elementName">
        <el-input v-model="elementInfo.elementName" placeholder="元素名称" clearable :readonly="queryMode" />
      </el-form-item>

      <!-- 元素备注 -->
      <el-form-item label="备注：" prop="elementRemark">
        <el-input v-model="elementInfo.elementRemark" placeholder="元素备注" clearable :readonly="queryMode" />
      </el-form-item>

      <!-- 元素属性 -->
      <el-form-item label="顺序执行：" prop="property.TestCollection__serialize_groups">
        <el-switch
          v-model="elementInfo.property.TestCollection__serialize_groups"
          active-color="#13ce66"
          active-value="true"
          inactive-value="false"
          :disabled="true"
        />
      </el-form-item>

      <!-- 延迟 -->
      <el-form-item label="延迟ms：" prop="property.TestCollection__delay">
        <el-input
          v-model="elementInfo.property.TestCollection__delay"
          placeholder="延迟运行"
          clearable
          :disabled="true"
        />
      </el-form-item>

      <!-- 操作按钮 -->
      <el-form-item v-if="queryMode">
        <el-button :icon="Edit" type="primary" @click="editNow()">编 辑</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
        <el-dropdown
          split-button
          trigger="click"
          type="danger"
          style="margin-left: 10px"
          placement="bottom-start"
          @click="executeCollection()"
        >
          <el-icon><Pointer /></el-icon>
          <span style="margin-left: 5px">运 行</span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="queryCollectionJson()">查看JSON</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-form-item>
      <el-form-item v-else-if="modifyMode">
        <el-button :icon="Check" type="danger" @click="modifyCollectionElement()">保 存</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
      </el-form-item>
      <el-form-item v-else-if="createMode">
        <el-button :icon="Check" type="primary" @click="createCollectionElement()">保 存</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
      </el-form-item>
    </el-form>

    <el-dialog v-model="showJsonScript" center title="Json脚本" width="80%">
      <monaco-editor ref="jsonEditor" language="json" style="height: 300px" :read-only="true" />
    </el-dialog>
  </div>
</template>

<script setup>
import { mapState } from 'vuex'
import { Check, Close, Edit, Pointer } from '@element-plus/icons-vue'
import * as ElementService from '@/api/script/element'
import * as ExecutionService from '@/api/script/execution'
import editorProps from '@/pymeter/composables/editor.props'
import useEditor from '@/pymeter/composables/useEditor'
import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'

const props = defineProps(editorProps)
const { editorNo, editorMode, metadata, queryMode, modifyMode, createMode, editNow, setReadonly, updateTab, closeTab } =
  useEditor(props)
</script>

<script>
export default {
  name: 'TestCollection',
  data() {
    return {
      elementNo: this.editorNo,
      elementInfo: {
        elementName: 'Collection',
        elementRemark: '',
        elementType: 'COLLECTION',
        elementClass: 'TestCollection',
        property: {
          TestCollection__serialize_groups: 'true',
          TestCollection__delay: '0'
        }
      },
      elementFormRules: {
        elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }]
      },
      showJsonScript: false
    }
  },

  computed: {
    ...mapState('workspace', {
      workspaceNo: (state) => state.workspaceNo
    }),
    ...mapState('pymeter', {
      selectedDatasetNumberList: (state) => state.selectedDatasetNumberList,
      useCurrentValue: (state) => state.useCurrentValue
    })
  },

  mounted: function () {
    // 查询或更新模式时先拉取元素信息
    if (this.createMode) return
    ElementService.queryElementInfo({ elementNo: this.elementNo }).then((response) => {
      this.elementInfo = response.result
    })
  },

  methods: {
    /**
     * 修改元素信息
     */
    async modifyCollectionElement() {
      // 表单校验
      const error = await this.$refs.elformVNode
        .validate()
        .then(() => false)
        .catch(() => true)
      if (error) {
        this.$message({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
        return
      }
      // 修改元素
      await ElementService.modifyElement({ elementNo: this.elementNo, ...this.elementInfo })
      // 成功提示
      this.$message({ message: '修改元素成功', type: 'info', duration: 2 * 1000 })
      // 修改tab标题
      this.$store.commit('pymeter/updateTab', { editorNo: this.elementNo, editorName: this.elementInfo.elementName })
      // 重新查询脚本列表
      this.$store.commit('pymeter/refreshCollectionsNow')
      // 表单设置为只读
      this.setReadonly()
    },

    /**
     * 创建元素
     * TODO: workspaceNo非空判断，为空时弹出workspace选择列表
     */
    async createCollectionElement() {
      // 表单校验
      const error = await this.$refs.elformVNode
        .validate()
        .then(() => false)
        .catch(() => true)
      if (error) {
        this.$message({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
        return
      }
      // 新增元素
      await ElementService.createElement({ workspaceNo: this.workspaceNo, ...this.elementInfo })
      // 成功提示
      this.$message({ message: '新增元素成功', type: 'info', duration: 2 * 1000 })
      // 关闭tab
      this.$store.commit('pymeter/removeTab', { editorNo: 'UNSAVED_COLLECTION' })
      // 重新查询脚本列表
      this.$store.commit('pymeter/refreshCollectionsNow')
    },

    /**
     * 根据 collectionNo 执行脚本
     */
    async executeCollection() {
      try {
        // 没有选择变量集时给出提示
        if (this.selectedDatasetNumberList.length === 0) {
          await this.$confirm('当前没有选择[环境/变量]，确定执行吗？', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
        }
        // 连接 socket
        this.socketConnect()
        // 等待获取 sid，后再执行脚本
        const sid = await this.getSID()
        // 后端异步执行脚本
        await ExecutionService.executeCollection({
          collectionNo: this.elementNo,
          socketId: sid,
          variableDataSet: {
            useCurrentValue: this.useCurrentValue,
            numberList: this.selectedDatasetNumberList
          }
        })
        // 打开结果面板
        this.$store.commit('pymeter/openResultDrawer')
      } catch {
        // 异常时断开 socket 连接
        this.socketDisconnect()
      }
    },

    /**
     * 查看 Json 脚本
     */
    queryCollectionJson() {
      ExecutionService.queryCollectionJson({
        collectionNo: this.elementNo,
        dataSetNumberList: this.selectedDatasetNumberList,
        useCurrentValue: this.useCurrentValue
      }).then((response) => {
        this.showJsonScript = true
        this.$nextTick(() => {
          this.$refs.jsonEditor.setValue(JSON.stringify(response.result))
          setTimeout(() => {
            this.$refs.jsonEditor.formatDocument()
          }, 200)
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
