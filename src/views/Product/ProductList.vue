<template>
  <div class="product-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>产品管理</span>
          <div class="header-actions">
            <el-button
              type="danger"
              :disabled="selectedCount === 0"
              @click="handleBatchDelete"
            >
              <el-icon><Delete /></el-icon>
              批量删除{{ selectedCount > 0 ? ` (${selectedCount})` : '' }}
            </el-button>
            <el-button type="success" @click="handleBatchUpload">
              <el-icon><Upload /></el-icon>
              批量上传
            </el-button>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              新增产品
            </el-button>
          </div>
        </div>
      </template>

      <div class="search-bar">
        <el-select
          v-model="selectedType"
          placeholder="选择产品类型"
          style="width: 200px; margin-right: 10px"
          clearable
          @change="handleTypeChange"
        >
          <template v-for="type in productTypes" :key="type.id">
            <!-- 所有类型都使用分组显示 -->
            <el-option-group :label="type.label">
              <!-- 如果有子类型，显示子类型 -->
              <template v-if="type.children && type.children.length > 0">
                <el-option
                  v-for="child in type.children"
                  :key="child.id"
                  :label="child.label"
                  :value="child.id"
                />
              </template>
              <!-- 如果没有子类型，显示自己本身 -->
              <el-option
                v-else
                :key="type.id"
                :label="type.label"
                :value="type.id"
              />
            </el-option-group>
          </template>
        </el-select>

        <el-input
          v-model="searchName"
          placeholder="搜索产品名称"
          style="width: 300px; margin-right: 10px"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="productStore.products"
        style="width: 100%; margin-top: 20px"
        border
        row-key="id"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="productNo" label="产品货号" width="150" />
        <el-table-column prop="cnName" label="产品名称" min-width="200" />
        <el-table-column prop="productImage" label="产品图片" min-width="150" />
        <el-table-column prop="price" label="价格" width="150" />
        <el-table-column prop="background" label="背景介绍" min-width="200">
          <template #default="{ row }">
            <div class="background-text">{{ row.background || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="categoryFlag" label="产品类别标志" width="120" />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pagesize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <ProductForm
      v-model="formVisible"
      :product="currentProduct"
      :product-types="productTypes"
      @submit="handleFormSubmit"
    />

    <ProductBatchUpload
      v-model="batchUploadVisible"
      :product-types="productTypes"
      @success="handleBatchUploadSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { Plus, Search, Upload, Delete } from '@element-plus/icons-vue'
import { useProductStore } from '@/stores/product'
import ProductForm from '@/components/ProductForm.vue'
import ProductBatchUpload from '@/components/ProductBatchUpload.vue'

const productStore = useProductStore()
const loading = ref(false)
const formVisible = ref(false)
const batchUploadVisible = ref(false)
const currentProduct = ref(null)
const searchName = ref('')
const selectedType = ref('')
const selectedProducts = ref([])

const productTypes = computed(() => productStore.productTypes)

// 计算已选中的数量
const selectedCount = computed(() => selectedProducts.value.length)

// 使用 ref 来管理分页，从 store 同步初始值
const pagination = ref({
  page: 1,
  pagesize: 10,
  total: 0,
  totalPages: 0
})

// 监听 store 的 pagination 变化
watch(
  () => productStore.pagination,
  (newPagination) => {
    pagination.value = { ...newPagination }
  },
  { immediate: true, deep: true }
)

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 根据类型 ID 获取对应的 label（支持子类型）
const getTypeLabel = (typeId) => {
  if (!typeId) return '-'

  // 先查找主类型
  const mainType = productTypes.value.find((t) => t.id === typeId)
  if (mainType) return mainType.label

  // 如果没找到，查找子类型
  for (const type of productTypes.value) {
    if (type.children && Array.isArray(type.children)) {
      const childType = type.children.find((child) => child.id === typeId)
      if (childType) return childType.label
    }
  }

  return typeId
}

// 获取第一个可用的类型 ID（优先选择子类型）
const getFirstAvailableType = () => {
  for (const type of productStore.productTypes) {
    // 如果有子类型，返回第一个子类型的 ID
    if (type.children && type.children.length > 0) {
      return type.children[0].id
    }
    // 如果没有子类型，返回主类型的 ID
    if (type.id) {
      return type.id
    }
  }
  return null
}

// 获取产品类型列表
const fetchProductTypes = async () => {
  try {
    await productStore.fetchProductTypes()
    // 设置默认选中第一个可用类型（优先选择子类型）
    if (productStore.productTypes.length > 0 && !selectedType.value) {
      selectedType.value = getFirstAvailableType()
    }
  } catch (error) {
    ElMessage.error('获取产品类型列表失败')
  }
}

// 获取产品列表
const fetchProducts = async () => {
  loading.value = true
  try {
    await productStore.fetchProducts(selectedType.value || undefined, {
      page: pagination.value.page,
      pagesize: pagination.value.pagesize,
      cnName: searchName.value || undefined
    })
    // 同步 store 的 pagination 到本地
    pagination.value = { ...productStore.pagination }
  } catch (error) {
    ElMessage.error('获取产品列表失败')
  } finally {
    loading.value = false
  }
}

// 产品类型改变
const handleTypeChange = () => {
  pagination.value.page = 1
  productStore.pagination.page = 1
  fetchProducts()
}

// 搜索
const handleSearch = () => {
  pagination.value.page = 1
  productStore.pagination.page = 1
  fetchProducts()
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.value.pagesize = size
  pagination.value.page = 1
  productStore.pagination.pagesize = size
  productStore.pagination.page = 1
  fetchProducts()
}

// 页码改变
const handlePageChange = (page) => {
  pagination.value.page = page
  productStore.pagination.page = page
  fetchProducts()
}

// 新增产品
const handleAdd = () => {
  currentProduct.value = null
  formVisible.value = true
}

// 批量上传
const handleBatchUpload = () => {
  batchUploadVisible.value = true
}

// 批量上传成功
const handleBatchUploadSuccess = () => {
  fetchProducts()
}

// 编辑产品
const handleEdit = async (row) => {
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
  const productType = findTypeInTree(productTypes.value, row.type)
  
  // 如果需要 details 字段，获取完整信息
  if (productType && productType.hasDetails) {
    try {
      const product = await productStore.fetchProductById(row.id)
      currentProduct.value = product || { ...row }
    } catch (error) {
      console.error('获取产品详情失败:', error)
      currentProduct.value = { ...row }
    }
  } else {
    currentProduct.value = { ...row }
  }
  formVisible.value = true
}

// 处理选中变化
const handleSelectionChange = (selection) => {
  selectedProducts.value = selection
}

// 批量删除产品
const handleBatchDelete = async () => {
  if (selectedProducts.value.length === 0) {
    ElMessage.warning('请先选择要删除的产品')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedCount.value} 个产品吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.value = true
    const ids = selectedProducts.value.map((product) => product.id)
    const response = await productStore.batchDeleteProducts(ids)
    // 使用接口返回的 message（包含实际删除数量）
    if (response && response.message) {
      ElMessage.success(response.message)
    } else if (
      response &&
      response.data &&
      response.data.deletedCount !== undefined
    ) {
      ElMessage.success(`成功删除 ${response.data.deletedCount} 个产品`)
    } else {
      ElMessage.success(`成功删除 ${selectedCount.value} 个产品`)
    }
    selectedProducts.value = []
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '批量删除失败')
    }
  } finally {
    loading.value = false
  }
}

