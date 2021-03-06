<template>
  <div class="pymeter-component-container" style="padding-bottom: 40px">
    <!-- 模板名称和操作按钮 -->
    <div class="header-container">
      <!-- 搜索 -->
      <span style="display: inline-flex; flex: 1; margin-right: 10px">
        <el-input v-show="queryMode" v-model="filterText" placeholder="请输入" clearable />
      </span>

      <!-- 操作按钮 -->
      <span style="display: inline-flex">
        <template v-if="queryMode">
          <el-button type="primary" link :icon="Edit" @click="batchEditNow()">批量编辑</el-button>
          <el-button type="primary" link :icon="Close" @click="closeTab()">关闭</el-button>
        </template>
        <template v-else-if="!createMode">
          <el-button type="primary" link :icon="Check" @click="saveHeaders()">保存</el-button>
          <el-button type="primary" link :icon="Close" @click="cancelEdit()">取消</el-button>
        </template>
        <template v-else>
          <el-button type="primary" link :icon="Check" @click="createHeaders()">提交</el-button>
        </template>
      </span>
    </div>

    <!-- 请求头表格 -->
    <el-table ref="eltableRef" :data="filteredTableData" fit stripe highlight-current-row>
      <!-- 数据为空时显示添加按钮 -->
      <template #empty><el-empty description=" " /></template>

      <!-- 是否启用 -->
      <el-table-column v-if="queryMode" label="启用" align="center" width="60" min-width="60">
        <template #default="{ row }">
          <el-checkbox v-model="row.enabled" @click.prevent="modifyHeaderState(row)" />
        </template>
      </el-table-column>

      <!-- 请求头名称 -->
      <el-table-column label="请求头名称">
        <template #default="{ row }">
          <SimpleTextarea v-if="!queryMode || row.editing" v-model="row.headerName" />
          <span v-else>{{ row.headerName }}</span>
        </template>
      </el-table-column>

      <!-- 请求头的值 -->
      <el-table-column label="请求头内容">
        <template #default="{ row }">
          <SimpleTextarea v-if="!queryMode || row.editing" v-model="row.headerValue" />
          <span v-else>{{ row.headerValue }}</span>
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column fixed="right" align="center" width="80" min-width="80">
        <!-- 操作列表格头，新增请求头按钮 -->
        <template #header>
          <el-button type="primary" link :icon="Plus" :disabled="!queryMode" @click="newAndEditHeader()">
            添加
          </el-button>
        </template>
        <!-- 操作按钮 -->
        <template #default="{ row, $index }">
          <!-- 编辑或新增模式下可用的按钮 -->
          <!-- 删除请求头按钮 -->
          <el-button v-if="!queryMode" type="primary" link :icon="Close" @click="cancelHeader(row, $index)" />
          <!-- 查询模式下可用的按钮 -->
          <template v-if="queryMode">
            <template v-if="row.editing">
              <!-- 取消单行编辑按钮 -->
              <el-button type="primary" link :icon="Close" @click="queryHeaders()" />
              <!-- 提交单行编辑按钮 -->
              <el-button type="primary" link :icon="Check" @click="submitSingleHeader(row)" />
            </template>
            <template v-else>
              <!-- 编辑单行请求头按钮 -->
              <el-button type="primary" link :icon="Edit" @click="row.editing = true" />
              <!-- 删除请求头按钮 -->
              <el-button type="primary" link :icon="Delete" @click="removeHeader(row)" />
            </template>
          </template>
        </template>
      </el-table-column>
    </el-table>
    <!-- 底部添加按钮 -->
    <el-button v-show="queryMode" type="primary" link :icon="Plus" @click="newAndEditHeader()">添加</el-button>
  </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Close, Delete, Edit, Plus } from '@element-plus/icons-vue'
import { isEmpty as _isEmpty, has as _has } from 'lodash-es'
import { isBlank, isBlankAll, isNotBlank } from '@/utils/string-util'
import editorProps from '@/pymeter/composables/editor.props'
import useEditor from '@/pymeter/composables/useEditor'
import SimpleTextarea from '@/components/simple-textarea/SimpleTextarea.vue'
import * as HttpHeadersService from '@/api/script/headers'

