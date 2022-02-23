<template>
  <div id="Sidebar" :class="{ 'has-logo': showLogo }" class="sidebar-menu">
    <SidebarLogo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        :unique-opened="false"
        :text-color="variables.menuText"
        :background-color="variables.menuBg"
        :active-text-color="variables.menuActiveText"
        mode="vertical"
      >
        <SidebarItem v-for="route in permissionRoutes" :key="route.path" :item="route" :base-path="route.path" />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup>
import SidebarItem from './SidebarItem.vue'
import SidebarLogo from './SidebarLogo.vue'
import variables from '@/styles/variables.module.scss'
</script>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['permissionRoutes', 'sidebar']),
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  }
}
</script>

<style lang="scss">
.sidebar-menu {
  .el-menu {
    border-right: none;
  }
  .el-scrollbar__wrap {
    padding-bottom: 8vh;
  }
}
</style>
