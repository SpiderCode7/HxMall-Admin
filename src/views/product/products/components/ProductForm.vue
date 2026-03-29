<template>
  <div class="app-container">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
      <el-page-header @back="handleBack" class="mb16">
        <template #content>
          <span class="text-large font-600 mr-3">
            {{ mode === 'add' ? '新增商品' : '编辑商品' }}
          </span>
        </template>
      </el-page-header>

      <el-card shadow="never">
        <el-tabs v-model="activeTab">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="basic">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="商品名称" prop="product.name">
                  <el-input v-model="form.product.name" placeholder="请输入商品名称" />
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="商品副标题" prop="product.sub_title">
                  <el-input v-model="form.product.sub_title" placeholder="请输入商品副标题" />
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="商品分类" prop="product.category_id">
                  <el-select v-model="form.product.category_id" placeholder="请选择商品分类" style="width: 100%">
                    <el-option
                      v-for="item in categoryOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="商品品牌" prop="product.brand_id">
                  <el-select v-model="form.product.brand_id" placeholder="请选择商品品牌" style="width: 100%">
                    <el-option
                      v-for="item in brandOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="商品主图" prop="product.main_image">
                  <image-upload v-model="form.product.main_image" :limit="1" />
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="SPU编码" prop="product.spu_code">
                  <el-input v-model="form.product.spu_code" placeholder="请输入SPU编码" />
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="最低售价" prop="product.min_price">
                  <el-input-number v-model="form.product.min_price" :min="0" :precision="2" style="width: 100%" />
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="参数模板" prop="product.param_template_id">
                  <el-select
                    v-model="form.product.param_template_id"
                    placeholder="请选择参数模板"
                    style="width: 100%"
                    @change="handleParamTemplateChange"
                  >
                    <el-option
                      v-for="item in paramTemplateOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="销量" prop="product.sales_count">
                  <el-input-number v-model="form.product.sales_count" :min="0" style="width: 100%" />
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="排序" prop="product.sort">
                  <el-input-number v-model="form.product.sort" :min="0" style="width: 100%" />
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="状态" prop="product.status">
                  <el-radio-group v-model="form.product.status">
                    <el-radio :label="1">上架</el-radio>
                    <el-radio :label="0">下架</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>

              <el-col :span="24">
                <el-form-item label="商品描述" prop="product.description">
                  <el-input
                    v-model="form.product.description"
                    type="textarea"
                    :rows="5"
                    placeholder="请输入商品描述"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>

          <!-- 商品图片 -->
          <el-tab-pane label="商品图片" name="image">
            <div class="mb16">
              <el-button type="primary" plain @click="addImageRow">新增图片</el-button>
            </div>

            <div v-for="(item, index) in form.product_image" :key="index" class="block-box">
              <el-row :gutter="20">
                <el-col :span="10">
                  <el-form-item :label="`图片${index + 1}`">
                    <image-upload v-model="item.imageUrl" :limit="1" />
                  </el-form-item>
                </el-col>

                <el-col :span="5">
                  <el-form-item label="图片类型">
                    <el-select v-model="item.imageType" style="width: 100%">
                      <el-option label="轮播图" :value="1" />
                      <el-option label="详情图" :value="2" />
                    </el-select>
                  </el-form-item>
                </el-col>

                <el-col :span="5">
                  <el-form-item label="排序">
                    <el-input-number v-model="item.sort" :min="0" style="width: 100%" />
                  </el-form-item>
                </el-col>

                <el-col :span="4" class="action-col">
                  <el-button type="danger" plain @click="removeImageRow(index)">删除</el-button>
                </el-col>
              </el-row>
            </div>
          </el-tab-pane>

          <!-- 商品参数 -->
          <el-tab-pane label="商品参数" name="param">
            <el-alert
              title="商品参数会根据所选参数模板自动生成"
              type="info"
              :closable="false"
              class="mb16"
            />

            <div v-if="!form.product.param_template_id" class="empty-tip">
              请先在“基本信息”中选择参数模板
            </div>
          
            <div v-else-if="!form.product_param.length" class="empty-tip">
              当前模板下没有可用参数项
            </div>
          
            <div v-else>
              <div v-for="(item, index) in form.product_param" :key="index" class="block-box">
                <el-row :gutter="20">
                  <el-col :span="6">
                    <el-form-item :label="`参数名${index + 1}`">
                      <el-input v-model="item.param_name" disabled />
                    </el-form-item>
                  </el-col>
                
                  <el-col :span="12">
                    <el-form-item
                      :label="item.is_required === '1' ? '参数值(必填)' : '参数值'"
                      :required="item.is_required === '1'"
                    >
                      <!-- 手动输入 -->
                      <el-input
                        v-if="item.input_type === '1'"
                        v-model="item.param_value"
                        placeholder="请输入参数值"
                      />
                  
                      <!-- 下拉选择 -->
                      <el-select
                        v-else-if="item.input_type === '2'"
                        v-model="item.param_value"
                        placeholder="请选择参数值"
                        style="width: 100%"
                      >
                        <el-option
                          v-for="opt in (item.options_value ? item.options_value.split(',') : [])"
                          :key="opt"
                          :label="opt"
                          :value="opt"
                        />
                      </el-select>
                    
                      <!-- 兜底 -->
                      <el-input
                        v-else
                        v-model="item.param_value"
                        placeholder="请输入参数值"
                      />
                    </el-form-item>
                  </el-col>
                
                  <el-col :span="6">
                    <el-form-item label="输入方式">
                      <el-tag v-if="item.input_type === '1'">手动输入</el-tag>
                      <el-tag v-else-if="item.input_type === '2'" type="success">下拉选择</el-tag>
                      <el-tag v-else type="info">未知</el-tag>
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
            </div>
          </el-tab-pane>

          <!-- 商品规格 -->
          <el-tab-pane label="商品规格" name="spec">
            <div class="mb16">
              <el-button type="primary" plain @click="addSpecRow">新增规格</el-button>
              <el-button type="success" @click="generateSkuList">生成SKU</el-button>
            </div>

            <div v-for="(spec, specIndex) in form.product_spec" :key="specIndex" class="spec-box">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item :label="`规格名${specIndex + 1}`">
                    <el-input v-model="spec.spec_name" placeholder="如：颜色、内存、版本" />
                  </el-form-item>
                </el-col>

                <el-col :span="5">
                  <el-form-item label="排序">
                    <el-input-number v-model="spec.sort" :min="0" style="width: 100%" />
                  </el-form-item>
                </el-col>

                <el-col :span="5">
                  <el-form-item label="状态">
                    <el-select v-model="spec.status" style="width: 100%">
                      <el-option label="正常" value="0" />
                      <el-option label="停用" value="1" />
                    </el-select>
                  </el-form-item>
                </el-col>

                <el-col :span="6" class="action-col">
                  <el-button type="primary" plain @click="addSpecValueRow(specIndex)">新增规格值</el-button>
                  <el-button type="danger" plain @click="removeSpecRow(specIndex)">删除规格</el-button>
                </el-col>
              </el-row>

              <div
                v-for="(value, valueIndex) in spec.product_spec_value"
                :key="valueIndex"
                class="inner-box"
              >
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-form-item :label="`规格值${valueIndex + 1}`">
                      <el-input v-model="value.value_name" placeholder="如：黑色、16G、512G" />
                    </el-form-item>
                  </el-col>

                  <el-col :span="5">
                    <el-form-item label="排序">
                      <el-input-number v-model="value.sort" :min="0" style="width: 100%" />
                    </el-form-item>
                  </el-col>

                  <el-col :span="5">
                    <el-form-item label="状态">
                      <el-select v-model="value.status" style="width: 100%">
                        <el-option label="正常" value="0" />
                        <el-option label="停用" value="1" />
                      </el-select>
                    </el-form-item>
                  </el-col>

                  <el-col :span="6" class="action-col">
                    <el-button type="danger" plain @click="removeSpecValueRow(specIndex, valueIndex)">删除规格值</el-button>
                  </el-col>
                </el-row>
              </div>
            </div>
          </el-tab-pane>

          <!-- SKU -->
          <el-tab-pane label="SKU信息" name="sku">
            <el-alert
              title="SKU由规格组合生成，生成后可继续手动修改价格、库存、图片等信息"
              type="info"
              :closable="false"
              class="mb16"
            />

            <el-table :data="form.product_sku" border size="small" class="sku-table">
              <el-table-column label="SKU名称" min-width="180">
                <template #default="{ row }">
                  <el-input v-model="row.sku_name" />
                </template>
              </el-table-column>

              <el-table-column label="SKU编码" min-width="160">
                <template #default="{ row }">
                  <el-input v-model="row.sku_code" />
                </template>
              </el-table-column>

              <el-table-column label="规格JSON" min-width="260">
                <template #default="{ row }">
                  <el-input v-model="row.spec_data" type="textarea" :rows="1" />
                </template>
              </el-table-column>

              <el-table-column label="销售价" min-width="200">
                <template #default="{ row }">
                  <el-input-number v-model="row.price" :min="0" :precision="2" style="width: 100%" />
                </template>
              </el-table-column>

              <el-table-column label="原价" min-width="200">
                <template #default="{ row }">
                  <el-input-number v-model="row.original_price" :min="0" :precision="2" style="width: 100%" />
                </template>
              </el-table-column>

              <el-table-column label="库存" min-width="200">
                <template #default="{ row }">
                  <el-input-number v-model="row.stock" :min="0" style="width: 100%" />
                </template>
              </el-table-column>

              <el-table-column label="销量" min-width="200">
                <template #default="{ row }">
                  <el-input-number v-model="row.sales_count" :min="0" style="width: 100%" />
                </template>
              </el-table-column>

              <el-table-column label="图片" min-width="170">
                <template #default="{ row }">
                    <image-upload v-model="row.image" :limit="1" />
                </template>
              </el-table-column>

              <el-table-column label="状态" min-width="100">
                <template #default="{ row }">
                  <el-radio-group v-model="row.status">
                    <el-radio :label="1">启用</el-radio>
                    <el-radio :label="0">禁用</el-radio>
                  </el-radio-group>
                </template>
              </el-table-column>

              <el-table-column label="排序" min-width="160">
                <template #default="{ row }">
                  <el-input-number v-model="row.sort" :min="0" style="width: 100%" />
                </template>
              </el-table-column>

              <el-table-column label="操作" width="100" fixed="right">
                <template #default="{ $index }">
                  <el-button type="danger" link @click="removeSkuRow($index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <!-- 服务模板 -->
          <el-tab-pane label="服务模板" name="service">
            <el-form-item label="商品服务">
              <el-checkbox-group v-model="form.product_service_ids">
                <el-checkbox
                  v-for="item in serviceTemplateOptions"
                  :key="item.value"
                  :label="item.value"
                >
                  {{ item.label }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-card>

      <div class="footer-actions">
        <el-button type="primary" @click="handleSubmit">
          {{ mode === 'add' ? '保存商品' : '保存修改' }}
        </el-button>
        <el-button @click="handleBack">返回</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import {
  addProduct,
  updateProduct,
  getProduct,
  listCategoryOptions,
  listBrandOptions,
  listParamTemplateOptions,
  listServiceTemplateOptions,
  getParamTemplateItems,
} from '@/api/product/products'

const props = defineProps({
  mode: {
    type: String,
    default: 'add',
  },
  productId: {
    type: [String, Number],
    default: null,
  },
})

const router = useRouter()
const formRef = ref()
const activeTab = ref('basic')

const categoryOptions = ref([])
const brandOptions = ref([])
const paramTemplateOptions = ref([])
const serviceTemplateOptions = ref([])
const productParamTempCache = ref([])

const createDefaultForm = () => ({
  product: {
    id: null,
    name: '',
    category_id: null,
    brand_id: null,
    main_image: '',
    sub_title: '',
    description: '',
    min_price: null,
    param_template_id: null,
    spu_code: '',
    sales_count: 0,
    status: 1,
    sort: 0,
  },
  product_image: [],
  product_param: [],
  product_spec: [],
  product_sku: [],
  product_service_ids: [],
})

const form = reactive(createDefaultForm())

const rules = {
  'product.name': [{ required: true, message: '商品名称不能为空', trigger: 'blur' }],
  'product.category_id': [{ required: true, message: '商品分类不能为空', trigger: 'change' }],
  'product.brand_id': [{ required: true, message: '商品品牌不能为空', trigger: 'change' }],
  'product.main_image': [{ required: true, message: '商品主图不能为空', trigger: 'blur' }],
  'product.status': [{ required: true, message: '商品状态不能为空', trigger: 'change' }],
}

function resetFormData() {
  const init = createDefaultForm()
  Object.keys(init).forEach((key) => {
    form[key] = init[key]
  })
}

function normalizeOptionList(list) {
  return (list || []).map((item) => ({
    value: item.id ?? item.value,
    label:
      item.name ||
      item.categoryName ||
      item.brandName ||
      item.templateName ||
      item.serviceName ||
      item.label ||
      `选项${item.id}`,
  }))
}

//根据模板加载参数项
async function loadParamTemplateItems(templateId, keepOldValue = true) {
  if (!templateId) {
    form.product_param = []
    return
  }

  const oldValueMap = new Map()
  if (keepOldValue) {
    form.product_param.forEach((item) => {
      oldValueMap.set(item.param_name, item.param_value)
    })
  }

  const res = await getParamTemplateItems(templateId)
  const templateItems = res?.data || []

  form.product_param = templateItems.map((item, index) => ({
    param_name: item.paramName || '',
    param_value: keepOldValue ? (oldValueMap.get(item.paramName) || '') : '',
    input_type: String(item.inputType ?? '1'),
    options_value: item.optionsValue || '',
    is_required: String(item.isRequired ?? '0'),
    sort: item.sort ?? index + 1,
  }))
}
//监听模板变化
async function handleParamTemplateChange(val) {
  await loadParamTemplateItems(val, false)
}

function getResponseList(res) {
  return res?.data || res?.rows || []
}

async function loadOptions() {
  const [categoryRes, brandRes, paramRes, serviceRes] = await Promise.allSettled([
    listCategoryOptions(),
    listBrandOptions(),
    listParamTemplateOptions(),
    listServiceTemplateOptions(),
  ])

  categoryOptions.value =
    categoryRes.status === 'fulfilled' ? normalizeOptionList(getResponseList(categoryRes.value)) : []

  brandOptions.value =
    brandRes.status === 'fulfilled' ? normalizeOptionList(getResponseList(brandRes.value)) : []

  paramTemplateOptions.value =
    paramRes.status === 'fulfilled' ? normalizeOptionList(getResponseList(paramRes.value)) : []

  serviceTemplateOptions.value =
    serviceRes.status === 'fulfilled' ? normalizeOptionList(getResponseList(serviceRes.value)) : []
}

function addImageRow() {
  form.product_image.push({
    imageUrl: '',
    imageType: 1,
    sort: form.product_image.length + 1,
  })
}

function removeImageRow(index) {
  form.product_image.splice(index, 1)
  resetImageSort()
}

function resetImageSort() {
  form.product_image.forEach((item, index) => {
    item.sort = index + 1
  })
}


function addSpecRow() {
  form.product_spec.push({
    spec_name: '',
    sort: form.product_spec.length + 1,
    status: '0',
    product_spec_value: [],
  })
}

function removeSpecRow(index) {
  form.product_spec.splice(index, 1)
  resetSpecSort()
}

function resetSpecSort() {
  form.product_spec.forEach((item, index) => {
    item.sort = index + 1
  })
}

function addSpecValueRow(specIndex) {
  form.product_spec[specIndex].product_spec_value.push({
    value_name: '',
    sort: form.product_spec[specIndex].product_spec_value.length + 1,
    status: '0',
  })
}

function removeSpecValueRow(specIndex, valueIndex) {
  form.product_spec[specIndex].product_spec_value.splice(valueIndex, 1)
  form.product_spec[specIndex].product_spec_value.forEach((item, index) => {
    item.sort = index + 1
  })
}

function buildSpecJson(combo) {
  const obj = {}
  combo.forEach((item) => {
    obj[item.spec_name] = item.value_name
  })
  return JSON.stringify(obj)
}

function cartesianProduct(specs) {
  let result = [[]]
  for (const spec of specs) {
    const temp = []
    for (const prev of result) {
      for (const value of spec.values) {
        temp.push([
          ...prev,
          {
            spec_name: spec.spec_name,
            value_name: value.value_name,
          },
        ])
      }
    }
    result = temp
  }
  return result
}

function generateSkuList() {
  const validSpecs = form.product_spec
    .filter((spec) => spec.spec_name && spec.product_spec_value?.length > 0)
    .map((spec) => ({
      spec_name: spec.spec_name,
      values: spec.product_spec_value.filter((value) => value.value_name),
    }))
    .filter((spec) => spec.values.length > 0)

  if (!validSpecs.length) {
    ElMessage.warning('请先填写规格和规格值')
    return
  }

  const oldMap = new Map(
    form.product_sku.map((item) => [item.sku_name, item])
  )

  const combinations = cartesianProduct(validSpecs)

  form.product_sku = combinations.map((combo, index) => {
    const skuName = combo.map((item) => item.value_name).join(' / ')
    const old = oldMap.get(skuName)

    return {
      sku_code: old?.sku_code || '',
      sku_name: skuName,
      spec_data: old?.spec_data || buildSpecJson(combo),
      price: old?.price ?? null,
      original_price: old?.original_price ?? null,
      stock: old?.stock ?? 0,
      sales_count: old?.sales_count ?? 0,
      image: old?.image || '',
      status: old?.status ?? 1,
      sort: index + 1,
    }
  })

  ElMessage.success('SKU生成成功')
  activeTab.value = 'sku'
}

function removeSkuRow(index) {
  form.product_sku.splice(index, 1)
  form.product_sku.forEach((item, idx) => {
    item.sort = idx + 1
  })
}

function normalizeDetail(data) {
  resetFormData()

  form.product = {
    id: data.id ?? null,
    name: data.name ?? '',
    category_id: data.categoryId ?? null,
    brand_id: data.brandId ?? null,
    main_image: data.mainImage ?? '',
    sub_title: data.subTitle ?? '',
    description: data.description ?? '',
    min_price: data.minPrice ?? null,
    param_template_id: data.paramTemplateId ?? null,
    spu_code: data.spuCode ?? '',
    sales_count: data.salesCount ?? 0,
    status: data.status ?? 1,
    sort: data.sort ?? 0,
  }

  form.product_image = (data.product_image || []).map((item, index) => ({
    id: item.id ?? null,
    imageUrl: item.imageUrl ?? '',
    imageType: item.imageType ?? 1,
    sort: item.sort ?? index + 1,
  }))

  productParamTempCache.value = (data.product_param || []).map((item) => ({
    param_name: item.param_name ?? item.paramName ?? '',
    param_value: item.param_value ?? item.paramValue ?? '',
  }))

  form.product_spec = (data.product_spec || []).map((spec, specIndex) => ({
    spec_name: spec.spec_name ?? spec.specName ?? '',
    sort: spec.sort ?? specIndex + 1,
    status: spec.status ?? '0',
    product_spec_value: (spec.product_spec_value || []).map((value, valueIndex) => ({
      value_name: value.value_name ?? value.valueName ?? '',
      sort: value.sort ?? valueIndex + 1,
      status: value.status ?? '0',
    })),
  }))

  form.product_sku = (data.product_sku || []).map((sku, index) => ({
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
  }))

  form.product_service_ids = data.product_service_ids || []
}

async function loadDetail() {
  if (!props.productId) return
  const res = await getProduct(props.productId)
  const detail = res?.data || {}
  normalizeDetail(detail)

  // 编辑页：按模板项重建参数，并回填已有参数值
  if (detail.paramTemplateId) {
    const oldValueMap = new Map(
      productParamTempCache.value.map((item) => [item.param_name, item.param_value])
    )

    const templateRes = await getParamTemplateItems(detail.paramTemplateId)
    const templateItems = templateRes?.data || []

    form.product_param = templateItems.map((item, index) => ({
      param_name: item.paramName || '',
      param_value: oldValueMap.get(item.paramName) || '',
      input_type: String(item.inputType ?? '1'),
      options_value: item.optionsValue || '',
      is_required: String(item.isRequired ?? '0'),
      sort: item.sort ?? index + 1,
    }))
  }
}

function buildSubmitData() {
  return {
    product: {
      ...form.product,
    },
    product_image: form.product_image.map((item, index) => ({
      imageUrl: item.imageUrl,
      imageType: item.imageType,
      sort: item.sort ?? index + 1,
    })),
    product_param: form.product_param.map((item) => ({
      param_name: item.param_name,
      param_value: item.param_value,
    })),
    product_spec: form.product_spec.map((spec, specIndex) => ({
      spec_name: spec.spec_name,
      sort: spec.sort ?? specIndex + 1,
      status: spec.status ?? '0',
      product_spec_value: (spec.product_spec_value || []).map((value, valueIndex) => ({
        value_name: value.value_name,
        sort: value.sort ?? valueIndex + 1,
        status: value.status ?? '0',
      })),
    })),
    product_sku: form.product_sku.map((sku, index) => ({
      sku_code: sku.sku_code,
      sku_name: sku.sku_name,
      spec_data: sku.spec_data,
      price: sku.price,
      original_price: sku.original_price,
      stock: sku.stock,
      sales_count: sku.sales_count,
      image: sku.image,
      status: sku.status,
      sort: sku.sort ?? index + 1,
    })),
    product_service_ids: [...form.product_service_ids],
  }
}

async function handleSubmit() {
  await formRef.value.validate()

  const data = buildSubmitData()

  if (!data.product.name) {
    activeTab.value = 'basic'
    return
  }

  if (props.mode === 'add') {
    await addProduct(data)
    ElMessage.success('新增成功')
  } else {
    await updateProduct(data)
    ElMessage.success('修改成功')
  }

  router.push('/product/products')
}

function handleBack() {
  router.back()
}

onMounted(async () => {
  await loadOptions()
  if (props.mode === 'edit') {
    await loadDetail()
  }
})
</script>

<style scoped>
.mb16 {
  margin-bottom: 16px;
}

.footer-actions {
  margin-top: 16px;
  text-align: center;
}

.block-box {
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
}

.spec-box {
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background: #fcfcfc;
}

.inner-box {
  margin-top: 12px;
  padding: 12px;
  border-radius: 6px;
  background: #fff;
  border: 1px dashed #dcdfe6;
}

.action-col {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* .sku-image-box {
  height: 200px;
  overflow: hidden;
  display: flex;
  align-items: center;
} */
</style>