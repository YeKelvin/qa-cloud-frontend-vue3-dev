import { isEmpty as _isEmpty } from 'lodash-es'
import { isBlank } from '@/utils/string-util'

export default function useHTTPQuery() {
  const queryItems = ref([])

  const queryParameters = computed(() => {
    if (_isEmpty(queryItems.value)) return null
    const parameters = []
    queryItems.forEach((item) => {
      if (isBlank(item.name)) return
      parameters.push({
        class: 'Argument',
        enabled: item.enabled,
        property: {
          Argument__name: item.name,
          Argument__value: item.value,
          Argument__desc: item.desc
        }
      })
    })
    if (_isEmpty(parameters)) return null
    return {
      class: 'Arguments',
      property: {
        Arguments__arguments: parameters
      }
    }
  })

  return {
    queryItems,
    queryParameters
  }
}
