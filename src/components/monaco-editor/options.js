// monaco 默认配置
const DEFAULT_OPTIONS = {
  // 自动关闭括号
  autoClosingBrackets: 'always',
  // 自动关闭引号
  autoClosingQuotes: 'always',
  // 启用自动缩进调整
  autoIndent: true,
  // 自适应布局
  automaticLayout: true,
  // 括号高亮
  // bracketPairColorization: true,
  // 光标样式
  cursorStyle: 'line',
  // 开启右键菜单那
  contextmenu: false,
  // 允许拖拽
  dragAndDrop: true,
  // 粘贴时格式化
  formatOnPaste: true,
  // 输入时格式化
  formatOnType: true,
  folding: true,
  foldingHighlight: true,
  fixedOverflowWidgets: true,
  highlightActiveIndentGuide: true,
  // 显示行号的位数
  lineNumbersMinChars: 3,
  // 启用字形边距的渲染，默认为false
  glyphMargin: true,
  // 小地图
  minimap: { enabled: false },
  // 自动匹配括号
  matchBrackets: 'always',
  // 快速建议显示
  quickSuggestions: true,
  // 快速建议显示延迟（ms），默认为500ms
  quickSuggestionsDelay: 200,
  // 滚动条大小
  scrollbar: {
    verticalScrollbarSize: 6,
    horizontalScrollbarSize: 6
  },
  // 单击行号时是否应选择相应的行为，默认为true
  selectOnLineNumbers: true,
  // 使用圆角边框渲染编辑器选择，默认为true
  roundedSelection: false,
  renderFinalNewline: true,
  renderIndentGuides: true,
  renderLineHighlight: 'all',
  renderWhitespace: 'all',
  selectionHighlight: true,
  smoothScrolling: true,
  // 缩进大小
  tabIndex: 4,
  // 在制表位后插入和删除空格
  useTabStops: false,
  // 折行显示
  wordWrap: 'on',
  wrappingIndent: 'same'
}

export default DEFAULT_OPTIONS
