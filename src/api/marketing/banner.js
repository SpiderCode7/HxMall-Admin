import request from '@/utils/request'

// 查询Banner轮播图列表
export function listBanner(query) {
  return request({
    url: '/marketing/banner/list',
    method: 'get',
    params: query
  })
}

// 查询Banner轮播图详细
export function getBanner(id) {
  return request({
    url: '/marketing/banner/' + id,
    method: 'get'
  })
}

// 新增Banner轮播图
export function addBanner(data) {
  return request({
    url: '/marketing/banner',
    method: 'post',
    data: data
  })
}

// 修改Banner轮播图
export function updateBanner(data) {
  return request({
    url: '/marketing/banner',
    method: 'put',
    data: data
  })
}

// 删除Banner轮播图
export function delBanner(id) {
  return request({
    url: '/marketing/banner/' + id,
    method: 'delete'
  })
}