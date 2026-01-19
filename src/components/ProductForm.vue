<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑产品' : '新增产品'"
    :width="isResearchTestReagent ? '1200px' : '600px'"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="产品类型" prop="type">
        <el-select
          v-model="formData.type"
          placeholder="请选择产品类型"
          style="width: 100%"
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
      </el-form-item>
      <el-form-item label="货号" prop="productNo">
        <el-input
          v-model="formData.productNo"
          placeholder="请输入货号"
        />
      </el-form-item>
      <el-form-item label="产品名称" prop="cnName">
        <el-input
          v-model="formData.cnName"
          placeholder="请输入产品名称"
        />
      </el-form-item>
      <el-form-item label="产品图片" prop="productImage">
        <el-input
          v-model="formData.productImage"
          placeholder="请输入产品图片"
        />
      </el-form-item>
      <el-form-item label="价格" prop="price">
        <el-input
          v-model="formData.price"
          placeholder="请输入价格"
        />
      </el-form-item>
      <el-form-item label="背景介绍" prop="background">
        <el-input
          v-model="formData.background"
          type="textarea"
          :rows="3"
          placeholder="请输入背景介绍"
        />
      </el-form-item>
      <el-form-item label="产品类别标志" prop="categoryFlag">
        <el-input
          v-model="formData.categoryFlag"
          placeholder="请输入产品类别标志"
        />
      </el-form-item>

      <!-- 科研监测试剂详细信息 -->
      <template v-if="isResearchTestReagent">
        <el-divider content-position="left">详细信息</el-divider>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="别名">
              <el-input v-model="formData.details.alias" placeholder="请输入别名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="基因名称">
              <el-input v-model="formData.details.geneName" placeholder="请输入基因名称" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="蛋白名称">
              <el-input v-model="formData.details.proteinName" placeholder="请输入蛋白名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="应用">
              <el-input v-model="formData.details.application" placeholder="请输入应用" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="反应种属">
              <el-input v-model="formData.details.reactiveSpecies" placeholder="请输入反应种属" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="存储缓冲液">
              <el-input v-model="formData.details.storageBuffer" placeholder="请输入存储缓冲液" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">Human 基因信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="Gene ID">
              <el-input v-model.number="formData.details.humanGeneId" type="number" placeholder="Gene ID" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Gene Link">
              <el-input v-model="formData.details.humanGeneLink" placeholder="Gene Link" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Swissprot No">
              <el-input v-model="formData.details.humanSwissprotNo" placeholder="Swissprot No" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Swissprot Link">
              <el-input v-model="formData.details.humanSwissprotLink" placeholder="Swissprot Link" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">Mouse 基因信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="Gene ID">
              <el-input v-model.number="formData.details.mouseGeneId" type="number" placeholder="Gene ID" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Gene Link">
              <el-input v-model="formData.details.mouseGeneLink" placeholder="Gene Link" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Swissprot No.">
              <el-input v-model="formData.details.mouseSwissprotNo" placeholder="Swissprot No." />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Swissprot Link">
              <el-input v-model="formData.details.mouseSwissprotLink" placeholder="Swissprot Link" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">Rat 基因信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="Gene ID">
              <el-input v-model.number="formData.details.ratGeneId" type="number" placeholder="Gene ID" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Gene Link">
              <el-input v-model="formData.details.ratGeneLink" placeholder="Gene Link" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Swissprot No.">
              <el-input v-model="formData.details.ratSwissprotNo" placeholder="Swissprot No." />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Swissprot Link">
              <el-input v-model="formData.details.ratSwissprotLink" placeholder="Swissprot Link" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">其他信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="参考文献">
              <el-input
                v-model="formData.details.reference"
                type="textarea"
                :rows="2"
                placeholder="请输入参考文献"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="参考分子量">
              <el-input v-model="formData.details.referenceMolecularWeight" placeholder="请输入参考分子量" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="预测分子量">
              <el-input v-model="formData.details.predictedMolecularWeight" placeholder="请输入预测分子量" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="运输及保存条件">
              <el-input v-model="formData.details.storageCondition" placeholder="请输入运输及保存条件" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="宿主">
              <el-input v-model="formData.details.host" placeholder="请输入宿主" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="同种型">
              <el-input v-model="formData.details.isotype" placeholder="请输入同种型" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="细胞定位">
          <el-input
            v-model="formData.details.cellLocalization"
            type="textarea"
            :rows="2"
            placeholder="请输入细胞定位"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="信号通路">
              <el-input
                v-model="formData.details.signalingPathway"
                type="textarea"
                :rows="2"
                placeholder="请输入信号通路"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="功能">
              <el-input
                v-model="formData.details.function"
                type="textarea"
                :rows="2"
                placeholder="请输入功能"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="货期">
              <el-input v-model="formData.details.stockStatus" placeholder="请输入货期" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="纯化">
              <el-input
                v-model="formData.details.purification"
                type="textarea"
                :rows="2"
                placeholder="请输入纯化"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="克隆性">
              <el-input v-model="formData.details.clonality" placeholder="请输入克隆性" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="说明书">
              <el-input
                v-model="formData.details.manual"
                type="textarea"
                :rows="2"
                placeholder="请输入说明书"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="多图">
              <el-input v-model="formData.details.img" placeholder="请输入多图（支持多图，用逗号分隔）" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="多图描述">
              <el-input
                v-model="formData.details.imgDesc"
                type="textarea"
                :rows="2"
                placeholder="请输入多图描述"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </template>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  product: {
    type: Object,
    default: null
  },
  productTypes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const formRef = ref(null)
