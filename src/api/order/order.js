import request from '@/utils/request'

// 查询订单列表
export function listOrder(query) {
  return request({
    url: '/order/list',
    method: 'get',
    params: query
  })
}

// 查询订单详情
export function getOrder(id) {
  return request({
    url: '/order/' + id,
    method: 'get'
  })
}

// 后台发货（简化版：直接改订单状态）
export function deliveryOrder(id) {
  return request({
    url: '/order/delivery/' + id,
    method: 'get'
  })
}

// 后台关闭订单
export function closeOrder(id) {
  return request({
    url: '/order/close/' + id,
    method: 'get'
  })
}