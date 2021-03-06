export default function useEditor(props) {
  const { editorNo, editorMode } = toRefs(props)
  const editMode = ref(editorMode.value)
  const queryMode = computed(() => editMode.value === 'QUERY')
  const modifyMode = computed(() => editMode.value === 'MODIFY')
  const createMode = computed(() => editMode.value === 'CREATE')
  const store = useStore()

  /**
   * 开启编辑模式
   */
  const editNow = () => {
    editMode.value = 'MODIFY'
  }

  /**
   * 设为只读模式
   */
  const setReadonly = () => {
    editMode.value = 'QUERY'
  }

  /**
   * 更新 tab
   */
  const updateTabName = (name) => {
    store.commit({
      type: 'pymeter/updateTab',
      editorNo: editorNo.value,
      editorName: name
    })
  }

  /**
   * 关闭 tab
   */
  const closeTab = () => {
    store.commit({ type: 'pymeter/removeTab', editorNo: editorNo.value })
  }

  /**
   * 重新查询集合列表
   */
  const refreshCollections = () => {
    store.commit('pymeter/refreshCollectionsNow')
  }

  /**
   * 添加集合编号至列表中
   */
  const addSelectedCollectionNumberedList = (collectionNo) => {
    store.commit('pymeter/addSelectedCollectionNumberedList', collectionNo)
  }

  /**
   * 重新查询脚本列表
   */
  const refreshElementTree = () => {
    store.commit('pymeter/refreshElementTreeNow')
  }

  /**
   * 滚动至脚本列表底部
   */
  const scrollToElementTreeBottom = () => {
    store.commit('pymeter/scrollToElementTreeBottom')
  }

  /**
   * 重新加载列表
   */
  const queryDatasetAll = () => {
    store.dispatch('pymeter/queryDatasetAll')
  }

  const queryHttpHeaderTemplateAll = () => {
    store.dispatch('pymeter/queryHttpHeaderTemplateAll')
  }

  const queryDatabaseEngineAll = () => {
    store.dispatch('pymeter/queryDatabaseEngineAll')
  }

  return {
    editMode,
    queryMode,
    modifyMode,
    createMode,
    editNow,
    setReadonly,
    updateTabName,
    closeTab,
    refreshCollections,
    addSelectedCollectionNumberedList,
    refreshElementTree,
    scrollToElementTreeBottom,
    queryDatasetAll,
    queryHttpHeaderTemplateAll,
    queryDatabaseEngineAll
  }
}