const props = defineProps(editorProps)
const { queryMode, createMode, editNow, setReadonly, closeTab, queryHttpHeaderTemplateAll } = useEditor(props)
const eltableRef = ref()
const templateNo = ref(props.editorNo)
const rows = ref([])
const pendingDeletionList = ref([])
const filterText = ref('')
const filteredTableData = computed(() => {
  if (isBlank(filterText.value)) {
    return rows.value
  } else {
    return rows.value.filter(
      (item) =>
        (item.headerName && item.headerName.indexOf(filterText.value.trim())) !== -1 ||
        (item.headerValue && item.headerValue.indexOf(filterText.value.trim())) !== -1 ||
        (item.headerDesc && item.headerDesc.indexOf(filterText.value.trim())) !== -1
    )
  }
})

watch(queryMode, () => {
  // 动态显隐表格列后重新渲染表格
  nextTick(() => {
    eltableRef.value.doLayout()
  })
  // 表格没有数据时自动添加一行
  autoNewRow()
})

watch(rows, () => autoNewRow(), { deep: true })

onMounted(() => {
  if (createMode.value) {
    newHeader()
  } else {
    // 查询或编辑模式时，先拉取变量信息
    queryHeaders()
  }
})

/**
 * 切换为批量编辑模式
 */
const batchEditNow = () => {
  filterText.value = ''
  editNow()
}

/**
 * 最后一行不为空时，自动添加一行
 */
const autoNewRow = () => {
  if (queryMode.value) return
  if (_isEmpty(rows.value)) {
    newHeader()
  } else {
    const lastRow = rows.value[rows.value.length - 1]
    if (!isBlankRow(lastRow)) newHeader()
  }
}

/**
 * 查询模板下的所有请求头
 */
const queryHeaders = () => {
  HttpHeadersService.queryHttpHeadersByTemplate({ templateNo: templateNo.value }).then((response) => {
    rows.value = response.result
    pendingDeletionList.value = []
  })
}

/**
 * 新增一行空行
 */
const newHeader = () => {
  rows.value.push({ headerName: '', headerValue: '', headerDesc: '', enabled: true })
}

/**
 * 新增一行空行并滚动至底部
 */
const newAndEditHeader = () => {
  rows.value.push({ headerName: '', headerValue: '', headerDesc: '', enabled: true, editing: true })
  scrollToBottom()
}

/**
 * 滚动至底部
 */
const scrollToBottom = () => {
  const scrollbar = document.querySelector('#editor-main-scrollbar > .el-scrollbar__wrap')
  scrollbar.scrollTop = scrollbar.scrollHeight
}

/**
 * 根据索引号删除行
 */
const cancelHeader = (row, index) => {
  if (_has(row, 'headerNo')) {
    // 存在 headerNo 时，添加至待删除列表中，等待提交时调用批量删除请求头接口
    pendingDeletionList.value.push(row)
    rows.value.splice(index, 1)
  } else {
    // 没有 headerNo 时，代表数据库中没有该请求头，直接移出提交列表
    rows.value.splice(index, 1)
  }
}

/**
 * 新增或修改单个请求头
 */
const submitSingleHeader = (row) => {
  if (isBlank(row.headerName)) {
    ElMessage({ message: '请求头不允许为空', type: 'error', duration: 2 * 1000 })
    return
  }

  if (isNotBlank(row.headerNo)) {
    // 修改请求头
    HttpHeadersService.modifyHttpHeader({
      headerNo: row.headerNo,
      headerName: row.headerName,
      headerValue: row.headerValue,
      headerDesc: row.headerDesc
    }).then(() => {
      ElMessage({ message: '修改成功', type: 'info', duration: 2 * 1000 })
      queryHeaders()
    })
  } else {
    // 新增请求头
    HttpHeadersService.createHttpHeader({
      templateNo: templateNo.value,
      headerName: row.headerName,
      headerValue: row.headerValue,
      headerDesc: row.headerDesc
    }).then(() => {
      // 成功提示
      ElMessage({ message: '新增成功', type: 'info', duration: 2 * 1000 })
      // 重新查询请求头
      queryHeaders()
    })
  }
}

