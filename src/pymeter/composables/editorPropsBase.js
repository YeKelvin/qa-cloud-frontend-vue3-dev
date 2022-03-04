const BASE_EDITOR_PROPS = {
  editorNo: { type: String, default: '' },
  editorMode: { type: String, default: 'QUERY' },
  metadata: { type: Object, default: () => {} }
}

export default BASE_EDITOR_PROPS
