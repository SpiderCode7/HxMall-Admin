<template>
  <div class="app-container">
    <!-- 查询表单 -->
    <el-form
      ref="queryRef"
      :model="queryParams"
      :inline="true"
      label-width="80px"
      v-show="showSearch"
    >
      <el-form-item label="商品名称" prop="productId">
        <el-select
          v-model="queryParams.productId"
          placeholder="请选择商品"
          clearable
          filterable
          style="width: 220px"
        >
          <el-option
            v-for="item in productOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          style="width: 220px"
        >
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
        >
          删除
        </el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table
      v-loading="loading"
      :data="skuList"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />

      <el-table-column label="商品名称" align="center" min-width="180">
        <template #default="scope">
          {{ getProductName(scope.row.productId) }}
        </template>
      </el-table-column>

      <el-table-column label="SKU图片" align="center" width="120">
        <template #default="scope">
          <el-image
            v-if="scope.row.image"
            :src="scope.row.image"
            :preview-src-list="[scope.row.image]"
            style="width: 50px; height: 50px; border-radius: 4px"
            fit="cover"
            preview-teleported
          />
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column label="SKU名称" prop="skuName" align="center" min-width="180" />

      <el-table-column label="销售价" align="center" min-width="100">
        <template #default="scope">
          ￥{{ scope.row.price ?? 0 }}
        </template>
      </el-table-column>

      <el-table-column label="库存" prop="stock" align="center" min-width="90" />

      <el-table-column label="销量" align="center" min-width="90">
        <template #default="scope">
          {{ scope.row.salesCount ?? 0 }}
        </template>
      </el-table-column>

      <el-table-column label="状态" align="center" min-width="120">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(scope.row)"
          />
          <div style="margin-top: 5px">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="180" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)">
            修改
          </el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 修改弹窗 -->
    <el-dialog v-model="open" title="修改SKU" width="700px" append-to-body>
      <el-form ref="skuRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="商品名称" prop="productId">
          <el-select
            v-model="form.productId"
            placeholder="请选择商品"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="item in productOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="SKU图片" prop="image">
          <image-upload v-model="form.image" :limit="1" />
        </el-form-item>

        <el-form-item label="SKU名称" prop="skuName">
          <el-input v-model="form.skuName" placeholder="请输入SKU名称" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="销售价" prop="price">
              <el-input-number
                v-model="form.price"
                :min="0"
                :precision="2"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="库存" prop="stock">
              <el-input-number
                v-model="form.stock"
                :min="0"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="销量" prop="salesCount">
              <el-input-number
                v-model="form.salesCount"
                :min="0"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio :label="1">启用</el-radio>
                <el-radio :label="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  listSku,
  getSku,
  updateSku,
  delSku,
  changeSkuStatus,
  getProductOptions
} from '@/api/product/sku'

const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const skuList = ref([])
const productOptions = ref([])
const ids = ref([])
const multiple = ref(true)
const open = ref(false)

const queryRef = ref()
const skuRef = ref()

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  productId: undefined,
  status: undefined
})

const form = reactive({
  id: undefined,
  productId: undefined,
  image: '',
  skuName: '',
  price: 0,
  stock: 0,
  salesCount: 0,
  status: 1
})

const rules = {
  productId: [{ required: true, message: '请选择商品', trigger: 'change' }],
  skuName: [{ required: true, message: '请输入SKU名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入销售价', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

function reset() {
  form.id = undefined
  form.productId = undefined
  form.image = ''
  form.skuName = ''
  form.price = 0
  form.stock = 0
  form.salesCount = 0
  form.status = 1
}

function cancel() {
  open.value = false
  reset()
}

function getProductName(productId) {
  const item = productOptions.value.find(item => item.id === productId)
  return item ? item.name : productId || '-'
}

async function loadProductOptions() {
  const res = await getProductOptions()
  productOptions.value = res.data || []
}

function normalizeRow(row) {
  return {
    ...row,
    id: row.id,
    productId: row.productId,
    skuCode: row.skuCode,
    skuName: row.skuName,
    specData: row.specData,
    price: row.price,
    originPrice: row.originPrice,
    stock: row.stock,
    salesCount: row.salesCount,
    image: row.image,
    status: Number(row.status ?? 1),
    sort: row.sort
  }
}

async function getList() {
  loading.value = true
  try {
    const params = {
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize,
      productId: queryParams.productId,
      status: queryParams.status
    }
    const res = await listSku(params)
    skuList.value = (res.rows || []).map(item => normalizeRow(item))
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  queryRef.value?.resetFields()
  queryParams.pageNum = 1
  queryParams.pageSize = 10
  getList()
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  multiple.value = !selection.length
}

async function handleUpdate(row) {
  reset()
  const res = await getSku(row.id)
  const data = normalizeRow(res.data || {})
  form.id = data.id
  form.productId = data.productId
  form.image = data.image
  form.skuName = data.skuName
  form.price = data.price
  form.stock = data.stock
  form.salesCount = data.salesCount
  form.status = data.status
  open.value = true
}

function submitForm() {
  skuRef.value.validate(async valid => {
    if (!valid) return

    const data = {
      id: form.id,
      productId: form.productId,
      image: form.image,
      skuName: form.skuName,
      price: form.price,
      stock: form.stock,
      salesCount: form.salesCount,
      status: form.status
    }

    await updateSku(data)
    ElMessage.success('修改成功')
    open.value = false
    getList()
  })
}

async function handleDelete(row) {
  const skuIds = row?.id ? [row.id] : ids.value

  if (!skuIds.length) {
    ElMessage.warning('请选择要删除的数据')
    return
  }

  await ElMessageBox.confirm('确认删除选中的SKU数据吗？', '提示', {
    type: 'warning'
  })

  await delSku(skuIds.join(','))
  ElMessage.success('删除成功')
  getList()
}

async function handleStatusChange(row) {
  const newStatus = row.status
  const oldStatus = newStatus === 1 ? 0 : 1
  const text = newStatus === 1 ? '启用' : '禁用'

  try {
    await ElMessageBox.confirm(`确认要${text}“${row.skuName}”吗？`, '提示', {
      type: 'warning'
    })
    await changeSkuStatus(row.id, newStatus)
    ElMessage.success(`${text}成功`)
  } catch (e) {
    row.status = oldStatus
  }
}

onMounted(async () => {
  await loadProductOptions()
  await getList()
})
</script>

<style scoped>
.mb8 {
  margin-bottom: 8px;
}
</style>