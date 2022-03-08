<template>
  <div class="pymeter-component-container">
    <el-form
      ref="elformRef"
      label-position="right"
      label-width="140px"
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
      <el-form-item label="失败时的处理：" prop="property.TestGroup__on_sample_error">
        <el-select v-model="elementInfo.property.TestGroup__on_sample_error" :disabled="queryMode" style="width: 100%">
          <el-option label="继续" value="continue" />
          <el-option label="开始下一个主控制器的循环" value="start_next_coroutine" />
          <el-option label="开始下一个当前控制器的循环" value="start_next_current_loop" />
          <el-option label="中断当前控制器的循环" value="break_current_loop" />
          <el-option label="停止主控制器" value="stop_test_group" />
          <el-option label="停止测试" value="stop_test" />
          <el-option label="立即停止测试" value="stop_test_now" />
        </el-select>
      </el-form-item>

      <el-form-item label="并发数：" prop="property.TestGroup__number_groups">
        <el-input v-model="elementInfo.property.TestGroup__number_groups" clearable disabled />
      </el-form-item>
      <el-form-item label="循环次数：" prop="property.TestGroup__main_controller.property.LoopController__loops">
        <el-input
          v-model="elementInfo.property.TestGroup__main_controller.property.LoopController__loops"
          clearable
          disabled
        />
      </el-form-item>

      <!-- 设置类 Tabs -->
      <el-tabs v-model="activeTabName">
        <el-tab-pane name="HTTP">
          <template #label>
            <el-badge :hidden="hiddenConfigDot" type="success" is-dot>HTTP配置</el-badge>
          </template>
        </el-tab-pane>
      </el-tabs>

      <!-- HTTP 设置 -->
      <div v-if="showHttpSettings">
        <!-- 是否使用 HTTP 会话 -->
        <el-form-item label="使用会话：">
          <el-switch v-model="useHTTPSession" active-color="#13ce66" :disabled="queryMode" />
        </el-form-item>
        <!-- 是否在每次迭代开始前重新打开一个新的 HTTP 会话 -->
        <el-form-item label="迭代时刷新会话：">
          <el-switch
            v-model="httpSessionManager.property.HTTPSessionManager__clear_each_iteration"
            active-color="#13ce66"
            active-value="true"
            inactive-value="false"
            :disabled="queryMode"
          />
        </el-form-item>
      </div>

      <!-- 操作按钮 -->
      <el-form-item v-if="queryMode">
        <el-button :icon="Edit" type="primary" @click="editNow">编 辑</el-button>
        <el-button :icon="Close" @click="closeTab">关 闭</el-button>
        <el-dropdown
          split-button
          trigger="click"
          type="danger"
          style="margin-left: 10px"
          placement="bottom-start"
          @click="executeGroup(false)"
        >
          <el-icon><Pointer /></el-icon>
          <span style="margin-left: 5px">运 行</span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="executeGroup(true)">独立运行</el-dropdown-item>
              <el-dropdown-item @click="queryGroupJson()">查看JSON</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-form-item>
      <el-form-item v-else-if="modifyMode">
        <el-button :icon="Check" type="danger" @click="modifyGroupElement()">保 存</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
      </el-form-item>
      <el-form-item v-else-if="createMode">
        <el-button :icon="Check" type="primary" @click="createGroupElement()">保 存</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
      </el-form-item>
    </el-form>

    <el-dialog v-model="showJsonScript" center title="Json脚本" width="80%">
      <MonacoEditor ref="jsonEditor" language="json" style="height: 300px" :read-only="true" />
    </el-dialog>
  </div>
</template>

<script setup>
import { Check, Close, Edit, Pointer } from '@element-plus/icons-vue'
import * as ElementService from '@/api/script/element'
import editorProps from '@/pymeter/composables/editor.props'
import useEditor from '@/pymeter/composables/useEditor'
import useRunnableElement from '@/pymeter/composables/useRunnableElement'
import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'

const props = defineProps(editorProps)
const { editorNo, editorMode, metadata, queryMode, modifyMode, createMode, editNow, setReadonly, updateTab, closeTab } =
  useEditor(props)
const { executeGroup } = useRunnableElement(editorNo.value)
</script>

