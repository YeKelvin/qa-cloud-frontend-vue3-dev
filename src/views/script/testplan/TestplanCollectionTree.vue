<template>
  <div class="tree-container">
    <div v-show="collections.length > 0" style="width: 100%; height: 100%">
      <!-- 按钮 -->
      <div style="display: flex; justify-content: flex-end">
        <el-button type="text" :disabled="readonly" @click="setAllChecked">全选</el-button>
        <el-button type="text" :disabled="readonly" @click="resetChecked">清空</el-button>
      </div>

      <!-- 搜索 -->
      <el-input v-model="filterText" placeholder="请输入搜索内容" style="margin-bottom: 10px" clearable />

      <el-tree
        ref="tree"
        node-key="elementNo"
        draggable
        highlight-current
        show-checkbox
        :props="{ label: 'elementName', children: 'children' }"
        :data="collections"
        :allow-drop="allowDrop"
        :filter-node-method="filterNode"
        @node-click="handleNodeClick"
      >
        <template #default="{ node, data }">
          <span style="display: inline-flex; align-items: center">
            <el-tag size="small" style="margin-right: 10px">
              {{ node.parent.childNodes.findIndex((item) => item.key == data.elementNo) + 1 }}
            </el-tag>
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ node.label }}</span>
          </span>
        </template>
      </el-tree>
    </div>

    <!-- 空提示 -->
    <el-empty v-show="collections.length == 0" description="工作空间下暂无脚本" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as ElementService from '@/api/script/element'

export default {
  name: 'CollectionTree',

  props: {
    readonly: { type: Boolean, default: true }
  },

  data() {
    return {
      collections: [],
      filterText: ''
    }
  },

  computed: {
    ...mapState('workspace', {
      workspaceNo: (state) => state.workspaceNo
    })
  },

  watch: {
    workspaceNo(val) {
      if (!val) return
      this.queryCollections()
    },
    filterText(val) {
      this.$refs.tree.filter(val)
    },
    readonly(val) {
      if (val) {
        this.collections.forEach((item) => {
          item.disabled = true
        })
      } else {
        this.collections.forEach((item) => {
          item.disabled = false
        })
      }
    }
  },

  mounted() {
    if (this.workspaceNo) {
      this.queryCollections()
    }
  },

  methods: {
    /**
     * 根据工作空间编号查询测试集合
     */
    queryCollections() {
      ElementService.queryElementAll({
        workspaceNo: this.workspaceNo,
        elementType: 'COLLECTION',
        elementClass: 'TestCollection'
      }).then((response) => {
        this.collections = response.result
        if (this.readonly) {
          this.collections.forEach((item) => (item.disabled = true))
        }
      })
    },

    filterNode(value, data) {
      if (!value) return true
      return data.elementName.indexOf(value) !== -1
    },

    /**
     * 拖拽时判定目标节点能否被放置
     */
    allowDrop(draggingNode, dropNode, type) {
      // 只允许在 Collection 前后插入，不允许在 Collection 里插入
      if (type === 'inner') {
        return false
      }
      return true
    },

    getCheckedCollections() {
      const nodes = this.$refs.tree.getCheckedNodes()
      const collectionList = []
      for (let i = 0, len = nodes.length; i < len; i++) {
        collectionList.push({ sortNo: i, elementNo: nodes[i].elementNo })
      }
      return collectionList
    },

    setAllChecked() {
      this.$refs.tree.setCheckedKeys(this.collections.map((item) => item.elementNo))
    },

    setCheckedKeys(keys) {
      this.$refs.tree.setCheckedKeys(keys)
    },

    resetChecked() {
      this.$refs.tree.setCheckedKeys([])
    },

    handleNodeClick(data, node) {
      if (this.readonly) return
      // 点击节点勾选 checkbox
      node.checked = !node.checked
    }
  }
}
</script>

<style lang="scss" scoped>
.tree-container {
  height: 100%;

  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
}

:deep(.el-tree-node) {
  margin-bottom: 5px;
}
</style>
