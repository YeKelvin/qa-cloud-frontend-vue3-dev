import { computed } from 'vue'
import { useStore } from 'vuex'

export default function useWorkspaceState() {
  const store = useStore()

  const workspaceNo = computed(() => store.state.workspace.workspaceNo)
  const workspaceName = computed(() => store.state.workspace.workspaceName)
  const workspaceScope = computed(() => store.state.workspace.workspaceScope)
  const workspaceList = computed(() => store.state.workspace.workspaceList)

  return {
    workspaceNo,
    workspaceName,
    workspaceScope,
    workspaceList
  }
}
