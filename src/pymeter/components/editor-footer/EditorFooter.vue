<template>
  <el-card shadow="hover">
    <el-badge is-dot :hidden="resultsReaded">
      <el-button size="small" type="primary" plain @click="showResultDrawer = !showResultDrawer">响应结果</el-button>
    </el-badge>

    <el-button size="small" style="margin-left: 20px" type="primary" plain @click="showLogDrawer = !showLogDrawer">
      运行日志
    </el-button>

    <result-drawer
      v-model="results"
      v-model:visible="showResultDrawer"
      @open="resultsReaded = true"
      @closed="resultsReaded = true"
    />

    <log-drawer v-model="logs" v-model:visible="showLogDrawer" />
  </el-card>
</template>

<script>
import SocketIoMixin from '@/mixins/socketio-mixin'
import ResultDrawer from './result-drawer'
import LogDrawer from './log-drawer'

export default {
  name: 'EditorFooter',

  components: { ResultDrawer, LogDrawer },

  mixins: [SocketIoMixin],

  data() {
    return {
      results: [],
      resultsReaded: true,
      logs: [],
      logsReaded: true
    }
  },

  computed: {
    showResultDrawer: {
      get() {
        return this.$store.state.pymeter.showResultDrawer
      },
      set(val) {
        this.$store.commit('pymeter/setShowResultDrawer', val)
      }
    },
    showLogDrawer: {
      get() {
        return this.$store.state.pymeter.showLogDrawer
      },
      set(val) {
        this.$store.commit('pymeter/setShowLogDrawer', val)
      }
    }
  },

  beforeUnmount() {
    this.sockets.unsubscribe('pymeter_result_summary')
    this.sockets.unsubscribe('pymeter_group_result')
    this.sockets.unsubscribe('pymeter_sampler_result')
    this.sockets.unsubscribe('pymeter_message')
    this.sockets.unsubscribe('pymeter_log')
    this.sockets.unsubscribe('pymeter_completed')
    this.sockets.unsubscribe('pymeter_error')
    this.$socket.close()
  },

  methods: {},

  sockets: {
    pymeter_result_summary(data) {
      const result = this.results.find((result) => result.id === data.resultId)
      if (result) {
        Object.assign(result, data.result)
      } else {
        this.results.push(data.result)
      }
    },
    pymeter_group_result(data) {
      const result = this.results.find((result) => result.id === data.resultId)
      if (!result) return

      const group = result.details.find((group) => group.id === data.groupId)
      if (group) {
        Object.assign(group, data.group)
      } else {
        result.details.push(data.group)
      }
    },
    pymeter_sampler_result(data) {
      const result = this.results.find((result) => result.id === data.resultId)
      if (!result) return

      const group = result.details.find((group) => group.id === data.groupId)
      if (!group) return

      group.children.push(data.sampler)
      this.resultsReaded = false
    },
    pymeter_message(data) {
      this.$notify({ message: data, type: 'success', duration: 1 * 1000 })
    },
    pymeter_log(data) {
      this.logs.push(data)
    },
    pymeter_completed() {
      this.$notify({ message: '脚本执行完毕', type: 'success', duration: 2 * 1000 })
      this.$socket.close()
    },
    pymeter_error(data) {
      this.$notify({ message: data, type: 'error', duration: 2 * 1000 })
      this.$socket.close()
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.el-card__body) {
  display: flex;
  justify-content: flex-start;
  align-items: center;

  padding: 5px 20px;
  width: 100%;
  min-height: 30px;
}

:deep(.el-badge__content.is-dot) {
  height: 12px;
  width: 12px;
  right: 8px;
  top: 2px;
}
</style>
