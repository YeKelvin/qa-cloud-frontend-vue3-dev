import { computed } from 'vue'
import { useStore } from 'vuex'
import { isEmpty } from 'lodash-es'
import { ElMessageBox } from 'element-plus'
import * as ExecutionService from '@/api/script/execution'
import useSocketIO from '@/composables/useSocketIO'

export default function useRunnableElement(elementNo) {
  const store = useStore()
  const socketio = useSocketIO()

  const selectedDatasetNumberList = computed(() => store.state.pymeter.selectedDatasetNumberList)
  const useCurrentValue = computed(() => store.state.pymeter.useCurrentValue)

  /**
   * 根据 groupNo 执行脚本
   */
  const executeGroup = async (selfOnly = false) => {
    try {
      // 没有选择变量集时给出提示
      if (isEmpty(selectedDatasetNumberList.value)) {
        await ElMessageBox.confirm('当前没有选择[环境/变量]，确定执行吗？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
      }
      // 连接 socket
      socketio.connect()
      // 等待获取 sid，后再执行脚本
      const sid = await socketio.getId()
      // 后端异步执行脚本
      await ExecutionService.executeGroup({
        groupNo: elementNo,
        socketId: sid,
        variableDataSet: {
          useCurrentValue: useCurrentValue.value,
          numberList: selectedDatasetNumberList.value
        },
        selfOnly: selfOnly
      })
      // 打开结果面板
      store.commit('pymeter/openResultDrawer')
    } catch {
      // 异常时断开 socket 连接
      socketio.disconnect()
    }
  }

  return {
    executeGroup
  }
}
