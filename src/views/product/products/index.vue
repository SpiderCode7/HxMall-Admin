<template>
  <div class="app-container">
    <!-- 查询表单 -->
    <el-form
      ref="queryRef"
      :model="queryParams"
      :inline="true"
      label-width="68px"
      class="mb16"
    >
      <el-form-item label="商品名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入商品名称"
          clearable
          style="width: 220px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>

      <el-form-item label="品牌" prop="brandId">
        <el-select
          v-model="queryParams.brandId"
          placeholder="请选择品牌"
          clearable
          style="width: 220px"
        >
          <el-option
            v-for="item in brandOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="分类" prop="categoryId">
        <el-select
          v-model="queryParams.categoryId"
          placeholder="请选择分类"
          clearable
          style="width: 220px"
        >
          <el-option
            v-for="item in categoryOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
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
          <el-option label="上架" :value="1" />
          <el-option label="下架" :value="0" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 工具栏 -->
    <el-row :gutter="10" class="mb16">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">
          新增商品
        </el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete()"
        >
          删除
        </el-button>
      </el-col>
    </el-row>

    <!-- 列表 -->
    <el-table
      v-loading="loading"
      :data="productList"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />

      <el-table-column label="商品名称" prop="name" min-width="220" show-overflow-tooltip />

      <el-table-column label="商品主图" align="center" width="120">
        <template #default="{ row }">
          <el-image
            v-if="row.mainImage"
            :src="row.mainImage"
            :preview-src-list="[row.mainImage]"
            fit="cover"
            style="width: 60px; height: 60px; border-radius: 6px"
          />
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column label="商品品牌" align="center" min-width="140">
        <template #default="{ row }">
          <span>{{ getBrandLabel(row.brandId) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="商品分类" align="center" min-width="140">
        <template #default="{ row }">
          <span>{{ getCategoryLabel(row.categoryId) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="状态" align="center" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="创建信息" align="center" min-width="180">
        <template #default="{ row }">
          <div>{{ row.createBy || '-' }}</div>
          <div class="sub-text">{{ row.createTime || '-' }}</div>
        </template>
      </el-table-column>

      <el-table-column label="修改信息" align="center" min-width="180">
        <template #default="{ row }">
          <div>{{ row.updateBy || '-' }}</div>
          <div class="sub-text">{{ row.updateTime || '-' }}</div>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="260" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link icon="Edit" @click="handleEdit(row)">
            修改
          </el-button>

          <el-button type="danger" link icon="Delete" @click="handleDelete(row)">
            删除
          </el-button>

          <el-button
            v-if="row.status === 0"
            type="success"
            link
            @click="handleEnable(row)"
          >
            启用
          </el-button>

          <el-button
            v-if="row.status === 1"
            type="warning"
            link
            @click="handleDisable(row)"
          >
            禁用
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import {
  listProducts,
  delProduct,
  changeProductStatus,
  listCategoryOptions,
  listBrandOptions,
} from '@/api/product/products'

const router = useRouter()
const queryRef = ref()

const loading = ref(false)
const total = ref(0)
const productList = ref([])
const ids = ref([])
const multiple = ref(true)

const categoryOptions = ref([])
const brandOptions = ref([])

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  name: '',
  brandId: null,
  categoryId: null,
  status: null,
})

function normalizeOptionList(list) {
  const result = []

  const loop = (arr) => {
    ;(arr || []).forEach((item) => {
      result.push({
        value: item.id ?? item.value,
        label:
          item.name ||
          item.categoryName ||
          item.brandName ||
          item.label ||
          `选项${item.id}`,
      })
      if (item.children && item.children.length) {
        loop(item.children)
      }
    })
  }

  loop(list)
  return result
}

function getBrandLabel(brandId) {
  const target = brandOptions.value.find((item) => item.value === brandId)
  return target ? target.label : '-'
}

function getCategoryLabel(categoryId) {
  const target = categoryOptions.value.find((item) => item.value === categoryId)
  return target ? target.label : '-'
}

async function loadOptions() {
  try {
    const [categoryRes, brandRes] = await Promise.all([
      listCategoryOptions(),
      listBrandOptions(),
    ])

    categoryOptions.value = normalizeOptionList(categoryRes?.data || categoryRes?.rows || [])
    brandOptions.value = normalizeOptionList(brandRes?.data || brandRes?.rows || [])
  } catch (error) {
    console.error(error)
  }
}

async function getList() {
  loading.value = true
  try {
    const res = await listProducts(queryParams)
    productList.value = res?.rows || []
    total.value = res?.total || 0
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
  ids.value = selection.map((item) => item.id)
  multiple.value = !selection.length
}

function handleAdd() {
  router.push('/product/products-add/index')
}

function handleEdit(row) {
  router.push(`/product/products-edit/index/${row.id}`)
}

async function handleDelete(row) {
  const targetIds = row?.id ? [row.id] : ids.value
  if (!targetIds.length) {
    ElMessage.warning('请选择要删除的数据')
    return
  }

  await ElMessageBox.confirm('确认删除选中的商品吗？', '提示', {
    type: 'warning',
  })

  await delProduct(targetIds.join(','))
  ElMessage.success('删除成功')
  getList()
}

async function handleEnable(row) {
  await ElMessageBox.confirm(`确认启用商品“${row.name}”吗？`, '提示', {
    type: 'warning',
  })

  await changeProductStatus(row.id, 1)
  ElMessage.success('启用成功')
  getList()
}

async function handleDisable(row) {
  await ElMessageBox.confirm(`确认禁用商品“${row.name}”吗？`, '提示', {
    type: 'warning',
  })

  await changeProductStatus(row.id, 0)
  ElMessage.success('禁用成功')
  getList()
}

onMounted(async () => {
  await loadOptions()
  await getList()
})
</script>

<style scoped>
.mb16 {
  margin-bottom: 16px;
}

.sub-text {
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
}
</style>