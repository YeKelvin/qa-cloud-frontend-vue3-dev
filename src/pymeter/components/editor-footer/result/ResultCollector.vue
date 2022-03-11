<template>
  <div class="result-collector-container">
    <!-- 结果列表 -->
    <el-card
      :body-style="{ padding: '0' }"
      shadow="hover"
      style="min-width: 400px; max-width: 400px; width: 400px; height: 100%; overflow: hidden"
    >
      <el-scrollbar style="width: 100%; height: 100%" wrap-style="overflow-x:auto;" view-style="padding:10px;">
        <el-tree
          default-expand-all
          highlight-current
          :data="groups"
          :props="{ label: 'name', children: 'children' }"
          :expand-on-click-node="false"
          @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <span class="tree-item">
              <!-- Group 名称 -->
              <template v-if="node.level == 1">
                <span class="group-name-wrapper">
                  <span style="display: inline-flex; align-items: center">
                    <SvgIcon icon-name="pymeter-group" style="width: 1.2em; height: 1.2em" />
                    <span class="element-name" style="margin-left: 5px">{{ node.label }}</span>
                  </span>
                  <SvgIcon v-if="data.running" icon-name="pymeter-running" style="width: 1.5em; height: 1.5em" />
                  <SvgIcon v-else-if="!data.running && data.success" icon-name="pymeter-successful-sampler" />
                  <SvgIcon v-else icon-name="pymeter-failure-sampler" />
                </span>
              </template>
              <!-- Sampler 名称 -->
              <template v-else>
                <SvgIcon v-if="data.success" icon-name="pymeter-successful-sampler" />
                <SvgIcon v-else-if="!data.success && data.retrying" icon-name="pymeter-warning-sampler" />
                <SvgIcon v-else icon-name="pymeter-failure-sampler" />
                <span class="element-name" style="margin-left: 5px">{{ node.label }}</span>
              </template>
            </span>
          </template>
        </el-tree>
      </el-scrollbar>
    </el-card>

    <!-- 结果数据详情 -->
    <el-card :body-style="{ padding: '0' }" shadow="hover" style="margin-left: 10px; width: 100%">
      <el-empty v-if="!showing" description=" " />
      <el-tabs v-else v-model="activeTabName" style="width: 100%; padding: 0 10px" @tab-click="handleTabClick">
        <el-tab-pane key="SUMMARY" label="信息" name="SUMMARY" />
        <el-tab-pane v-if="requestHeaders.length > 0" key="REQUEST_HEADERS" label="请求头" name="REQUEST_HEADERS" />
        <el-tab-pane key="REQUEST" label="请求数据" name="REQUEST" />
        <el-tab-pane v-if="responseHeaders.length > 0" key="RESPONSE_HEADERS" label="响应头" name="RESPONSE_HEADERS" />
        <el-tab-pane key="RESPONSE" label="响应数据" name="RESPONSE" />
        <el-tab-pane v-if="current.sampler.failedAssertion" key="ASSERTION" label="断言" name="ASSERTION" />
      </el-tabs>

      <!-- 请求简要 -->
      <template v-if="showing && showSamplerSummary">
        <el-scrollbar style="width: 100%; height: 100%" wrap-style="overflow-x:auto;" view-style="padding:10px;">
          <el-table :data="samplerSummary" style="width: 100%" :show-header="false">
            <el-table-column prop="name" width="200" />
            <el-table-column prop="value" />
          </el-table>
        </el-scrollbar>
      </template>

      <!-- 请求头部 -->
      <template v-if="showing && showRequestHeaders">
        <el-scrollbar style="width: 100%; height: 100%" wrap-style="overflow-x:auto;" view-style="padding:10px;">
          <el-table :data="requestHeaders" style="width: 100%" :show-header="false">
            <el-table-column prop="name" width="250" min-width="200" />
            <el-table-column prop="value" />
          </el-table>
        </el-scrollbar>
      </template>

      <!-- 请求体 -->
      <template v-if="showing && showRequestCode">
        <MonacoEditor ref="requestEditorRef" language="json" :read-only="true" />
      </template>

      <!-- 响应头部 -->
      <template v-if="showing && showResponseHeaders">
        <el-scrollbar style="width: 100%; height: 100%" wrap-style="overflow-x:auto;" view-style="padding:10px;">
          <el-table :data="responseHeaders" style="width: 100%" :show-header="false">
            <el-table-column prop="name" width="250" min-width="200" />
            <el-table-column prop="value" />
          </el-table>
        </el-scrollbar>
      </template>

      <!-- 响应体 -->
      <template v-if="showing && showResponseCode">
        <MonacoEditor ref="responseEditorRef" language="json" :read-only="true" />
      </template>

      <!-- 失败断言 -->
      <template v-if="showing && showAssertionCode">
        <MonacoEditor ref="assertionEditorRef" language="python" :read-only="true" />
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { isEmpty } from 'lodash-es'
import MonacoEditor from '@/components/monaco-editor/MonacoEditor.vue'