const loading = ref(false)

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.product)

// 初始化详细信息字段（33个字段）
const initDetails = () => ({
  alias: '',
  geneName: '',
  proteinName: '',
  application: '',
  reactiveSpecies: '',
  storageBuffer: '',
  humanGeneId: null,
  humanGeneLink: '',
  humanSwissprotNo: '',
  humanSwissprotLink: '',
  mouseGeneId: null,
  mouseGeneLink: '',
  mouseSwissprotNo: '',
  mouseSwissprotLink: '',
  ratGeneId: null,
  ratGeneLink: '',
  ratSwissprotNo: '',
  ratSwissprotLink: '',
  reference: '',
  referenceMolecularWeight: '',
  predictedMolecularWeight: '',
  storageCondition: '',
  host: '',
  isotype: '',
  cellLocalization: '',
  signalingPathway: '',
  function: '',
  stockStatus: '',
  purification: '',
  clonality: '',
  manual: '',
  img: '',
  imgDesc: ''
})

const formData = reactive({
  type: '',
  productNo: '',
  cnName: '',
  productImage: '',
  price: '',
  background: '',
  categoryFlag: '',
  details: initDetails()
})

// 根据类型 ID 判断是否需要 details 字段
const isResearchTestReagent = computed(() => {
  if (!formData.type) return false
  
  // 在 productTypes 中查找当前类型
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
  
  const type = findTypeInTree(props.productTypes, formData.type)
  return type ? type.hasDetails : false
})

// 产品名称现在只在顶层，不需要同步

const formRules = {
  type: [
    { required: true, message: '请选择产品类型', trigger: 'change' }
  ],
  productNo: [
    { required: true, message: '请输入货号', trigger: 'blur' }
  ]
}

// 获取第一个可用的类型 ID（优先选择子类型）
const getFirstAvailableType = () => {
  for (const type of props.productTypes) {
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

const resetForm = () => {
  formData.type = getFirstAvailableType()
  formData.productNo = ''
  formData.cnName = ''
  formData.productImage = ''
  formData.price = ''
  formData.background = ''
  formData.categoryFlag = ''
  formData.details = initDetails()
  formRef.value?.clearValidate()
}

// 监听 product 变化，填充表单
watch(() => props.product, (newProduct) => {
  if (newProduct) {
    formData.type = newProduct.type || ''
    formData.productNo = newProduct.productNo || ''
    formData.cnName = newProduct.cnName || ''
    formData.productImage = newProduct.productImage || ''
    formData.price = newProduct.price || ''
    formData.background = newProduct.background || ''
    formData.categoryFlag = newProduct.categoryFlag || ''
    
    // 根据类型判断是否需要 details 字段
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
    const productType = findTypeInTree(props.productTypes, newProduct.type)
    
    if (productType && productType.hasDetails && newProduct.details) {
      formData.details = { ...initDetails(), ...newProduct.details }
    } else {
      formData.details = initDetails()
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// 监听 visible 变化，重置表单
watch(visible, (val) => {
  if (!val) {
    resetForm()
  } else if (props.product) {
    formData.type = props.product.type || ''
    formData.productNo = props.product.productNo || ''
    formData.cnName = props.product.cnName || ''
    formData.productImage = props.product.productImage || ''
    formData.price = props.product.price || ''
    formData.background = props.product.background || ''
    formData.categoryFlag = props.product.categoryFlag || ''
    
    // 根据类型判断是否需要 details 字段
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
    const productType = findTypeInTree(props.productTypes, props.product.type)
    
    if (productType && productType.hasDetails && props.product.details) {
      formData.details = { ...initDetails(), ...props.product.details }
    } else {
      formData.details = initDetails()
    }
  }
})

const handleClose = () => {
  visible.value = false
  resetForm()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      
      try {
        const submitData = { ...formData }
        
        // 根据类型判断是否需要 details 字段
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
        const productType = findTypeInTree(props.productTypes, formData.type)
        
        if (productType && productType.hasDetails) {
          submitData.details = { ...formData.details }
        } else {
          // 不需要 details 的类型，不提交 details
          delete submitData.details
        }
        
        emit('submit', submitData)
      } catch (error) {
        ElMessage.error(error.message || '操作失败')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

