<template>
  <div class="testplan-container">
    <span class="testplan-title">
      <span style="color: #606266; font-weight: 700">测试计划</span>
      <el-divider />
    </span>

    <div class="testplan-body">
      <!-- 脚本列表 -->
      <TestplanCollectionTree ref="tree" style="width: 50%" :readonly="queryMode" />
      <!-- 设置表单 -->
      <div style="width: 50%" class="settings-container">
        <el-form
          ref="form"
          label-position="right"
          label-width="140px"
          style="width: 100%"
          inline-message
          :model="formParams"
          :rules="formRules"
        >
          <!-- 计划名称 -->
          <el-form-item label="计划名称：" prop="planName">
            <el-input v-model="formParams.planName" clearable :readonly="queryMode" />
          </el-form-item>

          <!-- 计划描述 -->
          <el-form-item label="计划描述：" prop="planDesc">
            <el-input v-model="formParams.planDesc" clearable :readonly="queryMode" />
          </el-form-item>

          <!-- 版本号 -->
          <el-form-item label="版本号：" prop="productRequirementsVersion">
            <el-input v-model="formParams.productRequirementsVersion" clearable :readonly="queryMode" />
          </el-form-item>

          <!-- 并发数 -->
          <el-form-item label="并发数：" prop="concurrency">
            <el-input v-model="formParams.concurrency" clearable disabled>
              <template #append>个</template>
            </el-input>
          </el-form-item>

          <!-- 迭代次数 -->
          <el-form-item label="迭代数：" prop="iterations">
            <el-input v-model="formParams.iterations" clearable :readonly="queryMode">
              <template #append>次</template>
            </el-input>
          </el-form-item>

          <!-- 迭代间隔时间 -->
          <el-form-item label="迭代间隔：" prop="delay">
            <el-input v-model="formParams.delay" clearable :readonly="queryMode">
              <template #append>ms</template>
            </el-input>
          </el-form-item>

          <!-- 保存结果 -->
          <el-form-item label="保存结果：" prop="save">
            <el-switch v-model="formParams.save" active-color="#13ce66" :disabled="queryMode" />
          </el-form-item>

          <!-- 仅保存失败结果 -->
          <el-form-item label="仅保存失败结果：" prop="saveOnError">
            <el-switch v-model="formParams.saveOnError" active-color="#13ce66" disabled />
          </el-form-item>

          <!-- 操作按钮 -->
          <el-form-item v-if="queryMode">
            <el-button :icon="Edit" type="primary" @click="editorMode = 'MODIFY'">编 辑</el-button>
            <el-button :icon="Close" @click="goBack()">关 闭</el-button>
          </el-form-item>
          <el-form-item v-else-if="modifyMode">
            <el-button :icon="Check" type="danger" @click="modifyTestplan()">保 存</el-button>
            <el-button :icon="Close" @click="goBack()">关 闭</el-button>
          </el-form-item>
          <el-form-item v-else-if="createMode">
            <el-button :icon="Check" type="primary" @click="createTestplan()">创建计划</el-button>
            <el-button :icon="Close" @click="goBack()">关 闭</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { mapState } from 'vuex'
import { Check, Close, Edit } from '@element-plus/icons-vue'
import * as TestplanService from '@/api/script/testplan'
import TestplanCollectionTree from './TestplanCollectionTree.vue'
</script>

<script>
export default {
  name: 'TestplanEditor',

  data() {
    const checkIterations = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('迭代次数不能为空'))
      }
      const val = parseInt(value)
      if (!Number.isInteger(val)) {
        return callback(new Error('迭代次数必须为整数'))
      } else {
        if (val < 1 || val > 999) {
          return callback(new Error('迭代次数仅支持[1-999]'))
        } else {
          return callback()
        }
      }
    }
    return {
      planNo: this.$route.query.planNo,
      editorMode: this.$route.params.editorMode,
      formParams: {
        planName: '',
        planDesc: '',
        productRequirementsVersion: '',
        concurrency: '1',
        iterations: '1',
        delay: '0',
        save: true,
        saveOnError: false,
        stopTestOnErrorCount: '3'
      },
      formRules: {
        planName: [{ required: true, message: '计划名称不能为空', trigger: 'blur' }],
        iterations: [{ validator: checkIterations, trigger: 'blur' }]
      }
    }
  },

  computed: {
    queryMode() {
      return this.editorMode === 'QUERY'
    },
    modifyMode() {
      return this.editorMode === 'MODIFY'
    },
    createMode() {
      return this.editorMode === 'CREATE'
    },

    // 当前选中的工作空间编号
    ...mapState('workspace', {
      workspaceNo: (state) => state.workspaceNo
    })
  },

  watch: {
    'formParams.iterations'(val) {
      if (val && val > 1) {
        this.formParams.save = false
        this.formParams.saveOnError = false
      }
    },
    'formParams.save'(val) {
      if (val) {
        this.formParams.iterations = '1'
        this.formParams.delay = '0'
      }
    }
  },

  mounted() {
    if (this.createMode) return

    if (!this.planNo) {
      this.editorMode = 'CREATE'
      return
    }

    this.editorMode = 'QUERY'
    this.queryTestplan()
  },

  methods: {
    queryTestplan() {
      TestplanService.queryTestplan({ planNo: this.planNo }).then((response) => {
        Object.assign(this.formParams, response.result)
        this.$refs.tree.setCheckedKeys(response.result.collectionNumberList)
      })
    },

    createTestplan() {
      this.$refs.form.validate((valid) => {
        if (!valid) return

        const collectionList = this.$refs.tree.getCheckedCollections()
        if (collectionList.length === 0) {
          this.$message({ message: '脚本至少选择一个', type: 'warning', duration: 2 * 1000 })
          return
        }

        TestplanService.createTestplan({
          workspaceNo: this.workspaceNo,
          collectionList: collectionList,
          ...this.formParams
        }).then(() => {
          this.$message({ message: '创建测试计划成功', type: 'info', duration: 1 * 1000 })
          this.goBack()
        })
      })
    },

    modifyTestplan() {
      this.$refs.form.validate((valid) => {
        if (!valid) return

        const collectionList = this.$refs.tree.getCheckedCollections()
        if (collectionList.length === 0) {
          this.$message({ message: '脚本至少选择一个', type: 'warning', duration: 2 * 1000 })
          return
        }

        TestplanService.modifyTestplan({ ...this.formParams, collectionList: collectionList }).then(() => {
          this.$message({ message: '修改测试计划成功', type: 'info', duration: 1 * 1000 })
          this.goBack()
        })
      })
    },

    goBack() {
      window.history.length > 1 ? this.$router.go(-1) : this.$router.push('/script/testplan')
    }
  }
}
</script>

<style lang="scss" scoped>
.testplan-container {
  position: absolute;
  width: 100%;
  height: 100%;

  display: flex;
  flex: 1;
  flex-direction: column;
}

.testplan-title {
  display: flex;
  flex-direction: column;
  width: 100%;

  padding: 0 10px;
  padding-top: 20px;

  :deep(.el-divider--horizontal) {
    margin: 10px 0;
  }
}

.testplan-body {
  display: flex;
  flex: 1;

  height: 100%;
  width: 100%;

  padding: 20px;
  padding-top: 10px;
}

.settings-container {
  padding: 20px;
}

.el-form-item--small.el-form-item {
  padding: 0 10px;
}

:deep(.el-input-group__append) {
  width: 60px;
}
</style>
