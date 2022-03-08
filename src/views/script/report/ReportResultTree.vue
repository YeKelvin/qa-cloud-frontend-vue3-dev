<template>
  <el-tree
    v-bind="$attrs"
    ref="tree"
    node-key="id"
    highlight-current
    :indent="36"
    :expand-on-click-node="false"
    :props="definedProps"
    :filter-node-method="filterNode"
    @node-click="handleNodeClick"
  >
    <!-- 树节点 -->
    <span slot-scope="{ node }" class="element-tree-node">
      <!-- Group -->
      <template v-if="node.level == 1">
        <!-- 元素图标 -->
        <SvgIcon icon-name="group" style="padding-right: 5px" class="group-svg-icon" />
        <!-- 元素名称 -->
        <div style="display: flex; flex-direction: column; flex: 1">
          <span style="white-space: normal; overflow: hidden; text-overflow: ellipsis">{{ node.label }}</span>
          <span style="display: inline-flex; margin-top: 2px">
            <el-tag type="warning" size="small" style="margin-right: 5px">{{ node.data.startTime }}</el-tag>
            <el-tag type="warning" size="small" style="margin-right: 5px">{{ node.data.endTime }}</el-tag>
            <el-tag type="danger" size="small">{{ node.data.elapsedTime }}</el-tag>
          </span>
        </div>
        <SvgIcon v-if="node.data.success" icon-class="success" style="padding-left: 5px" class="stauts-svg-icon" />
        <SvgIcon v-else icon-class="fail" style="padding-left: 5px" class="stauts-svg-icon" />
      </template>
      <!-- Sampler -->
      <template v-else>
        <!-- 元素图标 -->
        <SvgIcon
          v-if="node.data.success"
          icon-class="successful-sampler"
          style="padding-right: 5px"
          class="sampler-svg-icon"
        />
        <SvgIcon
          v-else-if="!node.data.success && node.data.retrying"
          icon-class="warning-sampler"
          style="padding-right: 5px"
          class="sampler-svg-icon"
        />
        <SvgIcon v-else icon-class="failure-sampler" style="padding-right: 5px" class="sampler-svg-icon" />
        <!-- 元素名称 -->
        <span style="white-space: normal; overflow: hidden; text-overflow: ellipsis">{{ node.label }}</span>
        <el-tag type="info" size="small" style="margin-left: 5px">{{ node.data.elapsedTime }}</el-tag>
      </template>
    </span>
  </el-tree>
</template>

<script>
export default {
  name: 'ResultTree',

  props: {
    filterText: { type: String, default: '' }
  },

  data() {
    return {
      definedProps: {
        label: 'name',
        children: 'children'
      }
    }
  },

  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },

  methods: {
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    handleNodeClick(data, node) {
      this.$emit('node-click', data, node)
    }
  }
}
</script>

<style lang="scss" scoped>
.element-tree-node {
  display: flex;
  align-items: center;
  user-select: none;
  padding: 4px;
  width: 100%;
}

.stauts-svg-icon {
  height: 2em !important;
  width: 2em !important;
}

.group-svg-icon {
  height: 1.4em !important;
  width: 1.4em !important;
}

.sampler-svg-icon {
  height: 1.4em !important;
  width: 1.4em !important;
}
</style>
