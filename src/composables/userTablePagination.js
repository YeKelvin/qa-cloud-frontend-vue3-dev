import { ref, getCurrentInstance } from 'vue'

export default function userTablePagination() {
  const instance = getCurrentInstance()
  const page = ref(1)
  const pageSize = ref(10)
  const total = ref(0)

  const handleSizeChange = (val) => {
    pageSize.value = val
    instance.query()
  }

  const handleCurrentChange = (val) => {
    page.value = val
    instance.query()
  }

  return {
    page,
    pageSize,
    total,
    handleSizeChange,
    handleCurrentChange
  }
}
