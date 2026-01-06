import request from '@/utils/request'

/**
 * 获取用户列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pagesize - 每页数量
 * @param {string} params.search - 搜索关键词（用户名或邮箱）
 * @param {string} params.role - 角色过滤（super_admin/admin/sales）
 */
export const getUsers = (params = {}) => {
  return request({
    url: '/api/user',
    method: 'get',
    params
  })
}

/**
 * 获取单个用户
 * @param {number} id - 用户ID
 */
export const getUserById = (id) => {
  return request({
    url: `/api/user/${id}`,
    method: 'get'
  })
}

/**
 * 创建用户
 * @param {Object} data - 用户数据
 * @param {string} data.username - 用户名（必填，3-20字符）
 * @param {string} data.email - 邮箱（必填，唯一）
 * @param {string} data.password - 密码（必填，至少6字符）
 * @param {string} data.role - 角色（可选，super_admin/admin/sales，默认sales）
 */
export const createUser = (data) => {
  return request({
    url: '/api/user',
    method: 'post',
    data
  })
}

/**
 * 更新用户
 * @param {number} id - 用户ID
 * @param {Object} data - 用户数据（所有字段可选）
 * @param {string} data.username - 用户名
 * @param {string} data.email - 邮箱
 * @param {string} data.password - 密码
 * @param {string} data.role - 角色
 */
export const updateUser = (id, data) => {
  return request({
    url: `/api/user/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除用户
 * @param {number} id - 用户ID
 */
export const deleteUser = (id) => {
  return request({
    url: `/api/user/${id}`,
    method: 'delete'
  })
}
