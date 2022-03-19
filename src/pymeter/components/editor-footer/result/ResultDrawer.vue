<template>
  <el-drawer custom-class="pymeter-footer-result-drawer" direction="btt" size="50%" :show-close="false">
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
          <el-tab-pane v-for="tab in tabs" :key="tab.id" :label="tab.name" :name="tab.id">
            <template #label>
              <SvgIcon
                v-if="tab.running"
                icon-name="pymeter-running"
                style="width: 1.5em; height: 1.5em; margin-right: 5px"
              />
              <span>{{ tab.name }}</span>
            </template>
          </el-tab-pane>
        </el-tabs>
        <div v-show="!_isEmpty(tabs)" class="clean-btn-wrapper">
          <el-button type="danger" :icon="Delete" circle plain @click="clean()" />
        </div>
      </span>
    </template>

    <template v-if="_isEmpty(tabs)">
      <el-empty description="暂无结果" />
    </template>
    <template v-else>
      <ResultCollector v-if="!activeTabLoading" :groups="activeTabDetails" />
      <el-skeleton v-else :rows="6" style="padding: 40px" animated />
    </template>
  </el-drawer>
</template>

<script setup>
import { isEmpty as _isEmpty } from 'lodash-es'
import { Delete } from '@element-plus/icons-vue'
import ResultCollector from './ResultCollector.vue'

const emit = defineEmits(['update:data'])
const props = defineProps({
  data: Array
})

const store = useStore()

const activeTabNo = ref('')
const activeTabDetails = ref([])
const activeTabLoading = ref(false)

const tabs = computed({
  get() {
    return props.data
  },
  set(val) {
    emit('update:data', val)
  }
})

watch(
  tabs,
  () => {
    if (_isEmpty(tabs.value)) return
    // 激活最新的 tab
    const result = tabs.value[tabs.value.length - 1]
    activeTabNo.value = result.id
    activeTabDetails.value = result.details
    activeTabLoading.value = result.loading
  },
  { deep: true }
)

/**
 * 清空结果
 */
const clean = () => {
  tabs.value = []
  store.commit('pymeter/closeResultDrawer')
}

/**
 * el-tab handler
 */
const handleTabClick = (tab) => {
  const result = tabs.value.find((result) => result.id === tab.paneName)
  activeTabDetails.value = result.details
  activeTabLoading.value = result.loading
}

/**
 * el-tab handler
 */
const handleTabRemove = (tabName) => {
  if (activeTabNo.value === tabName) {
    for (let i = 0; i < tabs.value.length; i++) {
      const tab = tabs.value[i]
      if (tab.id === tabName) {
        const nextTab = tabs.value[i + 1] || tabs.value[i - 1]
        if (nextTab) {
          activeTabNo.value = nextTab.id
          activeTabDetails.value = nextTab.details
          activeTabLoading.value = nextTab.loading
        }
      }
    }
  }
  const index = tabs.value.findIndex((result) => result.id === tabName)
  if (index > -1) tabs.value.splice(index, 1)
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

:deep(.el-tabs__item) {
  display: inline-flex;
  align-items: center;
}
</style>
