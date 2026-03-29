import request from '@/utils/request'

// 查询商品参数模板列表
export function listParamTemplate(query) {
  return request({
    url: '/product/template/list',
    method: 'get',
    params: query
  })
}

// 查询商品参数模板详细
export function getParamTemplate(id) {
  return request({
    url: '/product/template/' + id,
    method: 'get'
  })
}

// 新增商品参数模板
export function addParamTemplate(data) {
  return request({
    url: '/product/template',
    method: 'post',
    data: data
  })
}

// 修改商品参数模板
export function updateParamTemplate(data) {
  return request({
    url: '/product/template',
    method: 'put',
    data: data
  })
}

// 删除商品参数模板
export function delParamTemplate(id) {
  return request({
    url: '/product/template/' + id,
    method: 'delete'
  })
}
