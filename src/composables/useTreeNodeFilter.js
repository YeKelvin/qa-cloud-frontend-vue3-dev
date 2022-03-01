import { defineProps, toRefs, ref, watch } from 'vue'

export default function useTreeNodeFilter(filterKey) {
  const props = defineProps({
    filterText: { type: String, default: '' }
  })
  const { filterText } = toRefs(props)
  const tree = ref()

  watch(filterText, (val) => tree.value.filter(val))

  const filter = (val) => {
    tree.value.filter(val)
  }

  const filterNode = (val, data) => {
    if (!val) return true
    return data[filterKey].indexOf(val) !== -1
  }

  defineExpose({
    filter
  })

  return {
    filterText,
    filter,
    filterNode
  }
}
