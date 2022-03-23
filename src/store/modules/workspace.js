import store from '@/store'
import * as WorkspaceService from '@/api/public/workspace'

const state = {
  /**
   * 当前选择的工作空间编号（优先从localStorage读取）
   */
  workspaceNo: localStorage.getItem('workspaceNo') || '',

  /**
   * 当前选择的工作空间名称（优先从localStorage读取）
   */
  workspaceName: localStorage.getItem('workspaceName') || '请选择工作空间',

  /**
   * 当前选择的工作空间作用域（优先从localStorage读取）
   */
  workspaceScope: localStorage.getItem('workspaceScope') || '',

  /**
   * 工作空间列表
   */
  workspaceList: []
}

const mutations = {
  setWorkspaceNo: (state, data) => {
    state.workspaceNo = data
    localStorage.setItem('workspaceNo', data)
    // 关闭所有在 PyMeter 编辑器中打开的 tab 页
    store.dispatch('pymeter/removeAllTab')
    // 重新查询变量集列表
    store.dispatch('pymeter/queryDatasetAll')
    // 清空已选择的变量集列表
    store.dispatch('pymeter/setSelectedDatasetNumberList', [])
    // 重新查询 http 请求头模板列表
    store.dispatch('pymeter/queryHttpHeaderTemplateAll')
  },
  setWorkspaceName: (state, data) => {
    state.workspaceName = data
    localStorage.setItem('workspaceName', data)
  },
  setWorkspaceScope: (state, data) => {
    state.workspaceScope = data
    localStorage.setItem('workspaceScope', data)
  },
  setWorkspaceList: (state, data) => {
    state.workspaceList = data
  }
}

const actions = {
  /**
   * 查询所有工作空间
   */
  setWorkspaceList({ commit, state }) {
    const userNo = store.getters?.userNo
    if (!userNo) return
    WorkspaceService.queryWorkspaceAll({ userNo: userNo }).then((response) => {
      commit('setWorkspaceList', response.result)
      // 当前工作空间不为空且不在工作空间列表中时（表示该工作空间已无效），清空localStorage
      if (state.workspaceNo !== '') {
        if (response.result.findIndex((item) => item.workspaceNo === state.workspaceNo) < 0) {
          state.workspaceNo = ''
          state.workspaceName = '工作空间'
          localStorage.removeItem('workspaceNo')
          localStorage.removeItem('workspaceName')
          localStorage.removeItem('workspaceScope')
        }
      } else {
        // 如果当前未选择工作空间，清空已选择的脚本列表
        localStorage.removeItem('selectedCollectionNumberList')
      }
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
