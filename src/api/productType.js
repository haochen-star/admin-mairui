import request from '@/utils/request'

/**
 * 获取产品类型列表
 */
export const getProductTypes = () => {
  return request({
    url: '/api/product-type',
    method: 'get'
  })
}

/**
 * 根据 ID 获取单个产品类型
 * @param {number} id - 产品类型 ID
 */
export const getProductTypeById = (id) => {
  return request({
    url: `/api/product-type/${id}`,
    method: 'get'
  })
}

/**
 * 创建产品类型
 * @param {Object} data - 产品类型数据
 * @param {string} data.label - 类型标签（必填）
 * @param {number} data.parentId - 父类型 ID（可选）
 * @param {boolean} data.hasDetails - 是否需要 details 字段（可选）
 */
export const createProductType = (data) => {
  return request({
    url: '/api/product-type',
    method: 'post',
    data
  })
}

/**
 * 更新产品类型
 * @param {number} id - 产品类型 ID
 * @param {Object} data - 产品类型数据
 * @param {string} data.label - 类型标签（可选）
 * @param {number} data.parentId - 父类型 ID（可选，设置为 null 可将子分类提升为一级分类）
 * @param {boolean} data.hasDetails - 是否需要 details 字段（可选）
 */
export const updateProductType = (id, data) => {
  return request({
    url: `/api/product-type/${id}`,
    method: 'put',
    data
  })
}

/**
 * 获取产品类型下的产品数量
 * @param {number} id - 产品类型 ID
 */
export const getProductCount = (id) => {
  return request({
    url: `/api/product-type/${id}/product-count`,
    method: 'get'
  })
}

/**
 * 删除产品类型
 * @param {number} id - 产品类型 ID
 * @param {boolean} force - 是否强制删除（同时删除关联产品）
 */
export const deleteProductType = (id, force = false) => {
  return request({
    url: `/api/product-type/${id}`,
    method: 'delete',
    params: force ? { force: 'true' } : {}
  })
}

