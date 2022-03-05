import * as monaco from 'monaco-editor'

const PYMETER_COMPLETION_PROVIDER = (range) => {
  return [
    {
      label: 'vars.put',
      insertText: "vars.put('${1:name}', '${2:value}')",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Snippet,
      range: range,
      detail: '设置局部变量',
      documentation: 'vars.put(name:str, value:str)'
    },
    {
      label: 'vars.get',
      insertText: "vars.get('${1:name}')",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Snippet,
      range: range,
      detail: '获取局部变量',
      documentation: 'vars.get(name:str)'
    },
    {
      label: 'props.put',
      insertText: "props.put('${1:name}', '${2:value}')",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Snippet,
      range: range,
      detail: '设置全部变量',
      documentation: 'props.put(name:str, value:str)'
    },
    {
      label: 'props.get',
      insertText: "props.get('${1:name}')",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Snippet,
      range: range,
      detail: '获取全局变量',
      documentation: 'props.get(name:str)'
    }
  ]
}

const PYMETER_FUNCTION_COMPLETION_PROVIDER = (range) => {
  return [
    {
      label: '${__Eval()}',
      insertText: '${__Eval(${1:name})}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Snippet,
      range: range,
      detail: 'Eval',
      documentation: '${__Eval(name)}'
    },
    {
      label: '${__GoogleAuth()}',
      insertText: '${__GoogleAuth(${1:secretKey})}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Snippet,
      range: range,
      detail: 'GoogleAuth',
      documentation: '${__GoogleAuth(secretKey)}'
    },
    {
      label: '${__MD5()}',
      insertText: '${__MD5(${1:plaintext})}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Snippet,
      range: range,
      detail: 'MD5',
      documentation: '${__MD5(plaintext, encode)}'
    },
    {
      label: '${__RandomChoice()}',
      insertText: '${__RandomChoice(${1:str})}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Snippet,
      range: range,
      detail: 'RandomChoice',
      documentation: '${__RandomChoice(str)}'
    },
    {
      label: '${__RandomInt()}',
      insertText: '${__RandomInt(${1:minimum}, ${2:maximum})}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Snippet,
      range: range,
      detail: 'RandomInt',
      documentation: '${__RandomInt(minimum, maximum)}'
    },
    {
      label: '${__Random()}',
      insertText: '${__Random(${1:length})}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Snippet,
      range: range,
      detail: 'Random',
      documentation: '${__Random(length)}'
    },
    {
      label: '${__RSA()}',
      insertText: '${__RSA(${1:plaintext}, ${2:publicKey})}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Snippet,
      range: range,
      detail: 'RSA',
      documentation: '${__RSA(plaintext, publicKey)}'
    },
    {
      label: '${__Time()}',
      insertText: '${__Time(${1:format})}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Snippet,
      range: range,
      detail: 'Time',
      documentation: '${__Time(format)}'
    }
  ]
}

export { PYMETER_COMPLETION_PROVIDER, PYMETER_FUNCTION_COMPLETION_PROVIDER }
