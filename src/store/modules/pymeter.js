import store from '@/store'
import * as VariablesService from '@/api/script/variables'
import * as HttpHeadersService from '@/api/script/headers'

const state = {
  // 编辑器 tab 列表
  tabs: [],

  // 当前 tab 的编号（elementNo）
  activeTabNo: '',

  // 组件实例缓存
  cachedInstance: {},

  // 是否刷新集合列表
  refreshCollections: 0,

  // 是否刷新脚本内容
  refreshElementTree: 0,

  // 全局变量集列表
  globalDatasetList: [],
  // 环境变量集列表
  environmentDatasetList: [],
  // 自定义变量集列表
  customDatasetList: [],

  // 当前选中的变量集列表
  selectedDatasetNumberList: JSON.parse(localStorage.getItem('selectedDatasetNumberList')) || [],

  // 是否使用当前值
  useCurrentValue: localStorage.getItem('useCurrentValue') ? localStorage.getItem('useCurrentValue') === 'true' : true,

  // 当前选中的集合编号列表
  selectedCollectionNumberList: JSON.parse(localStorage.getItem('selectedCollectionNumberList')) || [],

  // 显示执行结果视图
  showResultDrawer: false,

  // 显示执行日志视图
  showLogDrawer: false,

  // 请求头模板列表
  httpHeaderTemplateList: []
}

const mutations = {
  /**
   * 设置当前选择的 tabName
   * @param {String} data  elementNo
   */
  setActiveTabNo: (state, data) => {
    state.activeTabNo = data
  },

  /**
   * 缓存组件实例，用于手动销毁 keep-alive 缓存
   */
  cacheInstance: (state, instance) => {
    state.cachedInstance[instance.editorNo] = instance
  },

  /**
   * 添加tab
   */
  addTab: (state, { editorNo, editorName, editorComponent, editorMode, metadata }) => {
    const tabs = [...state.tabs]

    let notExists = true
    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i]
      if (tab.editorNo === editorNo) {
        notExists = false
        state.activeTabNo = tab.editorNo
        break
      }
    }

    if (notExists) {
      state.tabs.push({
        editorNo: editorNo,
        editorName: editorName,
        editorComponent: editorComponent,
        editorMode: editorMode,
        metadata: metadata || {}
      })
      state.activeTabNo = editorNo
    }
  },

  /**
   * 关闭 tab 并清除 keep-alive 缓存
   */
  removeTab: (state, { editorNo }) => {
    const tabs = [...state.tabs]
    const tabNo = state.activeTabNo

    if (tabNo === editorNo) {
      for (let i = 0; i < tabs.length; i++) {
        const tab = tabs[i]
        if (tab.editorNo === editorNo) {
          const nextTab = tabs[i + 1] || tabs[i - 1]
          if (nextTab) {
            state.activeTabNo = nextTab.editorNo
          }
        }
      }
    }
    state.tabs = tabs.filter((tab) => tab.editorNo !== editorNo)

    // 手动删除 keep-alive 缓存
    const instance = state.cachedInstance[editorNo]
    if (!instance) return

    const keepaliveComponent = instance?.$vnode?.parent?.componentInstance?.$vnode?.componentInstance
    if (!keepaliveComponent) return

    const cache = keepaliveComponent.cache
    const keys = keepaliveComponent.keys
    if (cache[editorNo]) {
      if (keys.length) {
        const index = keys.indexOf(editorNo)
        if (index > -1) {
          keys.splice(index, 1)
        }
      }
      delete cache[editorNo]
    }

    instance.$destroy()
    delete state.cachedInstance[editorNo]
  },

  /**
   * 更新 tabName
   */
  updateTab: (state, { editorNo, editorName }) => {
    for (let i = 0; i < state.tabs.length; i++) {
      if (state.tabs[i].editorNo === editorNo) {
        state.tabs[i].editorName = editorName
      }
    }
  },

  /**
   * 立即刷新集合列表
   */
  refreshCollectionsNow: (state) => {
    state.refreshCollections += 1
  },

  /**
   * 立即刷新脚本内容
   */
  refreshElementTreeNow: (state) => {
    state.refreshElementTree += 1
  },

  setSelectedDatasetNumberList: (state, data) => {
    state.selectedDatasetNumberList = data
    localStorage.setItem('selectedDatasetNumberList', JSON.stringify(data))
  },

  setUseCurrentValue: (state, data) => {
    state.useCurrentValue = data
    localStorage.setItem('useCurrentValue', data)
  },

  setSelectedCollectionNumberList: (state, data) => {
    state.selectedCollectionNumberList = data
    localStorage.setItem('selectedCollectionNumberList', JSON.stringify(data))
  },

  setShowResultDrawer: (state, data) => {
    state.showResultDrawer = data
  },

  openResultDrawer: (state) => {
    state.showResultDrawer = true
  },

  closeResultDrawer: (state) => {
    state.showResultDrawer = false
  },

  setShowLogDrawer: (state, data) => {
    state.showLogDrawer = data
  },

  openLogDrawer: (state) => {
    state.showLogDrawer = true
  },

  closeLogDrawer: (state) => {
    state.showLogDrawer = false
  }
}