<script>
export default {
  name: 'GroupEditor',

  data() {
    const checkLoops = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('循环次数不能为空'))
      }
      const val = parseInt(value)
      if (!Number.isInteger(val)) {
        return callback(new Error('循环次数必须为整数'))
      } else {
        if (val < 1 || val > 999) {
          return callback(new Error('循环次数仅支持[1-999]'))
        } else {
          return callback()
        }
      }
    }
    return {
      elementNo: this.editorNo,
      elementInfo: {
        elementName: 'Group',
        elementRemark: '',
        elementType: 'GROUP',
        elementClass: 'TestGroup',
        property: {
          TestGroup__on_sample_error: 'start_next_coroutine',
          TestGroup__number_groups: '1',
          TestGroup__start_interval: '',
          TestGroup__main_controller: {
            class: 'LoopController',
            property: {
              LoopController__loops: '1',
              LoopController__continue_forever: false
            }
          }
        }
      },
      elementFormRules: {
        elementName: [{ required: true, message: '元素名称不能为空', trigger: 'blur' }],
        'property.TestGroup__on_sample_error': [{ required: true, message: '失败时的处理不能为空', trigger: 'blur' }],
        'property.TestGroup__number_groups': [{ required: true, message: '并发数不能为空', trigger: 'blur' }],
        'property.TestGroup__main_controller.property.LoopController__loops': [
          { validator: checkLoops, trigger: 'blur' }
        ]
      },
      activeTabName: 'HTTP',
      builtIn: [],
      useHTTPSession: false,
      httpSessionManager: {
        elementName: 'BuiltIn HTTPSessionManager',
        elementRemark: '',
        elementType: 'CONFIG',
        elementClass: 'HTTPSessionManager',
        property: {
          HTTPSessionManager__clear_each_iteration: 'false'
        }
      },
      showJsonScript: false
    }
  },

  computed: {
    showHttpSettings() {
      return this.activeTabName === 'HTTP'
    },
    hiddenConfigDot() {
      if (this.useHTTPSession === false) {
        return true
      }
      return false
    }
  },

  mounted: function () {
    // 查询或更新模式时先拉取元素信息
    if (this.createMode) return
    // 查询元素
    ElementService.queryElementInfo({ elementNo: this.elementNo }).then((response) => {
      this.elementInfo = response.result
    })
    // 查询内置元素
    ElementService.queryElementBuiltins({ elementNo: this.elementNo }).then((response) => {
      this.builtIn = response.result
      this.builtIn &&
        this.builtIn.forEach((item) => {
          if (item.elementClass === 'HTTPSessionManager') {
            this.useHTTPSession = item.enabled
            Object.assign(this.httpSessionManager, item)
          }
        })
    })
  },

  methods: {
    /**
     * 修改元素信息
     */
    async modifyGroupElement() {
      // 表单校验
      const error = await this.$refs.elformRef
        .validate()
        .then(() => false)
        .catch(() => true)
      if (error) {
        this.$message({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
        return
      }
      // 修改元素
      await ElementService.modifyElement({ elementNo: this.elementNo, ...this.elementInfo })
      // 更新或新增内置元素
      await this.submitBuiltIns()
      // 成功提示
      this.$message({ message: '修改元素成功', type: 'info', duration: 2 * 1000 })
      // 修改tab标题
      this.$store.commit('pymeter/updateTab', { editorNo: this.elementNo, editorName: this.elementInfo.elementName })
      // 重新查询脚本
      this.$store.commit('pymeter/refreshElementTreeNow')
      // 表单设置为只读
      this.setReadonly()
    },

    /**
     * 创建元素
     */
    async createGroupElement() {
      // 表单校验
      const error = await this.$refs.elformRef
        .validate()
        .then(() => false)
        .catch(() => true)
      if (error) {
        this.$message({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
        return
      }
      // 使用内置元素时，更新请求参数
      if (this.useHTTPSession) {
        this.elementInfo.builtIn = [this.httpSessionManager]
      }
      // 新增元素
      await ElementService.createElementChildren({
        rootNo: this.metadata.rootNo,
        parentNo: this.metadata.parentNo,
        children: [this.elementInfo]
      })
      // 成功提示
      this.$message({ message: '新增元素成功', type: 'info', duration: 2 * 1000 })
      // 关闭tab
      this.$store.commit('pymeter/removeTab', { editorNo: 'UNSAVED_GROUP' })
      // 重新查询脚本
      this.$store.commit('pymeter/refreshElementTreeNow')
    },

    /**
     * 更新或新增内置元素
     */
    async submitBuiltIns() {
      if (this.useHTTPSession) {
        // 使用 HTTP 会话
        if (this.builtIn.length > 0) {
          // 已经存在 HTTPSessionManager 时，直接修改
          // 修改内置元素
          await ElementService.modifyElementBuiltins({ children: this.builtIn })
        } else {
          // 新增内置元素
          await ElementService.createElementBuiltins({
            rootNo: this.metadata.rootNo,
            parentNo: this.elementNo,
            children: [this.httpSessionManager]
          })
        }
      } else {
        // 不使用 HTTP 会话
        if (this.builtIn.length > 0) {
          // 已经存在 HTTPSessionManager 时，禁用元素
          const manager = this.builtIn.find((item) => item.elementClass === 'HTTPSessionManager')
          manager && (await ElementService.disableElement({ elementNo: manager.elementNo }))
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.el-badge__content) {
  top: 20px;
}

:deep(.el-badge__content.is-fixed.is-dot) {
  right: -4px;
}
</style>
