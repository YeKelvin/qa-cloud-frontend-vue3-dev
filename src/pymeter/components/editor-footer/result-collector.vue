<template>
  <div class="result-collector-container">

    <!-- 结果列表 -->
    <el-card
      :body-style="{ 'padding': '0' }"
      shadow="hover"
      style="min-width:400px; max-width:400px; width:400px; height:100%; overflow:hidden;"
    >
      <el-scrollbar style="width:100%; height:100%" wrap-style="overflow-x:auto;" view-style="padding:10px;">
        <el-tree
          default-expand-all
          highlight-current
          :data="groups"
          :props="{ label:'name', children:'children' }"
          :expand-on-click-node="false"
          @node-click="handleNodeClick"
        >
          <span slot-scope="{ node, data }" style="display:inline-flex; align-items:center; width:100%">
            <!-- Group 名称 -->
            <template v-if="node.level == 1">
              <span style="display:inline-flex; align-items:center; justify-content:space-between; width:100%">
                <span style="display:inline-flex; align-items:center;">
                  <svg-icon icon-class="group" style="width: 1.2em; height: 1.2em" />
                  <span class="element-title" style="margin-left:5px;">{{ node.label }}</span>
                </span>
                <svg-icon v-if="data.running" icon-class="running" style="width: 1.5em; height: 1.5em" />
                <svg-icon v-else-if="!data.running && data.success" icon-class="successful-sampler" />
                <svg-icon v-else icon-class="failure-sampler" />
              </span>
            </template>
            <!-- Sampler 名称 -->
            <template v-else>
              <svg-icon v-if="data.success" icon-class="successful-sampler" />
              <svg-icon v-else-if="!data.success && data.retrying" icon-class="warning-sampler" />
              <svg-icon v-else icon-class="failure-sampler" />
              <span class="element-title" style="margin-left:5px;">{{ node.label }}</span>
            </template>
          </span>
        </el-tree>
      </el-scrollbar>
    </el-card>

    <!-- 结果数据详情 -->
    <el-card :body-style="{ 'padding': '0' }" shadow="hover" style="margin-left:10px; width:100%;">
      <el-empty v-if="!showing" description=" " />
      <el-tabs v-else v-model="activeTabName" style="width:100%; padding: 0 10px;" @tab-click="handleTabClick">
        <el-tab-pane key="SUMMARY" label="信息" name="SUMMARY" />
        <el-tab-pane v-if="requestHeaders.length > 0" key="REQUEST_HEADERS" label="请求头" name="REQUEST_HEADERS" />
        <el-tab-pane key="REQUEST" label="请求数据" name="REQUEST" />
        <el-tab-pane v-if="responseHeaders.length > 0" key="RESPONSE_HEADERS" label="响应头" name="RESPONSE_HEADERS" />
        <el-tab-pane key="RESPONSE" label="响应数据" name="RESPONSE" />
        <el-tab-pane v-if="showingSampler.failedAssertion" key="ASSERTION" label="断言" name="ASSERTION" />
      </el-tabs>

      <!-- 请求简要 -->
      <template v-if="showing && showSamplerSummary">
        <el-scrollbar style="width:100%; height:100%" wrap-style="overflow-x:auto;" view-style="padding:10px;">
          <el-table :data="samplerSummary" style="width:100%;" :show-header="false">
            <el-table-column prop="name" width="200" />
            <el-table-column prop="value" />
          </el-table>
        </el-scrollbar>
      </template>

      <!-- 请求头部 -->
      <template v-if="showing && showRequestHeaders">
        <el-scrollbar style="width:100%; height:100%" wrap-style="overflow-x:auto;" view-style="padding:10px;">
          <el-table :data="requestHeaders" style="width:100%;" :show-header="false">
            <el-table-column prop="name" width="250" min-width="200" />
            <el-table-column prop="value" />
          </el-table>
        </el-scrollbar>
      </template>

      <!-- 请求体 -->
      <template v-if="showing && showRequestCode">
        <monaco-editor ref="requestEditor" key="requestCode" :read-only="true" language="json" />
      </template>

      <!-- 响应头部 -->
      <template v-if="showing && showResponseHeaders">
        <el-scrollbar style="width:100%; height:100%" wrap-style="overflow-x:auto;" view-style="padding:10px;">
          <el-table :data="responseHeaders" style="width:100%;" :show-header="false">
            <el-table-column prop="name" width="250" min-width="200" />
            <el-table-column prop="value" />
          </el-table>
        </el-scrollbar>
      </template>

      <!-- 响应体 -->
      <template v-if="showing && showResponseCode">
        <monaco-editor ref="responseEditor" key="responseCode" :read-only="true" language="json" />
      </template>

      <!-- 失败断言 -->
      <template v-if="showing && showAssertionCode">
        <monaco-editor ref="assertionEditor" key="assertionCode" :read-only="true" language="python" />
      </template>

    </el-card>
  </div>
