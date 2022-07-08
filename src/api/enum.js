export const UserState = {
  ENABLE: '启用',
  DISABLE: '禁用'
}

export const RoleState = {
  ENABLE: '启用',
  DISABLE: '禁用'
}

export const RoleType = {
  SYSTEM: '系统内置',
  CUSTOM: '自定义'
}

export const PermissionState = {
  ENABLE: '启用',
  DISABLE: '禁用'
}

export const GroupState = {
  ENABLE: '启用',
  DISABLE: '禁用'
}

export const HttpMethods = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  OPTIONS: 'OPTIONS',
  HEAD: 'HEAD',
  CONNECT: 'CONNECT',
  TRACE: 'TRACE'
}

export const RunningState = {
  WAITING: '待运行',
  RUNNING: '运行中',
  ITERATING: '迭代中',
  COMPLETED: '已完成',
  INTERRUPTED: '已中断',
  ERROR: '异常'
}

export const TestplanState = {
  INITIAL: '待开始',
  TESTING: '测试中',
  COMPLETED: '已完成'
}

export const TestPhase = {
  INITIAL: '等待测试',
  DEBUG: '调试中',
  SMOKE_TESTING: '冒烟测试',
  SYSTEM_TESTING: '系统测试',
  REGRESSION_TESTING: '回归测试',
  ACCEPTANCE_TESTING: '验收测试',
  COMPLETED: '测试结束'
}

export const DatabaseType = {
  ORACLE: 'Oracle',
  MYSQL: 'MySQL',
  POSTGRESQL: 'PostgreSQL',
  Microsoft_SQL_SERVER: 'Microsoft SQL Server'
}

export const WorkspaceScope = {
  PRIVATE: '私有',
  PROTECTED: '保护',
  PUBLIC: '公共'
}

export const MatchMethod = {
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
}

export const MatchType = {
  ALL: '所有',
  IN: '包含',
  NOTIN: '不包含',
  STARTWITH: '开始于',
  ENDWITH: '结束于',
  PATTERN: '正则'
}

export const RestrictionState = {
  ENABLE: '启用',
  DISABLE: '禁用'
}

export const RobotState = {
  ENABLE: '启用',
  DISABLE: '禁用'
}

export const RobotType = {
  WECOM: '企业微信',
  DINGTALK: '钉钉'
}

export const JobState = {
  NORMAL: '正常',
  PAUSED: '已暂停',
  CLOSED: '已关闭'
}

export const JobType = {
  TESTPLAN: '测试计划',
  COLLECTION: '元素集合',
  GROUP: '元素分组'
}

export const TriggerType = {
  DATE: '固定时间',
  INTERVAL: '固定间隔',
  CRON: 'CRON间隔'
}

export const TaskOperationType = {
  ADD: '添加作业',
  MODIFY: '修改作业',
  EXECUTE: '执行作业',
  PAUSE: '暂停作业',
  RESUME: '恢复作业',
  CLOSE: '关闭作业'
}
