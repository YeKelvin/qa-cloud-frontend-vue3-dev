<template>
  <el-scrollbar style="width: 100%; height: 400px" wrap-style="overflow-x:auto;" view-style="padding:10px;">
    <div style="padding-bottom: 20px">
      <h1>字段说明：</h1>
      <el-table :data="fieldTableData" size="small" style="width: 650px" fit border stripe highlight-current-row>
        <el-table-column prop="field" label="字段" min-width="100" width="100" />
        <el-table-column prop="allowance" label="允许值" />
        <el-table-column prop="specialCharacters" label="特殊字符" min-width="80" width="80" />
      </el-table>
      <h1>字符说明：</h1>
      <el-table :data="characterTableData" size="small" style="width: 650px" fit border stripe highlight-current-row>
        <el-table-column prop="field" label="字段" min-width="100" width="100" />
        <el-table-column prop="explanation" label="说明" />
      </el-table>
      <h1>范例：</h1>
      <el-table :data="exampleTableData" size="small" style="width: 650px" fit border stripe highlight-current-row>
        <el-table-column prop="description" label="描述" min-width="300" width="300" />
        <el-table-column prop="example" label="范例" />
      </el-table>
    </div>
  </el-scrollbar>
</template>

<script setup>
const fieldTableData = ref([
  // { field: 'Seconds', allowance: '0–59', specialCharacters: '* , - /' },
  { field: 'Minutes', allowance: '0–59', specialCharacters: '* , - /' },
  { field: 'Hours', allowance: '0–23', specialCharacters: '* , - /' },
  { field: 'Day of month', allowance: '1–31', specialCharacters: '* , - / ? L' },
  {
    field: 'Month',
    allowance: '1–12 or JAN, FEB, MAR, APR, MAY, JUN, JUL, AUG, SEP, OCT, NOV, DEC',
    specialCharacters: '* , - /'
  },
  { field: 'Day of week', allowance: '0-6 or MON, TUE, WED, THU, FRI, SAT, SUN', specialCharacters: '* , - / ? L' }
])
const characterTableData = ref([
  { field: '*', explanation: '通配' },
  { field: ',', explanation: '指定多个值' },
  { field: '/', explanation: '增长步长，如 n/m 表示从 n 开始，每次增加 m' },
  { field: '?', explanation: '每月的某一天，或每周的某一天' },
  { field: 'L', explanation: '用在日时表示每月的最后一天，用在周时每月的最后一个周' }
])
const exampleTableData = ref([
  { description: '每隔1分钟执行一次', example: '0 */1 * * * ?' },
  { description: '每天23点执行一次', example: '0 0 23 * * ?' },
  { description: '每天凌晨1点执行一次', example: '0 0 1 * * ?' },
  { description: '每月1号凌晨1点执行一次', example: '0 0 1 1 * ?' },
  { description: '每月最后一天23点执行一次', example: '0 0 23 L * ?' },
  { description: '每周星期天凌晨1点实行一次', example: '0 0 1 ? * L' },
  { description: '在26分、29分、33分执行一次', example: '0 26,29,33 * * * ?' },
  { description: '每天的0点、13点、18点、21点都执行一次', example: '0 0 0,13,18,21 * * ?' }
])
</script>

<style lang="scss" scoped>
h1 {
  color: #606266;
  font-size: 16px;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial,
    sans-serif;
  margin-top: 20px;
  margin-bottom: 10px;
}

span {
  color: #606266;
  font-size: 12px;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial,
    sans-serif;
}
</style>
