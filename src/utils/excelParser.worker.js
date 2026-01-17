import * as XLSX from 'xlsx'

self.onmessage = function (e) {
  const { fileData, productType, fileName, chunkSize = 1000 } = e.data

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

    // 识别产品类型
    let identifiedType = productType
    if (!identifiedType) {
      const lowerFileName = fileName.toLowerCase()
      
      // 先检查是否是 ELISA 试剂盒
      if (
        lowerFileName.includes('elisa试剂盒') ||
        lowerFileName.includes('elisa')
      ) {
        // 进一步识别 ELISA 试剂盒的具体子类型
        // 注意：匹配顺序很重要，先匹配更具体的，再匹配通用的
        
        // 农残 ELISA 试剂盒（需要先匹配，因为包含"残"字）
        if (
          lowerFileName.includes('农残') ||
          lowerFileName.includes('pesticide') ||
          lowerFileName.includes('竞争法')
        ) {
          identifiedType = 'elisa_kit_pesticide_residue'
        }
        // 山羊/绵羊 ELISA 试剂盒（需要先匹配，因为包含"羊"字）
        else if (
          lowerFileName.includes('山羊') ||
          lowerFileName.includes('绵羊') ||
          lowerFileName.includes('goat') ||
          lowerFileName.includes('sheep')
        ) {
          identifiedType = 'elisa_kit_goat_sheep'
        }
        // 其它 ELISA 试剂盒（马/豚鼠/鸭）
        else if (
          lowerFileName.includes('马') ||
          lowerFileName.includes('豚鼠') ||
          lowerFileName.includes('鸭') ||
          lowerFileName.includes('horse') ||
          lowerFileName.includes('guinea') ||
          lowerFileName.includes('duck')
        ) {
          identifiedType = 'elisa_kit_other'
        }
        // 大鼠 ELISA 试剂盒
        else if (
          lowerFileName.includes('大鼠') ||
          lowerFileName.includes('rat')
        ) {
          identifiedType = 'elisa_kit_rat'
        }
        // 小鼠 ELISA 试剂盒
        else if (
          lowerFileName.includes('小鼠') ||
          lowerFileName.includes('mouse')
        ) {
          identifiedType = 'elisa_kit_mouse'
        }
        // 猪 ELISA 试剂盒
        else if (
          lowerFileName.includes('猪') ||
          lowerFileName.includes('pig')
        ) {
          identifiedType = 'elisa_kit_pig'
        }
        // 猫 ELISA 试剂盒
        else if (
          lowerFileName.includes('猫') ||
          lowerFileName.includes('cat')
        ) {
          identifiedType = 'elisa_kit_cat'
        }
        // 牛 ELISA 试剂盒
        else if (
          lowerFileName.includes('牛') ||
          lowerFileName.includes('cattle') ||
          lowerFileName.includes('cow')
        ) {
          identifiedType = 'elisa_kit_cattle'
        }
        // 鸡 ELISA 试剂盒
        else if (
          lowerFileName.includes('鸡') ||
          lowerFileName.includes('chicken')
        ) {
          identifiedType = 'elisa_kit_chicken'
        }
        // 兔 ELISA 试剂盒
        else if (
          lowerFileName.includes('兔') ||
          lowerFileName.includes('rabbit')
        ) {
          identifiedType = 'elisa_kit_rabbit'
        }
        // 鱼 ELISA 试剂盒
        else if (
          lowerFileName.includes('鱼') ||
          lowerFileName.includes('fish')
        ) {
          identifiedType = 'elisa_kit_fish'
        }
        // 犬 ELISA 试剂盒
        else if (
          lowerFileName.includes('犬') ||
          lowerFileName.includes('dog')
        ) {
          identifiedType = 'elisa_kit_dog'
        }
        // 昆虫 ELISA 试剂盒
        else if (
          lowerFileName.includes('昆虫') ||
          lowerFileName.includes('insect')
        ) {
          identifiedType = 'elisa_kit_insect'
        }
        // 人 ELISA 试剂盒
        else if (
          lowerFileName.includes('人') ||
          lowerFileName.includes('human')
        ) {
          identifiedType = 'elisa_kit_human'
        }
        // 如果无法识别具体子类型，返回父类型
        else {
          identifiedType = 'elisa_kit'
        }
      } else if (
        lowerFileName.includes('酪酰胺多色荧光染色试剂盒') ||
        lowerFileName.includes('tyramide')
      ) {
        identifiedType = 'tyramide_tsa_kit'
      } else if (
        lowerFileName.includes('重组兔单克隆抗体') ||
        lowerFileName.includes('research')
      ) {
        identifiedType = 'research_test_reagent'
      }
    }

    if (!identifiedType) {
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

    for (let i = 0; i < jsonData.length; i += chunkSize) {
      const chunk = jsonData.slice(i, i + chunkSize)
      const chunkResult = processChunk(chunk, identifiedType, i + 2)

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
        productType: identifiedType,
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

function processChunk(chunk, productType, startRowNum) {
  const products = []
  const errors = []

  chunk.forEach((row, index) => {
    const rowNum = startRowNum + index
    const errorsForRow = []

    if (productType === 'research_test_reagent') {
      const productNo = row['产品货号'] || ''
      if (!productNo || productNo.toString().trim() === '') {
        errorsForRow.push('产品货号不能为空')
      }

      if (errorsForRow.length > 0) {
        errors.push({ row: rowNum, errors: errorsForRow, data: row })
      } else {
        const details = {
          productName: (row['产品名称'] || '').toString().trim(),
          category: (row['二级分类'] || '').toString().trim(),
          categoryPath: (row['分类路径'] || '').toString().trim(),
          geneName: (row['基因名称'] || '').toString().trim(),
          proteinName: (row['蛋白名称'] || '').toString().trim(),
          recommendedApplication: (row['推荐应用'] || '').toString().trim(),
          reactiveSpecies: (row['反应种属'] || '').toString().trim(),
          concentration: (row['浓度'] || '').toString().trim(),
          storageBuffer: (row['存储缓冲液'] || '').toString().trim(),
          humanGeneId: row['Human Gene ID']
            ? Number(row['Human Gene ID'])
            : null,
          humanGeneLink: (row['Human Gene Link'] || '').toString().trim(),
          humanSwissprotNo: (row['Human Swissprot No.'] || '')
            .toString()
            .trim(),
          humanSwissprotLink: (row['Human Swissprot Link'] || '')
            .toString()
            .trim(),
          mouseGeneId: row['Mouse Gene ID']
            ? Number(row['Mouse Gene ID'])
            : null,
          mouseGeneLink: (row['Mouse Gene Link'] || '').toString().trim(),
          mouseSwissprotNo: (row['Mouse Swissprot No.'] || '')
            .toString()
            .trim(),
          mouseSwissprotLink: (row['Mouse Swissprot Link'] || '')
            .toString()
            .trim(),
          ratGeneId: row['Rat Gene ID'] ? Number(row['Rat Gene ID']) : null,
          ratGeneLink: (row['Rat Gene Link'] || '').toString().trim(),
          ratSwissprotNo: (row['Rat Swissprot No.'] || '').toString().trim(),
          ratSwissprotLink: (row['Rat Swissprot Link'] || '').toString().trim(),
          immunogen: (row['免疫原'] || '').toString().trim(),
          specificity: (row['特异性'] || '').toString().trim(),
          dilution: (row['稀释度'] || '').toString().trim(),
          referenceMolecularWeight: (row['参考分子量'] || '').toString().trim(),
          storageCondition: (row['运输及保存条件'] || '').toString().trim(),
          host: (row['宿主'] || '').toString().trim(),
          cellLocalization: (row['细胞定位'] || '').toString().trim(),
          function: (row['功能'] || '').toString().trim(),
          stockStatus: (row['期货'] || '').toString().trim(),
          purification: (row['纯化'] || '').toString().trim(),
          tags: (row['标记'] || '').toString().trim(),
          img: (row['多图'] || row['img'] || row['图片地址'] || '')
            .toString()
            .trim(),
          imgDesc: (row['多图描述'] || '').toString().trim(),
          background: (row['背景介绍'] || '').toString().trim(),
          tissueExpression: (row['组织表达'] || '').toString().trim()
        }

        // 处理价格字段，支持多种可能的列名（重组兔单克隆抗体的价格格式：50UL|1300,100UL|2300）
        const price =
          row['价格'] || row['单价'] || row['Price'] || row['price'] || ''

        products.push({
          productNo: productNo.toString().trim(),
          cnName: details.productName,
          price: price.toString().trim(),
          type: productType,
          details
        })
      }
    } else {
      const productNo = row['货号'] || row['产品货号'] || ''
      if (!productNo || productNo.toString().trim() === '') {
        errorsForRow.push('货号不能为空')
      }

      if (errorsForRow.length > 0) {
        errors.push({ row: rowNum, errors: errorsForRow, data: row })
      } else {
        // 处理价格字段，支持多种可能的列名
        const price =
          row['价格'] || row['单价'] || row['Price'] || row['price'] || ''
        products.push({
          productNo: productNo.toString().trim(),
          cnName: (row['中文名称'] || row['产品名称'] || '').toString().trim(),
          productSpec: (row['规格'] || '').toString().trim(),
          price: price.toString().trim(),
          type: productType
        })
      }
    }
  })

  return { products, errors }
}
