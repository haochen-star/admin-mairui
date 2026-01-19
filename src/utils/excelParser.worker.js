import * as XLSX from 'xlsx'

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
function identifyProductTypeByFileName(fileName, productTypes = []) {
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

self.onmessage = function (e) {
  const {
    fileData,
    productTypeId,
    fileName,
    productTypes = [],
    chunkSize = 1000
  } = e.data

  try {
    // 解析 Excel
    const workbook = XLSX.read(fileData, { type: 'array' })
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]

    // 转换为 JSON 数组
    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    if (jsonData.length === 0) {
      self.postMessage({
        type: 'complete',
        result: {
          success: false,
          message: 'Excel 文件中没有数据',
          products: [],
          errors: []
        }
      })
      return
    }

    // 识别产品类型 ID
    let identifiedTypeId = productTypeId
    if (!identifiedTypeId) {
      identifiedTypeId = identifyProductTypeByFileName(fileName, productTypes)
    }

    if (!identifiedTypeId) {
      self.postMessage({
        type: 'complete',
        result: {
          success: false,
          message: '无法识别产品类型，请手动选择',
          products: [],
          errors: [],
          needTypeSelection: true
        }
      })
      return
    }

    // 分块处理数据
    const products = []
    const errors = []
    let processedRows = 0

    // 查找类型信息，判断是否需要 details
    const findTypeInTree = (types, targetId) => {
      for (const type of types) {
        if (type.id === targetId) return type
        if (type.children && type.children.length > 0) {
          const found = findTypeInTree(type.children, targetId)
          if (found) return found
        }
      }
      return null
    }
    const productType = findTypeInTree(productTypes, identifiedTypeId)

    for (let i = 0; i < jsonData.length; i += chunkSize) {
      const chunk = jsonData.slice(i, i + chunkSize)
      const chunkResult = processChunk(
        chunk,
        identifiedTypeId,
        productType?.hasDetails || false,
        i + 2
      )

      products.push(...chunkResult.products)
      errors.push(...chunkResult.errors)
      processedRows += chunk.length

      // 发送进度
      self.postMessage({
        type: 'progress',
        processed: processedRows,
        total: jsonData.length,
        percentage: Math.round((processedRows / jsonData.length) * 100)
      })
    }

    // 发送完成结果
    self.postMessage({
      type: 'complete',
      result: {
        success: true,
        productType: identifiedTypeId,
        products,
        errors,
        totalRows: jsonData.length,
        validRows: products.length,
        errorRows: errors.length
      }
    })
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: {
        success: false,
        message: `解析失败: ${error.message}`,
        error: error
      }
    })
  }
}

function processChunk(chunk, productTypeId, hasDetails, startRowNum) {
  const products = []
  const errors = []

  chunk.forEach((row, index) => {
    const rowNum = startRowNum + index
    const errorsForRow = []

    if (hasDetails) {
      const productNo = row['产品货号'] || ''
      if (!productNo || productNo.toString().trim() === '') {
        errorsForRow.push('产品货号不能为空')
      }

      if (errorsForRow.length > 0) {
        errors.push({ row: rowNum, errors: errorsForRow, data: row })
      } else {
        // 构建顶层字段
        const cnName = (row['产品名称'] || '').toString().trim()
        const productImage = (row['产品图片'] || '').toString().trim()
        const price = (row['价格'] || '').toString().trim()
        const background = (row['背景介绍'] || '').toString().trim()
        const categoryFlag = (row['产品类别标志'] || '').toString().trim()

        // 构建 details 对象（33个字段，排除顶层6个字段）
        const details = {
          alias: (row['别名'] || '').toString().trim(),
          geneName: (row['基因名称'] || '').toString().trim(),
          proteinName: (row['蛋白名称'] || '').toString().trim(),
          application: (row['应用'] || '').toString().trim(),
          reactiveSpecies: (row['反应种属'] || '').toString().trim(),
          storageBuffer: (row['存储缓冲液'] || '').toString().trim(),
          dilution: (row['稀释度'] || '').toString().trim(),
          humanGeneId: row['Human Gene ID']
            ? Number(row['Human Gene ID'])
            : null,
          humanGeneLink: (row['Human Gene Link'] || '').toString().trim(),
          humanSwissprotNo: (row['Human Swissprot No'] || '').toString().trim(),
          humanSwissprotLink: (row['Human Swissprot Link'] || '')
            .toString()
            .trim(),
          mouseGeneId: row['Mouse Gene ID']
            ? Number(row['Mouse Gene ID'])
            : null,
          mouseGeneLink: (row['Mouse Gene Link'] || '').toString().trim(),
          mouseSwissprotNo: (row['Mouse Swissprot No'] || '').toString().trim(),
          mouseSwissprotLink: (row['Mouse Swissprot Link'] || '')
            .toString()
            .trim(),
          ratGeneId: row['Rat Gene ID'] ? Number(row['Rat Gene ID']) : null,
          ratGeneLink: (row['Rat Gene Link'] || '').toString().trim(),
          ratSwissprotNo: (row['Rat Swissprot No'] || '').toString().trim(),
          ratSwissprotLink: (row['Rat Swissprot Link'] || '').toString().trim(),
          reference: (row['参考文献'] || '').toString().trim(),
          referenceMolecularWeight: (row['参考分子量'] || '').toString().trim(),
          predictedMolecularWeight: (row['预测分子量'] || '').toString().trim(),
          storageCondition: (row['运输及保存条件'] || '').toString().trim(),
          host: (row['宿主'] || '').toString().trim(),
          isotype: (row['同种型'] || '').toString().trim(),
          cellLocalization: (row['细胞定位'] || '').toString().trim(),
          signalingPathway: (row['信号通路'] || '').toString().trim(),
          function: (row['功能'] || '').toString().trim(),
          stockStatus: (row['货期'] || '').toString().trim(),
          purification: (row['纯化'] || '').toString().trim(),
          clonality: (row['克隆性'] || '').toString().trim(),
          manual: (row['说明书'] || '').toString().trim(),
          img: (row['多图'] || '').toString().trim(),
          imgDesc: (row['多图描述'] || '').toString().trim()
        }

        products.push({
          productNo: productNo.toString().trim(),
          cnName: cnName,
          productImage: productImage,
          price: price,
          background: background,
          categoryFlag: categoryFlag,
          type: productTypeId,
          details
        })
      }
    } else {
      // 简单类型：只支持精确列名
      const productNo = row['产品货号'] || ''
      if (!productNo || productNo.toString().trim() === '') {
        errorsForRow.push('产品货号不能为空')
      }

      if (errorsForRow.length > 0) {
        errors.push({ row: rowNum, errors: errorsForRow, data: row })
      } else {
        const cnName = (row['产品名称'] || '').toString().trim()
        const productImage = (row['产品图片'] || '').toString().trim()
        const price = (row['价格'] || '').toString().trim()
        const background = (row['背景介绍'] || '').toString().trim()
        const categoryFlag = (row['产品类别标志'] || '').toString().trim()

        products.push({
          productNo: productNo.toString().trim(),
          cnName: cnName,
          productImage: productImage,
          price: price,
          background: background,
          categoryFlag: categoryFlag,
          type: productTypeId
        })
      }
    }
  })

  return { products, errors }
}
