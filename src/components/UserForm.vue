<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑账户' : '新增账户'"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="formData.username"
          placeholder="请输入用户名（3-20个字符）"
          :disabled="isEdit"
        />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input
          v-model="formData.email"
          placeholder="请输入邮箱地址"
          type="email"
        />
      </el-form-item>
      <el-form-item label="密码" :prop="isEdit ? 'passwordOptional' : 'password'">
        <el-input
          v-model="formData.password"
          type="password"
          :placeholder="isEdit ? '留空则不修改密码（至少6个字符）' : '请输入密码（至少6个字符）'"
          show-password
        />
      </el-form-item>
      <el-form-item label="角色" prop="role">
        <el-select
          v-model="formData.role"
          placeholder="请选择角色"
          style="width: 100%"
        >
          <el-option label="超级管理员" value="super_admin" />
          <el-option label="管理员" value="admin" />
          <el-option label="销售" value="sales" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const formRef = ref(null)
const loading = ref(false)

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.user)

const formData = reactive({
  username: '',
  email: '',
  password: '',
  role: 'sales'
})

// 验证规则
const validatePassword = (rule, value, callback) => {
  if (!isEdit.value && !value) {
    callback(new Error('请输入密码'))
  } else if (value && value.length < 6) {
    callback(new Error('密码至少需要6个字符'))
  } else {
    callback()
  }
}

const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePassword, trigger: 'blur' }
  ],
  passwordOptional: [
    { validator: validatePassword, trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 监听 user 变化，填充表单
watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      formData.username = newUser.username || ''
      formData.email = newUser.email || ''
      formData.password = ''
      formData.role = newUser.role || 'sales'
    } else {
      // 重置表单
      formData.username = ''
      formData.email = ''
      formData.password = ''
      formData.role = 'sales'
    }
  },
  { immediate: true }
)

// 监听对话框显示状态，重置表单验证
watch(visible, (val) => {
  if (!val && formRef.value) {
    formRef.value.resetFields()
  }
})

const handleClose = () => {
  visible.value = false
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    
    loading.value = true
    
    const submitData = {
      username: formData.username,
      email: formData.email,
      role: formData.role
    }
    
    // 如果是编辑模式且密码为空，则不发送密码字段
    if (!isEdit.value || formData.password) {
      submitData.password = formData.password
    }
    
    emit('submit', submitData)
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    loading.value = false
  }
}

defineExpose({
  setLoading: (val) => {
    loading.value = val
  }
})
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

