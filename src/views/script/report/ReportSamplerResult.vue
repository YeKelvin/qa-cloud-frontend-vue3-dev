<template>
  <div class="details-container">
    <el-descriptions :column="1">
      <el-descriptions-item label="请求名称">{{ details.samplerName }}</el-descriptions-item>
      <el-descriptions-item v-if="details.samplerRemark" label="请求描述">
        {{ details.samplerRemark }}
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions :column="3">
      <el-descriptions-item label="开始时间">
        <el-tag type="warning">{{ details.startTime }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="结束时间">
        <el-tag type="warning">{{ details.endTime }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="耗时">
        <el-tag type="danger">{{ details.elapsedTime }}</el-tag>
      </el-descriptions-item>
    </el-descriptions>

    <!-- 请求部分 tabs -->
    <el-tabs v-model="requestActiveTabName" @tab-click="handleRequestTabClick">
      <!-- 请求头 -->
      <el-tab-pane key="HEADERS" label="请求头" name="HEADERS">
        <el-table :data="requestHeadersData" :show-header="false" max-height="220" style="width: 100%">
          <el-table-column prop="name" />
          <el-table-column prop="value" />
        </el-table>
      </el-tab-pane>
      <!-- 请求体 -->
      <el-tab-pane key="DATA" label="请求数据" name="DATA">
        <monaco-editor
          ref="requestEditor"
          key="requestEditor"
          :read-only="true"
          language="json"
          style="height: 220px"
        />
      </el-tab-pane>
    </el-tabs>

    <!-- 响应部分 -->
    <el-tabs v-model="responseActiveTabName" @tab-click="handleResponseTabClick">
      <!-- 响应头 -->
      <el-tab-pane key="HEADERS" label="响应头" name="HEADERS">
        <el-table :data="responseHeadersData" :show-header="false" max-height="220" style="width: 100%">
          <el-table-column prop="name" />
          <el-table-column prop="value" />
        </el-table>
      </el-tab-pane>
      <!-- 响应体 -->
      <el-tab-pane key="DATA" label="响应数据" name="DATA">
        <monaco-editor
          ref="responseEditor"
          key="responseEditor"
          :read-only="true"
          language="json"
          style="height: 220px"
        />
      </el-tab-pane>
      <!-- 断言 -->
      <el-tab-pane v-if="details.failedAssertion" key="ASSERTION" label="断言" name="ASSERTION">
        <monaco-editor
          ref="assertionEditor"
          key="assertionEditor"
          :read-only="true"
          language="log"
          style="height: 220px"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import * as ReportService from '@/api/script/report'
import MonacoEditor from '@/components/MonacoEditor'

export default {
  name: 'SamplerResultDetails',

  components: { MonacoEditor },

  props: {
    samplerId: { type: String, default: '' }
  },

  data() {
    return {
      details: {},
      requestActiveTabName: 'DATA',
      responseActiveTabName: 'DATA'
    }
  },

  computed: {
    requestHeadersData() {
      if (!this.details.requestHeaders) return []
      return this.stringHeadersToJson(this.details.requestHeaders)
    },
    responseHeadersData() {
      if (!this.details.responseHeaders) return []
      return this.stringHeadersToJson(this.details.responseHeaders)
    }
  },

  watch: {
    samplerId(val) {
      if (!val) return
      this.querySamplerResult()
    }
  },

  mounted() {
    if (!this.samplerId) return
    this.querySamplerResult()
  },

  methods: {
    querySamplerResult() {
      ReportService.querySamplerResult({ samplerId: this.samplerId })
        .then((response) => {
          this.details = response.result
          this.handleRequestTabClick({ name: this.requestActiveTabName })
          this.handleResponseTabClick({ name: this.responseActiveTabName })
        })
        .catch(() => {})
    },

    handleRequestTabClick(tab) {
      if (tab.name === 'DATA') {
        this.$refs.requestEditor.setValue(this.details.requestData)
      }
    },

    handleResponseTabClick(tab) {
      if (tab.name === 'DATA') {
        this.$refs.responseEditor.setValue(this.details.responseData)
        this.$refs.responseEditor.formatDocument()
        return
      }
      if (tab.name === 'ASSERTION') {
        this.$refs.assertionEditor.setValue(this.details.failedAssertion)
        return
      }
    },
    stringHeadersToJson(val) {
      if (!val || (val.charAt(0) !== '{' && val.charAt(val.length - 1) !== '}')) return []
      const data = []
      try {
        const headers = JSON.parse(val)
        Object.keys(headers).forEach((key) => {
          data.push({ name: key, value: headers[key] })
        })
      } catch (error) {
        console.error(error)
      }
      return data
    }
  }
}
</script>

<style lang="scss" scoped>
.details-container {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.el-descriptions {
  :deep(.el-descriptions-item__container) {
    display: inline-flex;
    align-items: center;
  }
}

:deep(.el-descriptions-row) {
  display: flex;
  flex-wrap: wrap;

  .el-descriptions-item {
    margin-right: 20px;
  }

  .el-descriptions-item__label {
    margin-right: 5px;
  }
}
</style>
