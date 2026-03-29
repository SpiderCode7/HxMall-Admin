import request from '@/utils/request'

// 查询商品SKU列表
export function listSku(query) {
  return request({
    url: '/product/sku/list',
    method: 'get',
    params: query
  })
}

// 查询商品SKU详细
export function getSku(id) {
  return request({
    url: '/product/sku/' + id,
    method: 'get'
  })
}

// 新增商品SKU
export function addSku(data) {
  return request({
    url: '/product/sku',
    method: 'post',
    data: data
  })
}

// 修改商品SKU
export function updateSku(data) {
  return request({
    url: '/product/sku',
    method: 'put',
    data: data
  })
}

// 删除商品SKU
export function delSku(id) {
  return request({
    url: '/product/sku/' + id,
    method: 'delete'
  })
}

// 修改SKU状态
export function changeSkuStatus(id, status) {
  return request({
    url: '/product/sku/changeStatus/' + id,
    method: 'get',
    params: { status }
  })
}
// 查询商品id名字
export function getProductOptions() {
  return request({
    url: '/product/products/options',
    method: 'get'
  })
}