/**
 * 根据索引号删除行
 */
const removeHeader = async (row) => {
  // 二次确认
  const error = await deletionComfirm(row.headerName)
  if (error) return
  // 删除请求头
  await HttpHeadersService.deleteHttpHeader({ headerNo: row.headerNo })
  // 删除请求头所在行数据
  const index = rows.value.findIndex((item) => item.headerName === row.headerName)
  rows.value.splice(index, 1)
}

/**
 * 修改请求头启用状态
 */
const modifyHeaderState = (row) => {
  // 切换请求头状态
  row.enabled = !row.enabled
  // 调用接口变更请求头状态
  if (row.enabled) {
    HttpHeadersService.enableHttpHeader({ headerNo: row.headerNo })
  } else {
    HttpHeadersService.disableHttpHeader({ headerNo: row.headerNo })
  }
}

const deletionComfirm = async (...args) => {
  const msgList = [h('p', null, '确定删除以下请求头吗？')]
  args.forEach((item) => msgList.push(h('p', null, item)))
  return await ElMessageBox.confirm(null, {
    title: '警告',
    message: h('div', null, msgList),
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  })
    .then(() => false)
    .catch(() => true)
}

/**
 * 保存编辑后的请求头
 */
const saveHeaders = async () => {
  // 手动清空的空行如果存在 headerNo 则加入待删除列表
  rows.value
    .filter((row) => isBlankRow(row))
    .forEach((row) => {
      if (_has(row, 'headerNo')) {
        pendingDeletionList.value.push(row)
      }
    })

  // 批量删除变量
  if (!_isEmpty(pendingDeletionList.value)) {
    await HttpHeadersService.deleteHttpHeaders({
      templateNo: templateNo.value,
      headerNumberedList: pendingDeletionList.value.map((item) => item.headerNo)
    })
  }

  // 批量更新请求头
  const headers = rows.value.filter((row) => !isBlankRow(row))
  await HttpHeadersService.modifyHttpHeaders({
    templateNo: templateNo.value,
    headerList: headers
  })

  // 成功提示
  ElMessage({ message: '编辑成功', type: 'info', duration: 2 * 1000 })
  // 重新查询请求头
  queryHeaders()
  // 切换为只读模式
  setReadonly()
  // 重新查询列表
  queryHttpHeaderTemplateAll()
}

/**
 * 新增模板和请求头
 */
const createHeaders = async () => {
  // 过滤空行
  const headers = rows.value.filter((row) => !isBlankRow(row))
  if (_isEmpty(headers)) {
    ElMessage({ message: '请求头不能为空', type: 'error', duration: 2 * 1000 })
    return
  }

  // 批量新增请求头
  await HttpHeadersService.createHttpHeaders({
    templateNo: templateNo.value,
    headerList: headers
  })

  // 成功提示
  ElMessage({ message: '新增成功', type: 'info', duration: 2 * 1000 })
  // 切换为只读模式
  setReadonly()
  // 重新查询列表
  queryHttpHeaderTemplateAll()
  // 关闭tab
  closeTab()
}

/**
 * 取消编辑
 */
const cancelEdit = () => {
  queryHeaders()
  setReadonly()
}

/**
 * 判断是否为空行
 */
const isBlankRow = (row) => {
  return isBlankAll(row.headerName, row.headerValue, row.headerDesc)
}
</script>

<style lang="scss" scoped>
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;

  width: 100%;
  padding: 0 15px;
  margin-bottom: 10px;

  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}

span {
  white-space: pre-wrap;
  text-overflow: ellipsis;
  letter-spacing: 0.6px;
}
</style>
