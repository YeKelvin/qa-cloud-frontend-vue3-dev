import { isEmpty as _isEmpty } from 'lodash-es'
import { isBlank } from '@/utils/string-util'

export default function useHTTPBody() {
  const bodyCode = ref('')
  const bodyMode = ref('none')
  const bodyRawType = ref('json')
  const bodyRawTypeEnum = reactive({
    json: 'application/json',
    xml: 'application/xml',
    text: 'text/plain'
  })
  const bodyData = computed(() => {
    if (bodyMode.value === 'raw' || bodyMode.value === 'custom') {
      return bodyCode.value
    }
    return ''
  })
  const formItems = ref([])
  const formParameters = computed(() => {
    if (_isEmpty(parameters.value) || bodyMode.value !== 'x-www-form-urlencoded') return null
    const parameters = []
    parameters.value.forEach((item) => {
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

  /**
   * 设置 bodyMode
   */
  const setBodyMode = (contentType) => {
    if (!contentType || contentType.value === '') {
      bodyMode.value = 'none'
      return
    }
    if (contentType.value.indexOf('application/x-www-form-urlencoded') > -1) {
      bodyMode.value = 'x-www-form-urlencoded'
      return
    }
    if (contentType.value.indexOf('application/json') > -1) {
      bodyMode.value = 'raw'
      bodyRawType.value = 'json'
      return
    }
    if (contentType.value.indexOf('application/xml') > -1) {
      bodyMode.value = 'raw'
      bodyRawType.value = 'xml'
      return
    }
    if (contentType.value.indexOf('text/plain') > -1) {
      bodyMode.value = 'raw'
      bodyRawType.value = 'text'
      return
    }
    bodyMode.value = 'cutom'
  }

  return {
    bodyCode,
    bodyMode,
    bodyRawType,
    bodyRawTypeEnum,
    bodyData,
    formItems,
    formParameters,
    setBodyMode
  }
}