const actions = {
  /**
   * 关闭所有已打开的 tab 页
   */
  removeAllTab: ({ commit, state }) => {
    state.tabs.forEach((tab) => commit('removeTab', tab))
    state.activeTabNo = ''
  },

  /**
   * 查询所有数据集列表
   */
  async queryDatasetAll({ dispatch, commit, state }) {
    // 获取当前空间编号
    const workspaceNo = store.state.workspace.workspaceNo

    // 查询变量集列表
    // 全局变量
    state.globalDatasetList = (await VariablesService.queryVariableDatasetAll({ datasetType: 'GLOBAL' })).result
    // 环境变量
    state.environmentDatasetList = (
      await VariablesService.queryVariableDatasetAll({ workspaceNo: workspaceNo, datasetType: 'ENVIRONMENT' })
    ).result
    // 自定义变量
    state.customDatasetList = (
      await VariablesService.queryVariableDatasetAll({ workspaceNo: workspaceNo, datasetType: 'CUSTOM' })
    ).result

    // 判断是否存在无效数据，存在则删除
    const datasetNumberList = [
      ...state.globalDatasetList,
      ...state.environmentDatasetList,
      ...state.customDatasetList
    ].map((item) => item.datasetNo)

    // 当前选择的变量集不为空且不在变量集列表中时（表示该变量集已无效），删除该变量集编号
    for (let i = state.selectedDatasetNumberList.length - 1; i >= 0; i--) {
      if (!datasetNumberList.includes(state.selectedDatasetNumberList[i])) {
        // 删除无效数据
        state.selectedDatasetNumberList.splice(i, 1)
        commit('setSelectedDatasetNumberList', state.selectedDatasetNumberList)
      }
    }

    dispatch('disableOtherUnselectedEnvironmentDataset')
  },

  /**
   * 设置当前选中的变量集列表
   */
  setSelectedDatasetNumberList({ dispatch, commit }, data) {
    commit('setSelectedDatasetNumberList', data)
    dispatch('disableOtherUnselectedEnvironmentDataset')
  },

  /**
   * 禁用未选择的环境变量集（如果已选择了一个环境变量集）
   */
  disableOtherUnselectedEnvironmentDataset({ state }) {
    // 没有选中任何变量集时，开放所有环境变量集
    if (state.selectedDatasetNumberList.length === 0) {
      state.environmentDatasetList.forEach((env) => {
        env.disabled = false
      })
    }
    // 判断当前选中的变量集是否需要禁用
    state.selectedDatasetNumberList.forEach((datasetNo) => {
      const index = state.environmentDatasetList.findIndex((item) => item.datasetNo === datasetNo)
      // 已经选择了环境变量集，禁用其余环境变量集
      if (index > -1) {
        state.environmentDatasetList.forEach((env) => {
          env.disabled = env.datasetNo !== datasetNo
        })
        // 没有选择环境变量集时，开放所有环境变量集
      } else {
        state.environmentDatasetList.forEach((env) => {
          env.disabled = false
        })
      }
    })
  },

  /**
   * 查询所有请求头模板
   */
  queryHttpHeaderTemplateAll({ state }) {
    HttpHeadersService.queryHttpHeaderTemplateAll({ workspaceNo: store.state.workspace.workspaceNo }).then(
      (response) => {
        state.httpHeaderTemplateList = response.result
      }
    )
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
