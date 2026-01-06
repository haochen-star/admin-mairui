<template>
  <div class="user-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>账户管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              新增账户
            </el-button>
          </div>
        </div>
      </template>

      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索用户名或邮箱"
          style="width: 300px; margin-right: 10px"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select
          v-model="selectedRole"
          placeholder="选择角色"
          style="width: 150px; margin-right: 10px"
          clearable
          @change="handleRoleChange"
        >
          <el-option label="超级管理员" value="super_admin" />
          <el-option label="管理员" value="admin" />
          <el-option label="销售" value="sales" />
        </el-select>

        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="users"
        style="width: 100%; margin-top: 20px"
        border
        row-key="id"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)">
              {{ getRoleLabel(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
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

    <UserForm
      v-model="formVisible"
      :user="currentUser"
      @submit="handleFormSubmit"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import {
  getUsers as getUsersApi,
  createUser as createUserApi,
  updateUser as updateUserApi,
  deleteUser as deleteUserApi
} from '@/api/user'
import UserForm from '@/components/UserForm.vue'

const loading = ref(false)
const formVisible = ref(false)
const currentUser = ref(null)
const searchKeyword = ref('')
const selectedRole = ref('')
const users = ref([])

const pagination = reactive({
  page: 1,
  pagesize: 10,
  total: 0,
  totalPages: 0
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 获取角色标签
const getRoleLabel = (role) => {
  const roleMap = {
    super_admin: '超级管理员',
    admin: '管理员',
    sales: '销售'
  }
  return roleMap[role] || role
}

// 获取角色标签类型
const getRoleTagType = (role) => {
  const typeMap = {
    super_admin: 'danger',
    admin: 'warning',
    sales: 'success'
  }
  return typeMap[role] || ''
}

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pagesize: pagination.pagesize
    }
    
    if (searchKeyword.value) {
      params.search = searchKeyword.value
    }
    
    if (selectedRole.value) {
      params.role = selectedRole.value
    }
    
    const response = await getUsersApi(params)
    
    if (response.success && response.data) {
      users.value = response.data.users || []
      pagination.total = response.data.pagination?.total || 0
      pagination.totalPages = response.data.pagination?.totalPages || 0
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchUsers()
}

// 角色改变
const handleRoleChange = () => {
  pagination.page = 1
  fetchUsers()
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.pagesize = size
  pagination.page = 1
  fetchUsers()
}

// 页码改变
const handlePageChange = (page) => {
  pagination.page = page
  fetchUsers()
}

// 新增用户
const handleAdd = () => {
  currentUser.value = null
  formVisible.value = true
}

// 编辑用户
const handleEdit = (row) => {
  currentUser.value = { ...row }
  formVisible.value = true
}

// 删除用户
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${row.username}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.value = true
    const response = await deleteUserApi(row.id)
    
    if (response.success) {
      ElMessage.success('删除成功')
      fetchUsers()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  } finally {
    loading.value = false
  }
}

// 表单提交
const handleFormSubmit = async (formData) => {
  try {
    loading.value = true

    let response
    if (currentUser.value) {
      // 编辑
      response = await updateUserApi(currentUser.value.id, formData)
      if (response.success) {
        ElMessage.success('更新成功')
      } else {
        ElMessage.error(response.message || '更新失败')
        return
      }
    } else {
      // 新增
      response = await createUserApi(formData)
      if (response.success) {
        ElMessage.success('创建成功')
      } else {
        ElMessage.error(response.message || '创建失败')
        return
      }
    }

    formVisible.value = false
    currentUser.value = null
    fetchUsers()
  } catch (error) {
    const errorMessage = error.response?.data?.message || '操作失败'
    ElMessage.error(errorMessage)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-list {
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
</style>

