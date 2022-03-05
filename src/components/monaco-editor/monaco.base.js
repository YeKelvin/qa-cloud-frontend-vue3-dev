// import * as monaco from 'monaco-editor'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.main'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

import { LOG_LANGUAGE_DEFINE, LOG_TOKEN_COLORS } from './language/log'
import { PYMETER_COMPLETION_PROVIDER, PYMETER_FUNCTION_COMPLETION_PROVIDER } from './language/pymeter'
import { PYTHON_LANGUAGE_DEFINE, PYTHON_TOKEN_COLORS, PYTHON_KEYWORDS_COMPLETION_PROVIDER } from './language/python'

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  }
}

/**
 * 注册代码提示
 */
const registerCompletion = (language, provider, triggerCharacters = null) => {
  monaco.languages.registerCompletionItemProvider(language, {
    triggerCharacters: triggerCharacters,
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      }
      return { suggestions: provider(range) }
    }
  })
}

// ********************************************************************************************************************
// * log
// ********************************************************************************************************************
monaco.languages.register({ id: 'log' })
monaco.languages.setMonarchTokensProvider('log', LOG_LANGUAGE_DEFINE)

// ********************************************************************************************************************
// * python
// ********************************************************************************************************************
monaco.languages.setMonarchTokensProvider('python', PYTHON_LANGUAGE_DEFINE)
registerCompletion('python', PYTHON_KEYWORDS_COMPLETION_PROVIDER)
registerCompletion('python', PYMETER_COMPLETION_PROVIDER)
registerCompletion('python', PYMETER_FUNCTION_COMPLETION_PROVIDER)

// ********************************************************************************************************************
// * theme
// ********************************************************************************************************************
monaco.editor.defineTheme('vs', {
  base: 'vs',
  inherit: true,
  rules: [...LOG_TOKEN_COLORS, ...PYTHON_TOKEN_COLORS],
  colors: {
    'editorBracketHighlight.foreground1': '#ffd700',
    'editorBracketHighlight.foreground2': '#da70d6',
    'editorBracketHighlight.foreground3': '#87cefa',
    'editorBracketHighlight.foreground4': '#ffd700',
    'editorBracketHighlight.foreground5': '#da70d6',
    'editorBracketHighlight.foreground6': '#87cefa',
    'editorBracketHighlight.unexpectedBracket.foreground': '#ff0000'
  }
})

export default monaco
