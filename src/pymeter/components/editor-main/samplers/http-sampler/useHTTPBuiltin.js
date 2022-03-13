export default function useHTTPBuiltin() {
  const builtIn = ref([])
  const preCode = ref('')
  const testsCode = ref('')
  const PythonPreProcessor = computed(() => {
    return {
      elementName: 'Builtin PreProcessor',
      elementRemark: '',
      elementType: 'PRE_PROCESSOR',
      elementClass: 'PythonPreProcessor',
      property: { PythonPreProcessor__script: preCode.value }
    }
  })
  const PythonAssertion = computed(() => {
    return {
      elementName: 'Builtin Assertion',
      elementRemark: '',
      elementType: 'ASSERTION',
      elementClass: 'PythonAssertion',
      property: { PythonAssertion__script: testsCode.value }
    }
  })
  const pendingSubmitBuiltIn = computed(() => {
    const builtIns = [...builtIn.value]
    if (builtIns.length === 0) {
      builtIns.push(PythonPreProcessor.value)
      builtIns.push(PythonAssertion.value)
    } else {
      builtIns.forEach((item) => {
        if (item.elementType === 'PRE_PROCESSOR') {
          item.property.PythonPreProcessor__script = preCode.value
          return
        }
        if (item.elementType === 'ASSERTION') {
          item.property.PythonAssertion__script = testsCode.value
          return
        }
      })
    }
    return builtIns
  })

  return {
    builtIn,
    preCode,
    testsCode,
    pendingSubmitBuiltIn
  }
}
