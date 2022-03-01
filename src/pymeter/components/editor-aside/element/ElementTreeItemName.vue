<template>
  <!-- 元素名称 -->
  <span style="display:inline-flex; align-items:center; width:100%; user-select:none;" v-bind="$attrs" v-on="$listeners">
    <!-- 图标 -->
    <span style="padding-right:5px;">
      <svg-icon v-if="data.elementType == 'COLLECTION'" icon-class="collection" />
      <svg-icon v-else-if="data.elementType == 'GROUP'" icon-class="group" />
      <svg-icon v-else-if="data.elementClass == 'PythonSampler'" icon-class="python" />
      <svg-icon v-else-if="data.elementClass == 'SnippetSampler'" icon-class="snippet" />
      <svg-icon v-else-if="data.elementType == 'SAMPLER'" icon-class="sampler" />
      <svg-icon v-else-if="data.elementType == 'PRE_PROCESSOR'" icon-class="pre-processor" />
      <svg-icon v-else-if="data.elementType == 'POST_PROCESSOR'" icon-class="post-processor" />
      <svg-icon v-else-if="data.elementClass == 'IfController'" icon-class="if-controller" />
      <svg-icon v-else-if="data.elementClass == 'LoopController'" icon-class="loop-controller" />
      <svg-icon v-else-if="data.elementClass == 'TransactionController'" icon-class="transaction-controller" />
      <svg-icon v-else-if="data.elementClass == 'WhileController'" icon-class="loop-controller" />
      <svg-icon v-else-if="data.elementType == 'CONTROLLER'" icon-class="controller" />
      <svg-icon v-else-if="data.elementType == 'ASSERTION'" icon-class="assertion" />
    </span>
    <!-- 名称 -->
    <span style="white-space:normal; overflow:hidden; text-overflow:ellipsis;">{{ data.elementName }}</span>
    <!-- 集合标识 -->
    <el-tag v-if="data.elementClass == 'TestCollection'" size="mini" style="margin-left:5px;">集合</el-tag>
    <!-- 片段标识 -->
    <el-tag v-if="data.elementClass == 'TestSnippets'" size="mini" style="margin-left:5px;">片段</el-tag>
    <!-- 禁用标识 -->
    <el-tag v-if="!data.enabled" type="danger" size="mini" style="margin-left:5px;">禁用</el-tag>
    <!-- Setup标识 -->
    <el-tag v-if="data.elementClass == 'SetupGroup'" size="mini" style="margin-left:5px;">setup</el-tag>
    <!-- TearDown标识 -->
    <el-tag v-if="data.elementClass == 'TearDownGroup'" size="mini" style="margin-left:5px;">teardown</el-tag>
    <!-- SetupDebuger标识 -->
    <template v-if="data.elementClass == 'SetupGroupDebuger'">
      <el-tag size="mini" style="margin-left:5px;">setup</el-tag>
      <el-tag size="mini" style="margin-left:5px;">debuger</el-tag>
    </template>
    <!-- TearDownDebuger标识 -->
    <template v-if="data.elementClass == 'TearDownGroupDebuger'">
      <el-tag size="mini" style="margin-left:5px;">teardown</el-tag>
      <el-tag size="mini" style="margin-left:5px;">debuger</el-tag>
    </template>
  </span>
</template>

<script>
export default {
  name: 'ElementName',
  props: {
    data: { type: Object, default: () => ({}) }
  }
}
</script>

<style lang="scss" scoped>
</style>
