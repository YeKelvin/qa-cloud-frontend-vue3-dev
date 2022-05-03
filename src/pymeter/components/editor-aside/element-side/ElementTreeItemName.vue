<template>
  <!-- 元素名称 -->
  <span class="element-name-wrapper">
    <!-- 图标 -->
    <span style="padding-right: 5px">
      <SvgIcon v-if="data.elementType == 'COLLECTION'" icon-name="pymeter-collection" />
      <SvgIcon v-else-if="data.elementType == 'GROUP'" icon-name="pymeter-group" />
      <SvgIcon v-else-if="data.elementClass == 'PythonSampler'" icon-name="pymeter-python" />
      <SvgIcon v-else-if="data.elementClass == 'SnippetSampler'" icon-name="pymeter-snippet" />
      <SvgIcon v-else-if="data.elementClass == 'SQLSampler'" icon-name="pymeter-sql" />
      <SvgIcon v-else-if="data.elementType == 'SAMPLER'" icon-name="pymeter-sampler" />
      <SvgIcon v-else-if="data.elementType == 'PRE_PROCESSOR'" icon-name="pymeter-pre-processor" />
      <SvgIcon v-else-if="data.elementType == 'POST_PROCESSOR'" icon-name="pymeter-post-processor" />
      <SvgIcon v-else-if="data.elementClass == 'ForInController'" icon-name="pymeter-forin-controller" />
      <SvgIcon v-else-if="data.elementClass == 'IfController'" icon-name="pymeter-if-controller" />
      <SvgIcon v-else-if="data.elementClass == 'LoopController'" icon-name="pymeter-loop-controller" />
      <SvgIcon v-else-if="data.elementClass == 'RetryController'" icon-name="pymeter-retry-controller" />
      <SvgIcon v-else-if="data.elementClass == 'TransactionController'" icon-name="pymeter-transaction-controller" />
      <SvgIcon v-else-if="data.elementClass == 'WhileController'" icon-name="pymeter-while-controller" />
      <SvgIcon v-else-if="data.elementType == 'CONTROLLER'" icon-name="pymeter-controller" />
      <SvgIcon v-else-if="data.elementType == 'ASSERTION'" icon-name="pymeter-assertion" />
    </span>
    <!-- 名称 -->
    <span class="element-name">{{ data.elementName }}</span>
    <!-- 集合标识 -->
    <el-tag v-if="data.elementClass == 'TestCollection'" size="small">集合</el-tag>
    <!-- 片段标识 -->
    <el-tag v-if="data.elementClass == 'SnippetCollection'" size="small">片段</el-tag>
    <!-- 禁用标识 -->
    <el-tag v-if="!data.enabled" type="danger" size="small">禁用</el-tag>
    <!-- Setup标识 -->
    <el-tag v-if="data.elementClass == 'SetupGroup'" size="small">setup</el-tag>
    <!-- TearDown标识 -->
    <el-tag v-if="data.elementClass == 'TearDownGroup'" size="small">teardown</el-tag>
    <!-- SetupDebuger标识 -->
    <template v-if="data.elementClass == 'SetupGroupDebuger'">
      <el-tag size="small">setup</el-tag>
      <el-tag size="small">debuger</el-tag>
    </template>
    <!-- TearDownDebuger标识 -->
    <template v-if="data.elementClass == 'TearDownGroupDebuger'">
      <el-tag size="small">teardown</el-tag>
      <el-tag size="small">debuger</el-tag>
    </template>
  </span>
</template>

<script>
export default {
  name: 'ElementTreeItemName',
  props: {
    data: { type: Object, default: () => ({}) }
  }
}
</script>

<style lang="scss" scoped>
.element-name-wrapper {
  display: inline-flex;
  align-items: center;
  width: 100%;
  user-select: none;
}

.element-name {
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
}

.el-tag {
  margin-left: 5px;
}
</style>
