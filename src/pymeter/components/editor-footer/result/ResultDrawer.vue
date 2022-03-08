<template>
  <el-drawer
    direction="btt"
    size="50%"
    custom-class="pymeter-footer-result-drawer"
    :show-close="false"
    @open="setFirstLoading"
  >
    <template #title>
      <span class="drawer-title">
        <el-tabs
          v-model="activeTabNo"
          type="card"
          style="width: 100%"
          closable
          @tab-click="handleTabClick"
          @tab-remove="handleTabRemove"
        >
          <el-tab-pane v-for="tab in tabs" :key="tab.id" :label="tab.name" :name="tab.id" />
        </el-tabs>
        <div v-show="!isEmpty(tabs)" class="clean-btn-wrapper">
          <el-button type="danger" :icon="Delete" circle plain @click="clean()" />
        </div>
      </span>
    </template>

    <ResultCollector v-if="!isEmpty(tabs)" :groups="activeDetails" />
    <el-empty v-if="isEmpty(tabs) && !loading" description="暂无结果" />
    <el-skeleton :loading="loading" :rows="6" style="padding: 40px" animated />
  </el-drawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { isEmpty } from 'lodash-es'
import { Delete } from '@element-plus/icons-vue'
import useSocket from '@/composables/useSocket'
import ResultCollector from './ResultCollector.vue'

const emit = defineEmits(['update:data'])
const props = defineProps({
  data: Array
})

const store = useStore()
const socket = useSocket()

const activeTabNo = ref('')
const activeDetails = ref([])
const loading = ref(false)

const tabs = computed({
  get() {
    return props.data
  },
  set(val) {
    emit('update:data', val)
  }
})
watch(tabs, () => {
  if (isEmpty(tabs.value)) return
  // 停止 loading
  loading.value = false
  // 激活最新的 tab
  const result = tabs.value[tabs.value.length - 1]
  activeTabNo.value = result.id
  activeDetails.value = result.details
})

const handleTabClick = (tab) => {
  const result = tabs.value.find((result) => result.id === tab.name)
  activeDetails.value = result.details
}
const handleTabRemove = (tabName) => {
  const index = tabs.value.findIndex((result) => result.id === tabName)
  if (index > -1) tabs.value.splice(index, 1)
}
const clean = () => {
  tabs.value = []
  store.commit('pymeter/closeResultDrawer')
}
const setFirstLoading = () => {
  if (!socket.id) return
  if (!isEmpty(tabs)) return
  loading.value = true
}
</script>

<style lang="scss" scoped>
.drawer-title {
  display: inline-flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 10px;
}

.clean-btn-wrapper {
  padding: 4px;
  padding-right: 20px;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-tabs__header) {
  margin: 0;
}
</style>