// 删除产品
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除产品 "${row.cnName || row.productNo}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.value = true
    await productStore.removeProduct(row.id)
    ElMessage.success('删除成功')
    // 如果删除的产品在选中列表中，从选中列表中移除
    selectedProducts.value = selectedProducts.value.filter(
      (p) => p.id !== row.id
    )
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  } finally {
    loading.value = false
  }
}

// 表单提交
const handleFormSubmit = async (formData) => {
  try {
    loading.value = true

    const submitData = {
      type: formData.type,
      productNo: formData.productNo,
      cnName: formData.cnName,
      productImage: formData.productImage || '',
      price: formData.price || '',
      background: formData.background || '',
      categoryFlag: formData.categoryFlag || ''
    }

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
    const productType = findTypeInTree(productTypes.value, formData.type)
    
    // 如果需要 details 字段，添加 details
    if (productType && productType.hasDetails && formData.details) {
      submitData.details = formData.details
    }

    if (currentProduct.value) {
      // 编辑
      await productStore.updateProduct(currentProduct.value.id, submitData)
      ElMessage.success('更新成功')
    } else {
      // 新增
      await productStore.createProduct(submitData)
      ElMessage.success('创建成功')
    }

    formVisible.value = false
    currentProduct.value = null
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchProductTypes()
  fetchProducts()
})
</script>

<style scoped>
.product-list {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.background-text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  line-height: 1.5;
}
</style>
