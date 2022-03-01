import { computed } from 'vue'
import { useStore } from 'vuex'

export default function usePyMeterState() {
  const store = useStore()

  const globalDatasetList = computed(() => store.state.pymeter.globalDatasetList)
  const environmentDatasetList = computed(() => store.state.pymeter.environmentDatasetList)
  const customDatasetList = computed(() => store.state.pymeter.customDatasetList)
  const datasetList = computed(() => [
    ...globalDatasetList.value,
    ...environmentDatasetList.value,
    ...customDatasetList.value
  ])

  const selectedDatasetNumberList = computed(() => store.state.pymeter.selectedDatasetNumberList)
  const useCurrentValue = computed(() => store.state.pymeter.useCurrentValue)

  return {
    globalDatasetList,
    environmentDatasetList,
    customDatasetList,
    datasetList,
    selectedDatasetNumberList,
    useCurrentValue
  }
}
