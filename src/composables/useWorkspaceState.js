import { computed } from 'vue'
import { useStore } from 'vuex'

export default function useWorkspaceState() {
  const store = useStore()

  const workspaceNo = computed(() => store.state.workspace.workspaceNo)
  const workspaceList = computed(() => store.state.workspace.workspaceList)

  return {
    workspaceNo,
    workspaceList
  }
}
