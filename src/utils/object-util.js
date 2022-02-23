/**
 * 对象深拷贝
 * @param {*} obj
 * @returns
 */
export function deepCopy(obj) {
  if (typeof obj !== 'object') {
    return obj
  }

  const result = obj.constructor === Array ? [] : {}
  for (const i in obj) {
    result[i] = typeof obj[i] === 'object' ? deepCopy(obj[i]) : obj[i]
  }
  return result
}

export function hasOwnProp(obj, propName) {
  return Object.prototype.hasOwnProperty.call(obj, propName)
}
