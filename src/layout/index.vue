<template>
  <div :class="classObj" class="app-wrapper">
    <!--left side-->
    <Sidebar class="sidebar-container" />
    <!--right container-->
    <div class="main-container">
      <div :class="{ 'fixed-header': fixedHeader }">
        <Navbar />
      </div>
      <AppMain />
    </div>
  </div>
</template>

<script setup>
import { Navbar, Sidebar, AppMain } from './components'
import useResizeHandler from './useResizeHandler'

const store = useStore()
const route = useRoute()
const sidebar = computed(() => store.state.app.sidebar)
const device = computed(() => store.state.app.device)
const fixedHeader = computed(() => store.state.settings.fixedHeader)
const classObj = computed(() => {
  return {
    hideSidebar: !sidebar.value.opened,
    openSidebar: sidebar.value.opened,
    withoutAnimation: sidebar.value.withoutAnimation
  }
})

watch(route, () => {
  if (device.value === 'mobile' && sidebar.value.opened) {
    store.dispatch('app/closeSideBar', { withoutAnimation: false })
  }
})

useResizeHandler()
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.app-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
}
.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: calc(100% - #{$sideBarWidth});
  transition: width 0.28s;
}
.hideSidebar .fixed-header {
  width: calc(100% - 54px);
}
</style>
