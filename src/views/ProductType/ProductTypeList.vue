<template>
  <div class="product-type-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>产品类型管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              新增类型
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="productTypeStore.productTypes"
        style="width: 100%"
        border
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        default-expand-all
      >
        <el-table-column prop="label" label="类型名称" min-width="300">
          <template #default="{ row }">
            {{ row.label }}
          </template>
        </el-table-column>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="parentId" label="父类型ID" width="120">
          <template #default="{ row }">
            {{ row.parentId || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="hasDetails" label="复杂产品" width="120">
          <template #default="{ row }">
            <el-tag :type="row.hasDetails ? 'success' : 'info'">
              {{ row.hasDetails ? '是' : '否' }}
            </el-tag>
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
    </el-card>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="formVisible"
      :title="isEdit ? '编辑产品类型' : '新增产品类型'"
      width="600px"
      @close="handleClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="类型名称" prop="label">
          <el-input v-model="formData.label" placeholder="请输入类型名称" />
        </el-form-item>
        <el-form-item label="父类型" prop="parentId">
          <el-select
            v-model="formData.parentId"
            placeholder="选择父类型（不选择则创建一级分类）"
            style="width: 100%"
            clearable
          >
            <el-option
              v-for="rootType in rootTypes"
              :key="rootType.id"
              :label="rootType.label"
              :value="rootType.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="复杂产品" prop="hasDetails">
          <el-switch v-model="formData.hasDetails" />
          <span style="margin-left: 10px; color: #909399; font-size: 12px">
            开启后，该类型的产品将支持详细信息字段（如基因名称、推荐应用等）
          </span>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog v-model="deleteDialogVisible" title="确认删除" width="500px">
      <div>
        <p style="margin-bottom: 15px">
          该类型下共有
          <strong style="color: #409eff; font-size: 16px">{{
            deleteInfo.productCount
          }}</strong>
          个产品
        </p>

        <div v-if="deleteInfo.hasProducts">
          <el-alert
            type="warning"
            :closable="false"
            style="margin-bottom: 20px"
          >
            <template #title>
              <div>
                <p style="margin: 0; font-size: 12px">
                  删除类型将同时删除所有关联产品，此操作不可恢复！
                </p>
              </div>
            </template>
          </el-alert>
          <p>
            确定要删除类型
            <strong>{{ deleteInfo.typeLabel }}</strong> 及其关联的
            {{ deleteInfo.productCount }} 个产品吗？
          </p>
        </div>
        <div v-else>
          <p>
            确定要删除类型 <strong>{{ deleteInfo.typeLabel }}</strong> 吗？
          </p>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmDelete" :loading="deleting">
            确定删除
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useProductTypeStore } from '@/stores/productType'

const productTypeStore = useProductTypeStore()
const loading = ref(false)
const formVisible = ref(false)
const deleteDialogVisible = ref(false)
const submitting = ref(false)
const deleting = ref(false)
const currentType = ref(null)
const formRef = ref(null)

const deleteInfo = reactive({
  typeId: null,
  typeLabel: '',
  hasProducts: false,
  productCount: 0
})

// 获取所有一级分类（用于下拉选择）
const rootTypes = computed(() => {
  return productTypeStore.getRootTypes()
})

// 表单数据
const formData = reactive({
  label: '',
  parentId: null,
  hasDetails: false
})

// 验证规则
const formRules = {
  label: [{ required: true, message: '请输入类型名称', trigger: 'blur' }]
}

const isEdit = computed(() => !!currentType.value)

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    await productTypeStore.fetchProductTypes()
  } catch (error) {
    ElMessage.error('加载产品类型列表失败')
  } finally {
    loading.value = false
  }
}

// 新增
const handleAdd = () => {
  currentType.value = null
  formData.label = ''
  formData.parentId = null
  formData.hasDetails = false
  formVisible.value = true
}

// 编辑
const handleEdit = (type) => {
  currentType.value = type
  formData.label = type.label
  formData.parentId = type.parentId || null
  formData.hasDetails = type.hasDetails || false
  formVisible.value = true
}

// 删除
const handleDelete = async (type) => {
  try {
    // 先查询产品数量
    const countResponse = await productTypeStore.fetchProductCount(type.id)

    if (countResponse.success && countResponse.data) {
      // 设置删除信息
      deleteInfo.typeId = type.id
      deleteInfo.typeLabel = countResponse.data.typeLabel || type.label
      deleteInfo.productCount = countResponse.data.productCount || 0
      deleteInfo.hasProducts = countResponse.data.productCount > 0

      // 显示确认对话框
      deleteDialogVisible.value = true
    } else {
      ElMessage.error('获取产品数量失败')
    }
  } catch (error) {
    console.error('获取产品数量错误:', error)
    ElMessage.error('获取产品数量失败，请稍后重试')
  }
}

// 确认删除（强制删除）
const confirmDelete = async () => {
  deleting.value = true
  try {
    // 根据是否有产品决定是否使用 force 参数
    const force = deleteInfo.hasProducts
    await productTypeStore.removeProductType(deleteInfo.typeId, force)

    if (deleteInfo.hasProducts) {
      ElMessage.success(`类型及 ${deleteInfo.productCount} 个关联产品已删除`)
    } else {
      ElMessage.success('类型删除成功')
    }

    deleteDialogVisible.value = false
    await loadData()
  } catch (error) {
    ElMessage.error('删除失败')
  } finally {
    deleting.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      const data = {
        label: formData.label.trim(),
        parentId: formData.parentId || null,
        hasDetails: formData.hasDetails
      }

      if (isEdit.value) {
        await productTypeStore.updateProductType(currentType.value.id, data)
        ElMessage.success('更新成功')
      } else {
        await productTypeStore.createProductType(data)
        ElMessage.success('创建成功')
      }

      formVisible.value = false
      await loadData()
    } catch (error) {
      ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
    } finally {
      submitting.value = false
    }
  })
}

// 关闭对话框
const handleClose = () => {
  formVisible.value = false
  currentType.value = null
  formRef.value?.resetFields()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.product-type-list {
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
</style>