defineProps({
  groups: { type: Array, default: () => [] }
})

const activeTabName = ref('SUMMARY')
const current = reactive({ sampler: {} })
const requestEditorRef = ref()
const responseEditorRef = ref()
const assertionEditorRef = ref()

const showing = computed(() => !isEmpty(Object.keys(current.sampler)))
const showSamplerSummary = computed(() => activeTabName.value === 'SUMMARY')
const showRequestHeaders = computed(() => activeTabName.value === 'REQUEST_HEADERS')
const showRequestCode = computed(() => activeTabName.value === 'REQUEST')
const showResponseHeaders = computed(() => activeTabName.value === 'RESPONSE_HEADERS')
const showResponseCode = computed(() => activeTabName.value === 'RESPONSE')
const showAssertionCode = computed(() => activeTabName.value === 'ASSERTION')
const samplerSummary = computed(() => {
  return [
    { name: '名称：', value: current.sampler.name || '-' },
    { name: '描述：', value: current.sampler.remark || '-' },
    { name: '请求地址：', value: current.sampler.url || '-' },
    { name: '响应码：', value: current.sampler.responseCode || '-' },
    { name: '响应信息：', value: current.sampler.responseMessage || '-' },
    { name: '执行结果：', value: current.sampler.success ? '成功' : '失败' },
    { name: '开始时间：', value: current.sampler.startTime || '-' },
    { name: '结束时间：', value: current.sampler.endTime || '-' },
    { name: '耗时：', value: `${current.sampler.elapsedTime}ms` || '-' }
  ]
})
const requestHeaders = computed(() => {
  if (!current.sampler.requestHeaders) return []

  const data = []
  Object.keys(current.sampler.requestHeaders).forEach((key) => {
    data.push({
      name: key,
      value: current.sampler.requestHeaders[key]
    })
  })
  return data
})
const responseHeaders = computed(() => {
  if (!current.sampler.responseHeaders) return []

  const data = []
  Object.keys(current.sampler.responseHeaders).forEach((key) => {
    data.push({
      name: key,
      value: current.sampler.responseHeaders[key]
    })
  })
  return data
})

const handleNodeClick = (data, node) => {
  if (node.level === 1) return
  current.sampler = data

  if (activeTabName.value === 'REQUEST') {
    setRequestCode(data.request)
    return
  }
  if (activeTabName.value === 'RESPONSE') {
    setResponseCode(data.response)
    return
  }
  if (activeTabName.value === 'ASSERTION') {
    setFailedAssertionCode(data.failedAssertion?.message)
    return
  }
}
const handleTabClick = (tab) => {
  if (tab.paneName === 'REQUEST') {
    setRequestCode(current.sampler.request)
    return
  }
  if (tab.paneName === 'RESPONSE') {
    setResponseCode(current.sampler.response)
    return
  }
  if (tab.paneName === 'ASSERTION') {
    setFailedAssertionCode(current.sampler.failedAssertion?.message)
    return
  }
}
const setRequestCode = (code) => {
  nextTick(() => {
    requestEditorRef.value && requestEditorRef.value.setValue(code)
  })
}
const setResponseCode = (code) => {
  nextTick(() => {
    if (!responseEditorRef.value) return
    responseEditorRef.value.setValue(code)
    responseEditorRef.value.formatDocument()
  })
}
const setFailedAssertionCode = (code) => {
  nextTick(() => {
    if (isEmpty(code)) return
    assertionEditorRef.value && assertionEditorRef.value.setValue(code)
  })
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

.tree-item {
  display: inline-flex;
  align-items: center;
  width: 100%;
}

.group-name-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.element-name {
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

:deep(.el-card__body) {
  display: flex;
  flex: 1;
  flex-direction: column;

  width: 100%;
  height: 100%;
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
