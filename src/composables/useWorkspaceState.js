import { computed } from 'vue'
import { useStore } from 'vuex'

export default function useWorkspaceState() {
  const store = useStore()

  const workspaceList = computed(() => store.state.workspace.workspaceList)

  return {
    workspaceList
  }
}
