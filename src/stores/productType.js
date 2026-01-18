import { defineStore } from 'pinia'
import {
  getProductTypes as getProductTypesApi,
  getProductTypeById as getProductTypeByIdApi,
  createProductType as createProductTypeApi,
  updateProductType as updateProductTypeApi,
  getProductCount as getProductCountApi,
  deleteProductType as deleteProductTypeApi
} from '@/api/productType'

export const useProductTypeStore = defineStore('productType', {
  state: () => ({
    productTypes: []
  }),

  actions: {
    /**
     * 获取产品类型列表
     */
    async fetchProductTypes() {
      try {
        const response = await getProductTypesApi()
        if (response.success && response.data) {
          this.productTypes = response.data.types || []
        }
        return response
      } catch (error) {
        console.error('获取产品类型列表失败:', error)
        throw error
      }
    },

    /**
     * 根据 ID 获取单个产品类型
     * @param {number} id - 产品类型 ID
     */
    async fetchProductTypeById(id) {
      try {
        const response = await getProductTypeByIdApi(id)
        return response.success ? response.data.type : null
      } catch (error) {
        console.error('获取产品类型失败:', error)
        throw error
      }
    },

    /**
     * 创建产品类型
     * @param {Object} data - 产品类型数据
     */
    async createProductType(data) {
      try {
        const response = await createProductTypeApi(data)
        if (response.success) {
          // 重新获取列表
          await this.fetchProductTypes()
        }
        return response
      } catch (error) {
        console.error('创建产品类型失败:', error)
        throw error
      }
    },

    /**
     * 更新产品类型
     * @param {number} id - 产品类型 ID
     * @param {Object} data - 产品类型数据
     */
    async updateProductType(id, data) {
      try {
        const response = await updateProductTypeApi(id, data)
        if (response.success) {
          // 重新获取列表
          await this.fetchProductTypes()
        }
        return response
      } catch (error) {
        console.error('更新产品类型失败:', error)
        throw error
      }
    },

    /**
     * 获取产品类型下的产品数量
     * @param {number} id - 产品类型 ID
     */
    async fetchProductCount(id) {
      try {
        const response = await getProductCountApi(id)
        return response
      } catch (error) {
        console.error('获取产品数量失败:', error)
        throw error
      }
    },

    /**
     * 删除产品类型
     * @param {number} id - 产品类型 ID
     * @param {boolean} force - 是否强制删除（同时删除关联产品）
     */
    async removeProductType(id, force = false) {
      try {
        const response = await deleteProductTypeApi(id, force)
        if (response.success) {
          // 重新获取列表
          await this.fetchProductTypes()
        }
        return response
      } catch (error) {
        console.error('删除产品类型失败:', error)
        throw error
      }
    },

    /**
     * 获取所有一级分类（用于下拉选择）
     */
    getRootTypes() {
      return this.productTypes.filter(type => !type.parentId)
    },

    /**
     * 根据 ID 查找类型（包括子类型）
     * @param {number} id - 产品类型 ID
     */
    findTypeById(id) {
      const findInTree = (types) => {
        for (const type of types) {
          if (type.id === id) {
            return type
          }
          if (type.children && type.children.length > 0) {
            const found = findInTree(type.children)
            if (found) return found
          }
        }
        return null
      }
      return findInTree(this.productTypes)
    }
  }
})

