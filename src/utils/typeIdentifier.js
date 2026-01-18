/**
 * 产品类型识别工具
 * 根据文件名中的分类名称（label）识别产品类型 ID
 *
 * 识别规则：
 * - 如果文件名中包含分类名称（label），就识别为该分类
 * - 只匹配叶子节点（没有子类的分类）和子分类
 * - 如果有子类的父类，跳过检索这个父类（因为肯定是要么匹配到子类，要么是没有子类的一级分类）
 */

/**
 * 收集所有叶子节点和子分类（用于匹配）
 * @param {Array} types - 产品类型列表（树形结构）
 * @returns {Array} 所有叶子节点和子分类的数组
 */
function collectLeafTypes(types) {
  const result = []

  for (const type of types) {
    // 如果有子类，跳过父类，只收集子类
    if (type.children && type.children.length > 0) {
      // 递归收集子类
      result.push(...collectLeafTypes(type.children))
    } else {
      // 没有子类，这是一个叶子节点，添加到结果中
      result.push(type)
    }
  }

  return result
}

/**
 * 根据文件名识别产品类型 ID
 * @param {string} fileName - 文件名
 * @param {Array} productTypes - 产品类型列表（树形结构）
 * @returns {number|null} 产品类型 ID，如果无法识别返回 null
 */
export function identifyProductTypeByFileName(fileName, productTypes = []) {
  if (!fileName || !productTypes || productTypes.length === 0) {
    return null
  }

  const lowerFileName = fileName.toLowerCase()

  // 收集所有叶子节点和子分类
  const leafTypes = collectLeafTypes(productTypes)

  // 按标签长度降序排序，优先匹配更具体的分类名称
  leafTypes.sort((a, b) => b.label.length - a.label.length)

  // 遍历所有叶子节点和子分类，检查文件名是否包含分类名称
  for (const type of leafTypes) {
    const lowerLabel = type.label.toLowerCase()

    // 如果文件名包含分类名称，返回该分类的 ID
    if (lowerFileName.includes(lowerLabel)) {
      return type.id
    }
  }

  return null
}
