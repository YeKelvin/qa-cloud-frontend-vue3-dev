import { isEmpty as _isEmpty } from 'lodash-es'
import { isBlank } from '@/utils/string-util'

export default function useHTTPHeader() {
  const headerItems = ref([])
  const headers = computed(() => {
    if (_isEmpty(headerItems.value)) return null
    const headers = []
    headerItems.value.forEach((item) => {
      if (isBlank(item.name)) return
      headers.push({
        class: 'HTTPHeader',
        enabled: item.enabled,
        property: {
          Header__name: item.name,
          Header__value: item.value
        }
      })
    })
    if (_isEmpty(headers)) return null
    return {
      class: 'HTTPHeaderManager',
      property: {
        HeaderManager__headers: headers
      }
    }
  })

  /**
   * 设置 content-type
   */
  const setContentType = (val) => {
    const header = headerItems.value.find((item) => item.name.toLowerCase() === 'content-type')
    if (header) {
      header.value = val
    } else {
      headerItems.value.push({ enabled: true, name: 'content-type', value: val })
    }
  }

  return {
    headerItems,
    headers,
    setContentType
  }
}
