<template>
  <div class="navbar">
    <div class="three-column-flexbox">
      <Hamburger :is-active="sidebar.opened" class="hamburger-container" @toggle-click="toggleSideBar" />
      <Breadcrumb />
    </div>

    <div class="three-column-flexbox" style="justify-content: center">
      <WorkspaceSelect v-show="displayWorkspaceRoute.includes($route.path)" />
    </div>

    <div class="three-column-flexbox right-menu" style="justify-content: flex-end">
      <template v-if="device !== 'mobile'">
        <Search id="header-search" class="right-menu-item" />
        <Screenfull id="screenfull" class="right-menu-item hover-effect" />
      </template>

      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatar" class="user-avatar" />
          <CaretBottom style="width: 1em; height: 1em; margin-left: 4px" />
        </div>
        <template #dropdown>
          <el-dropdown-menu class="user-dropdown">
            <el-dropdown-item @click="logout">
              <span style="display: block">Log Out</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { CaretBottom } from '@element-plus/icons-vue'
import Breadcrumb from './NavbarBreadcrumb.vue'
import Hamburger from './NavbarHamburger.vue'
import Screenfull from './NavbarScreenfull.vue'
import Search from './NavbarSearch.vue'
import WorkspaceSelect from './NavbarWorkspace.vue'
</script>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Navbar',
  data() {
    return {
      displayWorkspaceRoute: ['/script/editor', '/script/testplan', '/system/workspace']
    }
  },
  computed: {
    ...mapGetters(['sidebar', 'avatar', 'device'])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('user/logout').then(() => {
        // 刷新页面
        location.reload()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  display: flex;
  align-items: center;

  height: 50px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.hamburger-container {
  cursor: pointer;
  line-height: 46px;
  height: 100%;
  transition: background 0.3s;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: rgba(0, 0, 0, 0.025);
  }
}

.right-menu {
  height: 100%;
  line-height: 50px;

  &:focus {
    outline: none;
  }
}

.right-menu-item {
  display: inline-block;
  padding: 0 8px;
  height: 100%;
  font-size: 18px;
  color: #5a5e66;
  vertical-align: text-bottom;

  &.hover-effect {
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }
}

.avatar-container {
  margin-right: 20px;
  .avatar-wrapper {
    cursor: pointer;
    display: flex;
    align-items: flex-end;
  }
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
}

.three-column-flexbox {
  display: flex;
  flex: 1 1 33.33%;
  align-items: center;
}
</style>
