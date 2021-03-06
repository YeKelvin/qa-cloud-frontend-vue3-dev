<template>
  <div class="manager-container">
    <!-- 骨架屏 -->
    <el-skeleton v-if="loading" :rows="10" style="padding: 10px" animated />

    <!-- 脚本集合列表 -->
    <span v-if="!loading" class="collection-list-container">
      <el-select
        v-model="selectedCollectionNumberedList"
        style="flex-grow: 1"
        tag-type="danger"
        size="large"
        filterable
        multiple
        :teleported="false"
      >
        <!-- 下拉框顶部的新增脚本按钮 -->
        <el-option-group key="new-operation" label="新增">
          <el-option value="NEW_COLLECTION">
            <el-button type="primary" link :icon="Plus" style="width: 100%" @click.stop="openNewCollectionTab()">
              新增集合
            </el-button>
          </el-option>
          <el-option value="NEW_SNIPPET">
            <el-button type="primary" link :icon="Plus" style="width: 100%" @click.stop="openNewSnippetTab()">
              新增片段
            </el-button>
          </el-option>
        </el-option-group>

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
        <el-option-group key="snippets" label="片段" style="padding-bottom: 50px">
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
      </el-select>
    </span>

    <!-- 选择脚本后才显示 -->
    <template v-if="!loading && !_isEmpty(selectedCollectionNumberedList)">
      <!-- 元素操作按钮 -->
      <div class="operation-container" style="margin-top: 5px">
        <!-- 展开节点按钮 -->
        <el-button type="primary" link @click="expandAll(true)">
          <SvgIcon icon-name="pymeter-expand-all" />
          展开
        </el-button>
        <el-divider direction="vertical" />
        <!-- 收起节点按钮 -->
        <el-button type="primary" link @click="expandAll(false)">
          <SvgIcon icon-name="pymeter-collapse-all" />
          收起
        </el-button>
        <el-divider direction="vertical" />
        <!-- 刷新脚本按钮 -->
        <el-button type="primary" link @click="queryElementsTree()">
          <SvgIcon icon-name="pymeter-refresh" />
          刷新
        </el-button>
      </div>
      <!-- 分割线 -->
      <el-divider />
      <!-- 脚本内容 -->
      <el-scrollbar
        ref="elScrollbarRef"
        style="width: 100%; height: 100%"
        wrap-style="overflow-x:auto;"
        view-style="padding:10px;"
      >
        <ElementTree ref="elementTreeRef" :collection-number-list="selectedCollectionNumberedList" />
      </el-scrollbar>
    </template>

    <!-- 没有选择脚本时给出提示 -->
    <el-empty v-if="!loading && _isEmpty(selectedCollectionNumberedList)" description="请选择脚本" />
  </div>
</template>

<script setup>
import { isEmpty as _isEmpty } from 'lodash-es'
import { Plus } from '@element-plus/icons-vue'
import * as ElementService from '@/api/script/element'
import useWorkspaceState from '@/composables/useWorkspaceState'
import usePyMeterState from '@/pymeter/composables/usePyMeterState'
import ElementTree from './ElementTree.vue'

const { workspaceNo } = useWorkspaceState()
const { refreshCollections, scrollToElementTreeBottom } = usePyMeterState()
const store = useStore()
const loading = ref(false)
const collections = ref([])
const snippets = ref([])
const elementTreeRef = ref()
const selectedCollectionNumberedList = computed({
  get() {
    return store.state.pymeter.selectedCollectionNumberedList
  },
  set(val) {
    if (!loading.value) store.commit('pymeter/setSelectedCollectionNumberedList', val)
  }
})
const elScrollbarRef = ref()

watch(workspaceNo, (val) => {
  if (!val) return
  // 重新查询集合列表
  queryCollections()
  // 清空已选择的集合
  selectedCollectionNumberedList.value = []
})
watch(refreshCollections, () => queryCollections())
watch(scrollToElementTreeBottom, () => scrollToBottom())

onMounted(() => {
  if (!workspaceNo.value) return
  queryCollections()
})

/**
 * 滚动至底部
 */
const scrollToBottom = () => {
  elScrollbarRef.value && elScrollbarRef.value.setScrollTop(elScrollbarRef.value.wrap$.clientHeight)
}

/**
 * 根据工作空间编号查询测试集合和脚本片段
 */
const queryCollections = async () => {
  // 加载中
  loading.value = true
  // 查询 TestCollection
  collections.value = (
    await ElementService.queryElementAll({
      workspaceNo: workspaceNo.value,
      elementType: 'COLLECTION',
      elementClass: 'TestCollection'
    })
  ).result
  // 查询 SnippetCollection
  snippets.value = (
    await ElementService.queryElementAll({
      workspaceNo: workspaceNo.value,
      elementType: 'COLLECTION',
      elementClass: 'SnippetCollection'
    })
  ).result
  // 加载完成
  loading.value = false
  // 提取集合编号
  const collectionNumberList = [...collections.value, ...snippets.value].map((item) => item.elementNo)
  // 遍历取消选择无效的集合
  for (let i = selectedCollectionNumberedList.value.length - 1; i >= 0; i--) {
    if (!collectionNumberList.includes(selectedCollectionNumberedList.value[i])) {
      selectedCollectionNumberedList.value.splice(i, 1)
    }
  }
}

/**
 * 根据集合编号查询测试案例
 */
const queryElementsTree = () => {
  elementTreeRef.value.queryElementsTree()
}

/**
 * 打开新增 TestCollection 的标签页
 */
const openNewCollectionTab = () => {
  store.commit({
    type: 'pymeter/addTab',
    editorNo: 'UNSAVED_COLLECTION',
    editorName: 'New Script',
    editorComponent: 'TestCollection',
    editorMode: 'CREATE'
  })
}

/**
 * 打开新增 SnippetCollection 的标签页
 */
const openNewSnippetTab = () => {
  store.commit({
    type: 'pymeter/addTab',
    editorNo: 'UNSAVED_SNIPPET',
    editorName: 'New Snippet',
    editorComponent: 'SnippetCollection',
    editorMode: 'CREATE'
  })
}

/**
 * 展开或收起所有节点
 */
const expandAll = (expand) => {
  elementTreeRef.value.expandAll(expand)
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

.collection-list-container {
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px;
}

.operation-container {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;

  .el-button--text {
    padding-top: 6px;
    padding-bottom: 6px;
  }

  .svg-icon {
    margin-right: 5px;
  }
}

:deep(.el-select-dropdown__wrap) {
  max-height: 400px;
}

:deep(.el-select-group__title) {
  font-size: 14px;
  font-weight: bold;
}
</style>
