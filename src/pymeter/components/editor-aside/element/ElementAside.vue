<template>
  <div class="manager-container">
    <!-- 骨架屏 -->
    <el-skeleton v-if="loading" :rows="10" style="padding: 10px" animated />

    <!-- 脚本集合列表 -->
    <span
      v-if="!loading"
      style="display: inline-flex; justify-content: space-between; align-items: center; padding: 5px 10px"
    >
      <el-select
        v-model="selectedCollectionNumberList"
        :teleported="false"
        size="large"
        style="flex-grow: 1"
        placeholder="脚本集合"
        filterable
        multiple
      >
        <!-- 脚本集合 -->
        <el-option-group key="collections" label="集合">
          <el-option
            v-for="collection in collections"
            :key="collection.elementNo"
            :label="collection.elementName"
            :value="collection.elementNo"
          >
            <!-- 脚本名称 -->
            <span style="float: left">{{ collection.elementName }}</span>

            <!-- 脚本禁用标识 -->
            <span style="float: right">
              <el-tag v-if="!collection.enabled" type="danger" size="small" style="margin-left: 10px">已禁用</el-tag>
            </span>
          </el-option>
        </el-option-group>

        <!-- 脚本片段 -->
        <el-option-group key="snippets" label="片段">
          <el-option
            v-for="snippet in snippets"
            :key="snippet.elementNo"
            :label="snippet.elementName"
            :value="snippet.elementNo"
          >
            <!-- 脚本名称 -->
            <span>{{ snippet.elementName }}</span>
          </el-option>
        </el-option-group>

        <!-- 下拉框底部的新增脚本按钮 -->
        <el-option-group key="new-operation" label="新增">
          <el-option value="NEW_COLLECTION">
            <el-button type="text" icon="el-icon-plus" style="width: 100%" @click.stop="openNewCollectionTab">
              新增集合
            </el-button>
          </el-option>
          <el-option value="NEW_SNIPPET">
            <el-button type="text" icon="el-icon-plus" style="width: 100%" @click.stop="openNewSnippetTab">
              新增片段
            </el-button>
          </el-option>
        </el-option-group>
      </el-select>
    </span>

    <!-- 选择脚本后才显示 -->
    <template v-if="!loading && selectedCollectionNumberList.length > 0">
      <!-- 元素操作按钮 -->
      <div class="operation-container" style="margin-top: 5px">
        <!-- 展开节点按钮 -->
        <el-button type="text" @click="expandAll(true)">
          <SvgIcon icon-name="pymeter-expand-all" style="margin-right: 5px" />
          展开
        </el-button>
        <el-divider direction="vertical" />
        <!-- 收起节点按钮 -->
        <el-button type="text" @click="expandAll(false)">
          <SvgIcon icon-name="pymeter-collapse-all" style="margin-right: 5px" />
          收起
        </el-button>
        <el-divider direction="vertical" />
        <!-- 刷新脚本按钮 -->
        <el-button type="text" @click="queryElementsTree">
          <SvgIcon icon-name="pymeter-refresh" style="margin-right: 5px" />
          刷新
        </el-button>
      </div>
      <!-- 分割线 -->
      <el-divider />
      <!-- 脚本内容 -->
      <el-scrollbar style="width: 100%; height: 100%" wrap-style="overflow-x:auto;" view-style="padding:10px;">
        <ElementTree ref="tree" :collection-number-list="selectedCollectionNumberList" />
      </el-scrollbar>
    </template>

    <!-- 没有选择脚本时给出提示 -->
    <el-empty v-if="!loading && selectedCollectionNumberList.length == 0" description="请选择脚本" />
  </div>
</template>

<script setup>
import { mapState } from 'vuex'
import * as ElementService from '@/api/script/element'
import ElementTree from './ElementTree'
</script>

<script>
export default {
  name: 'ElementAside',
  data() {
    return {
      loading: false,
      collections: [],
      snippets: []
    }
  },

  computed: {
    ...mapState('workspace', {
      workspaceNo: (state) => state.workspaceNo,
      workspaceList: (state) => state.workspaceList
    }),
    ...mapState('pymeter', {
      refreshCollections: (state) => state.refreshCollections
    }),
    // 当前选中的集合编号列表
    selectedCollectionNumberList: {
      get() {
        return this.$store.state.pymeter.selectedCollectionNumberList
      },
      set(val) {
        if (!this.loading) this.$store.commit('pymeter/setSelectedCollectionNumberList', val)
      }
    }
  },

  watch: {
    workspaceNo(val) {
      if (!val) return
      this.queryCollections()
      // 清空已选择的集合
      this.selectedCollectionNumberList = []
    },
    refreshCollections() {
      this.queryCollections()
    }
  },

  mounted() {
    if (!this.workspaceNo) return
    this.queryCollections()
  },

  methods: {
    /**
     * 根据工作空间编号查询测试集合和脚本片段
     */
    async queryCollections() {
      // 加载中
      this.loading = true
      // 查询 TestCollection
      this.collections = (
        await ElementService.queryElementAll({
          workspaceNo: this.workspaceNo,
          elementType: 'COLLECTION',
          elementClass: 'TestCollection'
        })
      ).result
      // 查询 TestSnippets
      this.snippets = (
        await ElementService.queryElementAll({
          workspaceNo: this.workspaceNo,
          elementType: 'COLLECTION',
          elementClass: 'TestSnippets'
        })
      ).result
      // 加载完成
      this.loading = false
      // 提取集合编号
      const collectionNumberList = [...this.collections, ...this.snippets].map((item) => item.elementNo)
      // 遍历取消选择无效的集合
      for (let i = this.selectedCollectionNumberList.length - 1; i >= 0; i--) {
        if (!collectionNumberList.includes(this.selectedCollectionNumberList[i])) {
          this.selectedCollectionNumberList.splice(i, 1)
        }
      }
    },

    /**
     * 根据集合编号查询测试案例
     */
    queryElementsTree() {
      this.$refs.tree.queryElementsTree()
    },

    /**
     * 打开新增 TestCollection 的标签页
     */
    openNewCollectionTab() {
      this.$store.commit({
        type: 'pymeter/addTab',
        editorNo: 'UNSAVED_COLLECTION',
        editorName: 'New Script',
        editorComponent: 'TestCollection',
        editorMode: 'CREATE'
      })
    },

    /**
     * 打开新增 TestSnippets 的标签页
     */
    openNewSnippetTab() {
      this.$store.commit({
        type: 'pymeter/addTab',
        editorNo: 'UNSAVED_SNIPPET',
        editorName: 'New Snippet',
        editorComponent: 'TestSnippets',
        editorMode: 'CREATE'
      })
    },

    /**
     * 展开或收起所有节点
     */
    expandAll(expand) {
      this.$refs.tree.expandAll(expand)
    }
  }
}
</script>

<style lang="scss" scoped>
.manager-container {
  display: flex;
  flex: 1;
  flex-direction: column;

  height: 100%;
  width: 100%;

  .el-divider--horizontal {
    width: 95%;
    margin: 5px 10px;
  }
}

.operation-container {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;

  .el-button--text {
    padding-top: 6px;
    padding-bottom: 6px;
  }
}

:deep(.el-select-dropdown__wrap) {
  max-height: 400px;
}
</style>
