import request from '@/utils/request'

// 查询商品服务列表
export function listService(query) {
  return request({
    url: '/product/service/list',
    method: 'get',
    params: query
  })
}

// 查询商品服务详细
export function getService(id) {
  return request({
    url: '/product/service/' + id,
    method: 'get'
  })
}

// 新增商品服务
export function addService(data) {
  return request({
    url: '/product/service',
    method: 'post',
    data: data
  })
}

// 修改商品服务
export function updateService(data) {
  return request({
    url: '/product/service',
    method: 'put',
    data: data
  })
}

// 删除商品服务
export function delService(id) {
  return request({
    url: '/product/service/' + id,
    method: 'delete'
  })
}