</template>

<script>
import MonacoEditor from '@/components/MonacoEditor'

export default {

  name: 'ResultCollector',

  components: { MonacoEditor },

  props: {
    groups: { type: Array, default: () => [] }
  },

  data() {
    return {
      activeTabName: 'SUMMARY',
      showingSampler: {}
    }
  },

  computed: {
    showing() {
      return Object.keys(this.showingSampler).length > 0
    },
    showSamplerSummary() { return this.activeTabName === 'SUMMARY' },
    showRequestHeaders() { return this.activeTabName === 'REQUEST_HEADERS' },
    showRequestCode() { return this.activeTabName === 'REQUEST' },
    showResponseHeaders() { return this.activeTabName === 'RESPONSE_HEADERS' },
    showResponseCode() { return this.activeTabName === 'RESPONSE' },
    showAssertionCode() { return this.activeTabName === 'ASSERTION' },
    samplerSummary() {
      return [
        { name: '名称：', value: this.showingSampler.name || '-' },
        { name: '描述：', value: this.showingSampler.remark || '-' },
        { name: '请求地址：', value: this.showingSampler.url || '-' },
        { name: '响应码：', value: this.showingSampler.responseCode || '-' },
        { name: '响应信息：', value: this.showingSampler.responseMessage || '-' },
        { name: '执行结果：', value: this.showingSampler.success ? '成功' : '失败' },
        { name: '开始时间：', value: this.showingSampler.startTime || '-' },
        { name: '结束时间：', value: this.showingSampler.endTime || '-' },
        { name: '耗时：', value: this.showingSampler.elapsedTime + 'ms' || '-' }
      ]
    },
    requestHeaders() {
      if (!this.showingSampler.requestHeaders) return []

      const data = []
      Object.keys(this.showingSampler.requestHeaders).forEach((key) => {
        data.push({
          name: key,
          value: this.showingSampler.requestHeaders[key]
        })
      })
      return data
    },
    responseHeaders() {
      if (!this.showingSampler.responseHeaders) return []

      const data = []
      Object.keys(this.showingSampler.responseHeaders).forEach((key) => {
        data.push({
          name: key,
          value: this.showingSampler.responseHeaders[key]
        })
      })
      return data
    }
  },

  methods: {
    handleNodeClick(data, node) {
      if (node.level === 1) return
      this.showingSampler = data

      if (this.activeTabName === 'REQUEST') {
        this.setRequestCode(data.request)
        return
      }
      if (this.activeTabName === 'RESPONSE') {
        this.setResponseCode(data.response)
        return
      }
      if (this.activeTabName === 'ASSERTION') {
        this.setFailedAssertionCode(data.failedAssertion?.message)
        return
      }
    },
    handleTabClick(tab) {
      if (tab.name === 'REQUEST') {
        this.setRequestCode(this.showingSampler.request)
        return
      }
      if (tab.name === 'RESPONSE') {
        this.setResponseCode(this.showingSampler.response)
        return
      }
      if (tab.name === 'ASSERTION') {
        this.setFailedAssertionCode(this.showingSampler.failedAssertion?.message)
        return
      }
    },
    setRequestCode(code) {
      this.$nextTick(() => {
        this.$refs.requestEditor && this.$refs.requestEditor.setValue(code)
      })
    },
    setResponseCode(code) {
      this.$nextTick(() => {
        if (!this.$refs.responseEditor) return
        this.$refs.responseEditor.setValue(code)
        this.$refs.responseEditor.formatDocument()
      })
    },
    setFailedAssertionCode(code) {
      this.$nextTick(() => {
        if (!code || code === '' || code.length === 0) return
        this.$refs.assertionEditor && this.$refs.assertionEditor.setValue(code)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.result-collector-container {
  display: flex;
  flex: 1;
  width: 100%;
  height: 100%;
  padding: 10px;
  padding-top: 0;
}

:deep(.el-card__body) {
  display: flex;
  flex: 1;
  flex-direction: column;

  width: 100%;
  height: 100%;
}

.element-title {
  user-select: none;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
}

.el-tabs__item {
  padding: 0 20px;
  height: 20px;
  line-height: 20px;
}

:deep(.el-tabs__header) {
  margin: 0 0 5px;
}

:deep(.el-tabs__active-bar) {
  height: 1px;
}

:deep(.el-tabs__nav-wrap) {
  &:after {
    height: 1px;
  }
}

:deep(.el-table td, .el-table th) {
  padding: 0;
}

:deep(.el-tree-node__content) {
  height: 100%;
  min-height: 26px;
}
</style>
