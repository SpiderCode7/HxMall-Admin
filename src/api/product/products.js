import request from '@/utils/request'

// 商品列表
export function listProducts(query) {
  return request({
    url: '/product/products/list',
    method: 'get',
    params: query,
  })
}

// 商品详情
export function getProduct(id) {
  return request({
    url: `/product/products/${id}`,
    method: 'get',
  })
}

// 新增商品
export function addProduct(data) {
  return request({
    url: '/product/products',
    method: 'post',
    data,
  })
}

// 修改商品
export function updateProduct(data) {
  return request({
    url: '/product/products',
    method: 'put',
    data,
  })
}

// 删除商品
export function delProduct(ids) {
  return request({
    url: `/product/products/${ids}`,
    method: 'delete',
  })
}

/**
 * 下面这几个下拉接口路径，你按你自己的后端改一下
 * 我先给你占位，页面里已经接上了
 */

// 分类下拉
export function listCategoryOptions() {
  return request({
    url: '/product/category/options',
    method: 'get',
  })
}

// 品牌下拉
export function listBrandOptions() {
  return request({
    url: '/product/brand/options',
    method: 'get',
  })
}

// 参数模板下拉
export function listParamTemplateOptions() {
  return request({
    url: '/product/template/options',
    method: 'get',
  })
}

// 服务模板下拉
export function listServiceTemplateOptions() {
  return request({
    url: '/product/service/options',
    method: 'get',
  })
}

export function getParamTemplateItems(templateId) {
  return request({
    url: `/product/paramTemplateItem/template/${templateId}`,
    method: 'get',
  })
}

/**
 * 把详情接口返回的数据，转换成 updateProduct 需要的 ProductSaveDto
 */
export function buildProductSaveDtoFromDetail(detail) {
  return {
    product: {
      id: detail.id ?? null,
      name: detail.name ?? '',
      category_id: detail.categoryId ?? null,
      brand_id: detail.brandId ?? null,
      main_image: detail.mainImage ?? '',
      sub_title: detail.subTitle ?? '',
      description: detail.description ?? '',
      min_price: detail.minPrice ?? null,
      param_template_id: detail.paramTemplateId ?? null,
      spu_code: detail.spuCode ?? '',
      sales_count: detail.salesCount ?? 0,
      status: detail.status ?? 1,
      sort: detail.sort ?? 0,
    },
    product_image: (detail.product_image || []).map((item, index) => ({
      imageUrl: item.imageUrl ?? '',
      imageType: item.imageType ?? 1,
      sort: item.sort ?? index + 1,
    })),
    product_param: (detail.product_param || []).map((item) => ({
      param_name: item.paramName ?? item.param_name ?? '',
      param_value: item.paramValue ?? item.param_value ?? '',
    })),
    product_spec: (detail.product_spec || []).map((spec, specIndex) => ({
      spec_name: spec.spec_name ?? spec.specName ?? '',
      sort: spec.sort ?? specIndex + 1,
      status: spec.status ?? '0',
      product_spec_value: (spec.product_spec_value || []).map((value, valueIndex) => ({
        value_name: value.value_name ?? value.valueName ?? '',
        sort: value.sort ?? valueIndex + 1,
        status: value.status ?? '0',
      })),
    })),
    product_sku: (detail.product_sku || []).map((sku, index) => ({
      sku_code: sku.skuCode ?? sku.sku_code ?? '',
      sku_name: sku.skuName ?? sku.sku_name ?? '',
      spec_data: sku.specData ?? sku.spec_data ?? '',
      price: sku.price ?? null,
      original_price: sku.originPrice ?? sku.original_price ?? null,
      stock: sku.stock ?? 0,
      sales_count: sku.salesCount ?? sku.sales_count ?? 0,
      image: sku.image ?? '',
      status: sku.status ?? 1,
      sort: sku.sort ?? index + 1,
    })),
    product_service_ids: detail.product_service_ids || [],
  }
}

/**
 * 启用/禁用商品
 * 因为后端更新接口需要完整 ProductSaveDto，所以这里先查详情再更新
 */
export async function changeProductStatus(id, status) {
  const res = await getProduct(id)
  const detail = res?.data || {}
  const saveDto = buildProductSaveDtoFromDetail(detail)
  saveDto.product.status = status
  return updateProduct(saveDto)
}