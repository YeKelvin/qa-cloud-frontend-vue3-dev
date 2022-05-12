import { computed } from 'vue'
import { useStore } from 'vuex'

export default function usePyMeterState() {
  const store = useStore()

  const refreshCollections = computed(() => store.state.pymeter.refreshCollections)
  const refreshElementTree = computed(() => store.state.pymeter.refreshElementTree)
  const scrollToElementTreeBottom = computed(() => store.state.pymeter.scrollToElementTreeBottom)

  const globalDatasetList = computed(() => store.state.pymeter.globalDatasetList)
  const environmentDatasetList = computed(() => store.state.pymeter.environmentDatasetList)
  const customDatasetList = computed(() => store.state.pymeter.customDatasetList)
  const datasetList = computed(() => [
    ...globalDatasetList.value,
    ...environmentDatasetList.value,
    ...customDatasetList.value
  ])

  const httpHeaderTemplateList = computed(() => store.state.pymeter.httpHeaderTemplateList)

  const databaseEngineList = computed(() => store.state.pymeter.databaseEngineList)

  const selectedDatasetNumberList = computed(() => store.state.pymeter.selectedDatasetNumberList)
  const useCurrentValue = computed(() => store.state.pymeter.useCurrentValue)

  const showResultDrawer = computed({
    get() {
      return store.state.pymeter.showResultDrawer
    },
    set(val) {
      store.commit('pymeter/setShowResultDrawer', val)
    }
  })
  const showLogDrawer = computed({
    get() {
      return store.state.pymeter.showLogDrawer
    },
    set(val) {
      store.commit('pymeter/setShowLogDrawer', val)
    }
  })

  return {
    refreshCollections,
    refreshElementTree,
    scrollToElementTreeBottom,
    globalDatasetList,
    environmentDatasetList,
    customDatasetList,
    datasetList,
    httpHeaderTemplateList,
    databaseEngineList,
    selectedDatasetNumberList,
    useCurrentValue,
    showResultDrawer,
    showLogDrawer
  }
}
