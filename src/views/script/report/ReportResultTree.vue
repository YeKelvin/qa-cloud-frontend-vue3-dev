<template>
  <el-tree
    ref="eltreeRef"
    node-key="id"
    highlight-current
    :indent="36"
    :expand-on-click-node="false"
    :filter-node-method="filterNode"
    :props="{ label: 'name', children: 'children' }"
    @node-click="handleNodeClick"
  >
    <template #default="{ node }">
      <!-- 树节点 -->
      <span class="tree-item">
        <!-- Group -->
        <template v-if="node.level == 1">
          <!-- 元素图标 -->
          <SvgIcon icon-name="pymeter-group" style="padding-right: 5px" class="group-icon" />
          <!-- 元素名称 -->
          <div class="group-name-wrapper">
            <span class="element-name">{{ node.label }}</span>
            <span class="result-time-wrapper">
              <el-tag type="warning" size="small">{{ node.data.startTime }}</el-tag>
              <el-tag type="warning" size="small">{{ node.data.endTime }}</el-tag>
              <el-tag type="danger" size="small">{{ node.data.elapsedTime }}</el-tag>
            </span>
          </div>
          <SvgIcon v-if="node.data.success" icon-name="pymeter-success" style="padding-left: 5px" class="stauts-icon" />
          <SvgIcon v-else icon-name="pymeter-failure" style="padding-left: 5px" class="stauts-icon" />
        </template>

        <!-- Sampler -->
        <template v-else>
          <!-- 元素图标 -->
          <SvgIcon v-if="node.data.success" icon-name="pymeter-successful-sampler" class="sampler-icon" />
          <SvgIcon
            v-else-if="!node.data.success && node.data.retrying"
            icon-name="pymeter-warning-sampler"
            class="sampler-icon"
          />
          <SvgIcon v-else icon-name="pymeter-failure-sampler" class="sampler-icon" />
          <!-- 元素名称 -->
          <span class="element-name" style="margin-left: 5px">{{ node.label }}</span>
          <el-tag type="info" size="small" style="margin-left: 5px">{{ node.data.elapsedTime }}</el-tag>
        </template>
      </span>
    </template>
  </el-tree>
</template>

<script setup>
const emit = defineEmits(['node-click'])
const props = defineProps({
  filterText: { type: String, default: '' }
})
const eltreeRef = ref()
watch(
  () => props.filterText,
  (val) => eltreeRef.value.filter(val)
)
const filterNode = (value, data) => {
  if (!value) return true
  return data.name.indexOf(value) !== -1
}
const handleNodeClick = (data, node) => {
  emit('node-click', data, node)
}
</script>

<style lang="scss" scoped>
.tree-item {
  display: flex;
  align-items: center;
  user-select: none;
  padding: 4px;
  width: 100%;
}

.group-name-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.element-name {
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-time-wrapper {
  display: inline-flex;
  flex-wrap: wrap;
  margin-top: 2px;

  .el-tag {
    margin-right: 5px;
  }
}

.stauts-icon {
  height: 2em !important;
  width: 2em !important;
}

.group-icon {
  height: 1.4em !important;
  width: 1.4em !important;
}

.sampler-icon {
  height: 1.4em !important;
  width: 1.4em !important;
}
</style>
