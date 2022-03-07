import { computed } from 'vue'
import { useStore } from 'vuex'

export default function usePyMeterState() {
  const store = useStore()

  const refreshElementTree = computed(() => store.state.pymeter.refreshElementTree)

  const globalDatasetList = computed(() => store.state.pymeter.globalDatasetList)
  const environmentDatasetList = computed(() => store.state.pymeter.environmentDatasetList)
  const customDatasetList = computed(() => store.state.pymeter.customDatasetList)
  const datasetList = computed(() => [
    ...globalDatasetList.value,
    ...environmentDatasetList.value,
    ...customDatasetList.value
  ])

  const httpHeaderTemplateList = computed(() => store.state.pymeter.httpHeaderTemplateList)

  // const selectedDatasetNumberList = computed(() => store.state.pymeter.selectedDatasetNumberList)
  const selectedDatasetNumberList = computed({
    get() {
      return store.state.pymeter.selectedDatasetNumberList
    },
    set(val) {
      if (this.show) this.$store.dispatch('pymeter/setSelectedDatasetNumberList', val)
    }
  })
  const useCurrentValue = computed(() => store.state.pymeter.useCurrentValue)

  return {
    refreshElementTree,
    globalDatasetList,
    environmentDatasetList,
    customDatasetList,
    datasetList,
    httpHeaderTemplateList,
    selectedDatasetNumberList,
    useCurrentValue
  }
}
