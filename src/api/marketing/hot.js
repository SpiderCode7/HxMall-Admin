import request from '@/utils/request'

// 查询热门推荐列表
export function listHot(query) {
  return request({
    url: '/marketing/hot/list',
    method: 'get',
    params: query
  })
}

// 查询热门推荐详细
export function getHot(id) {
  return request({
    url: '/marketing/hot/' + id,
    method: 'get'
  })
}

// 新增热门推荐
export function addHot(data) {
  return request({
    url: '/marketing/hot',
    method: 'post',
    data: data
  })
}

// 修改热门推荐
export function updateHot(data) {
  return request({
    url: '/marketing/hot',
    method: 'put',
    data: data
  })
}

// 删除热门推荐
export function delHot(id) {
  return request({
    url: '/marketing/hot/' + id,
    method: 'delete'
  })
}

// 商品选择弹窗分页查询
export function pageHotRelationProducts(query) {
  return request({
    url: '/product/products/hot/products',
    method: 'get',
    params: query
  })
}

// 分类选择弹窗分页查询
export function pageHotRelationCategories(query) {
  return request({
    url: '/product/category/hot/categories',
    method: 'get',
    params: query
  })
}