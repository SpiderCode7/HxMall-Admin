<template>
  <div class="app-container">
    <el-form
      ref="queryRef"
      :model="queryParams"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="推荐标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入推荐标题"
          clearable
          style="width: 220px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>

      <el-form-item label="推荐说明" prop="alt">
        <el-input
          v-model="queryParams.alt"
          placeholder="请输入推荐说明"
          clearable
          style="width: 220px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>

      <el-form-item label="推荐类型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="请选择推荐类型"
          clearable
          style="width: 180px"
        >
          <el-option
            v-for="dict in hot_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          style="width: 180px"
        >
          <el-option
            v-for="dict in hot_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="排序" prop="sort">
        <el-input
          v-model="queryParams.sort"
          placeholder="请输入排序"
          clearable
          style="width: 160px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['hxmall:hot:add']"
        >
          新增
        </el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['hxmall:hot:edit']"
        >
          修改
        </el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['hxmall:hot:remove']"
        >
          删除
        </el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['hxmall:hot:export']"
        >
          导出
        </el-button>
      </el-col>

      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="hotList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" align="center" prop="id" width="80" />
      <el-table-column label="推荐标题" align="center" prop="title" min-width="140" show-overflow-tooltip />
      <el-table-column label="推荐说明" align="center" prop="alt" min-width="160" show-overflow-tooltip />

      <el-table-column label="卡片图" align="center" width="100">
        <template #default="scope">
          <image-preview
            v-if="getFirstPicture(scope.row.pictures)"
            :src="getFirstPicture(scope.row.pictures)"
            :width="50"
            :height="50"
          />
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column label="推荐类型" align="center" prop="type" width="100">
        <template #default="scope">
          <dict-tag :options="hot_type" :value="scope.row.type" />
        </template>
      </el-table-column>

      <el-table-column label="关联对象" align="center" prop="targetNames" min-width="180" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ scope.row.targetNames || '-' }}</span>
        </template>
      </el-table-column>

      <el-table-column label="关联ID" align="center" min-width="160" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ formatTargetIds(scope.row.targetIds || scope.row.targetId) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="活动主图" align="center" width="100">
        <template #default="scope">
          <image-preview
            v-if="scope.row.coverPicture"
            :src="scope.row.coverPicture"
            :width="50"
            :height="50"
          />
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column label="排序" align="center" prop="sort" width="80" />

      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <dict-tag :options="hot_status" :value="scope.row.status" />
        </template>
      </el-table-column>

      <el-table-column label="创建者" align="center" prop="createBy" width="100" show-overflow-tooltip />
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>

      <el-table-column label="更新者" align="center" prop="updateBy" width="100" show-overflow-tooltip />
      <el-table-column label="更新时间" align="center" prop="updateTime" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="160">
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['hxmall:hot:edit']"
          >
            修改
          </el-button>
          <el-button
            link
            type="primary"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['hxmall:hot:remove']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="title" v-model="open" width="760px" append-to-body>
      <el-form ref="hotRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="推荐标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入推荐标题" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="推荐类型" prop="type">
              <el-select
                v-model="form.type"
                placeholder="请选择推荐类型"
                style="width: 100%"
                @change="handleTypeChange"
              >
                <el-option
                  v-for="dict in hot_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="Number(dict.value)"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="关联对象" prop="targetIds">
              <div class="relation-box">
                <el-input
                  v-model="form.targetNames"
                  placeholder="请先选择推荐类型，再点击右侧按钮选择"
                  readonly
                />
                <el-button type="primary" @click="handleOpenRelationDialog">
                  选择{{ getRelationLabel() }}
                </el-button>
                <el-button @click="clearRelation">清空</el-button>
              </div>
            </el-form-item>
          </el-col>

          <el-col :span="24" v-if="form.targetIds && form.targetIds.length > 0">
            <el-form-item label="已选ID">
              <div class="selected-tags">
                <el-tag
                  v-for="id in form.targetIds"
                  :key="id"
                  class="mr8 mb8"
                >
                  {{ id }}
                </el-tag>
              </div>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number
                v-model="form.sort"
                :min="0"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in hot_status"
                  :key="dict.value"
                  :label="dict.value"
                >
                  {{ dict.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="推荐说明" prop="alt">
              <el-input
                v-model="form.alt"
                type="textarea"
                :rows="3"
                placeholder="请输入推荐说明"
              />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="卡片展示图" prop="pictures">
              <image-upload v-model="form.pictures" :limit="3" />
              <div class="form-tip">
                商品推荐会自动带入所选商品主图；活动/分类类型可手动调整
              </div>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="活动主图" prop="coverPicture">
              <image-upload v-model="form.coverPicture" :limit="1" />
              <div class="form-tip">活动类推荐可上传活动主图，非活动类型可不传</div>
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

    <!-- 商品选择弹窗 -->
    <el-dialog title="选择商品" v-model="productDialogOpen" width="920px" append-to-body>
      <el-form :model="productQueryParams" :inline="true" label-width="68px">
        <el-form-item label="商品名称">
          <el-input
            v-model="productQueryParams.keyword"
            placeholder="请输入商品名称"
            clearable
            style="width: 220px"
            @keyup.enter="getProductTableList"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="getProductTableList">搜索</el-button>
          <el-button icon="Refresh" @click="resetProductQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table
        v-loading="relationLoading"
        :data="productTableList"
        @row-click="handleProductRowClick"
        :row-class-name="getProductRowClassName"
      >
        <el-table-column label="商品ID" prop="id" width="100" align="center" />
        <el-table-column label="主图" width="90" align="center">
          <template #default="scope">
            <image-preview
              v-if="scope.row.mainImage"
              :src="scope.row.mainImage"
              :width="45"
              :height="45"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="商品名称" prop="name" min-width="220" show-overflow-tooltip />
        <el-table-column label="分类" prop="categoryName" min-width="140" show-overflow-tooltip />
        <el-table-column label="价格" prop="minPrice" width="100" align="center" />
        <el-table-column label="操作" width="100" align="center">
          <template #default="scope">
            <el-button
              link
              :type="isProductSelected(scope.row) ? 'danger' : 'primary'"
              @click.stop="toggleProductSelect(scope.row)"
            >
              {{ isProductSelected(scope.row) ? '取消' : '选择' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="productTotal > 0"
        :total="productTotal"
        v-model:page="productQueryParams.pageNum"
        v-model:limit="productQueryParams.pageSize"
        @pagination="getProductTableList"
      />

      <div class="selected-panel">
        <div class="selected-title">
          已选商品 {{ tempSelectedProducts.length }} 个
          <span v-if="Number(form.type) === 1">（商品推荐最多 2 个）</span>
        </div>
        <div class="selected-tags">
          <el-tag
            v-for="item in tempSelectedProducts"
            :key="item.id"
            closable
            class="mr8 mb8"
            @close="removeSelectedProduct(item.id)"
          >
            {{ item.name || `商品ID:${item.id}` }}
          </el-tag>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="confirmProductSelect">确 定</el-button>
          <el-button @click="productDialogOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 分类选择弹窗 -->
    <el-dialog title="选择分类" v-model="categoryDialogOpen" width="860px" append-to-body>
      <el-form :model="categoryQueryParams" :inline="true" label-width="68px">
        <el-form-item label="分类名称">
          <el-input
            v-model="categoryQueryParams.keyword"
            placeholder="请输入分类名称"
            clearable
            style="width: 220px"
            @keyup.enter="getCategoryTableList"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="getCategoryTableList">搜索</el-button>
          <el-button icon="Refresh" @click="resetCategoryQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table
        v-loading="relationLoading"
        :data="categoryTableList"
        @row-click="handleCategoryRowClick"
        :row-class-name="getCategoryRowClassName"
      >
        <el-table-column label="分类ID" prop="id" width="100" align="center" />
        <el-table-column label="分类名称" prop="name" min-width="220" show-overflow-tooltip />
        <el-table-column label="上级分类" prop="parentName" min-width="180" show-overflow-tooltip />
        <el-table-column label="排序" prop="sort" width="100" align="center" />
        <el-table-column label="操作" width="100" align="center">
          <template #default="scope">
            <el-button
              link
              :type="isCategorySelected(scope.row) ? 'danger' : 'primary'"
              @click.stop="handleCategoryRowClick(scope.row)"
            >
              {{ isCategorySelected(scope.row) ? '已选' : '选择' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="categoryTotal > 0"
        :total="categoryTotal"
        v-model:page="categoryQueryParams.pageNum"
        v-model:limit="categoryQueryParams.pageSize"
        @pagination="getCategoryTableList"
      />

      <div class="selected-panel">
        <div class="selected-title">
          {{ currentCategoryRow ? `当前已选：${currentCategoryRow.name}` : '请选择一个分类' }}
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="confirmCategorySelect">确 定</el-button>
          <el-button @click="categoryDialogOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Hot">
import {
  listHot,
  getHot,
  delHot,
  addHot,
  updateHot,
  pageHotRelationProducts,
  pageHotRelationCategories
} from "@/api/marketing/hot"

const { proxy } = getCurrentInstance()
const { hot_status, hot_type } = proxy.useDict("hot_status", "hot_type")

const hotList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")

const relationLoading = ref(false)

// 商品选择弹窗
const productDialogOpen = ref(false)
const productTableList = ref([])
const productTotal = ref(0)
const tempSelectedProducts = ref([])
const productQueryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: null
})

// 分类选择弹窗
const categoryDialogOpen = ref(false)
const categoryTableList = ref([])
const categoryTotal = ref(0)
const currentCategoryRow = ref(null)
const categoryQueryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: null
})

const data = reactive({
  form: {
    id: null,
    title: null,
    alt: null,
    type: null,
    targetIds: [],
    targetNames: "",
    pictures: "",
    coverPicture: null,
    sort: 0,
    status: "1",
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    title: null,
    alt: null,
    type: null,
    sort: null,
    status: null
  },
  rules: {
    title: [
      { required: true, message: "推荐标题不能为空", trigger: "blur" }
    ],
    type: [
      { required: true, message: "推荐类型不能为空", trigger: "change" }
    ],
    targetIds: [
      {
        validator: (_rule, value, callback) => {
          if (!value || !Array.isArray(value) || value.length === 0) {
            callback(new Error("请选择关联对象"))
          } else {
            callback()
          }
        },
        trigger: "change"
      }
    ],
    status: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询热门推荐列表 */
function getList() {
  loading.value = true
  listHot(queryParams.value).then(response => {
    hotList.value = response.rows || []
    total.value = response.total || 0
  }).finally(() => {
    loading.value = false
  })
}

/** 解析多值 */
function parseMultiValue(val) {
  if (val === null || val === undefined || val === "") return []
  if (Array.isArray(val)) return val

  if (typeof val === "string") {
    const str = val.trim()
    if (!str) return []

    try {
      const arr = JSON.parse(str)
      if (Array.isArray(arr)) return arr
    } catch (e) {}

    if (str.includes(",")) {
      return str.split(",").map(item => item.trim()).filter(Boolean)
    }

    return [str]
  }

  return [val]
}

/** 解析图片 */
function getPictureList(pictures) {
  if (!pictures) return []
  if (Array.isArray(pictures)) return pictures

  if (typeof pictures === "string") {
    try {
      const arr = JSON.parse(pictures)
      if (Array.isArray(arr)) return arr
    } catch (e) {}

    return pictures.split(",").map(item => item.trim()).filter(Boolean)
  }

  return []
}

/** 获取首张图片 */
function getFirstPicture(pictures) {
  const list = getPictureList(pictures)
  return list.length ? list[0] : ""
}

/** 格式化关联ID */
function formatTargetIds(val) {
  const list = parseMultiValue(val)
  return list.length ? list.join(", ") : "-"
}

/** 构造提交值 */
function buildSubmitData() {
  return {
    ...form.value,
    targetIds: (form.value.targetIds || []).join(","),
    pictures: Array.isArray(form.value.pictures)
      ? form.value.pictures.join(",")
      : (form.value.pictures || "")
  }
}

/** 获取关联标签名 */
function getRelationLabel() {
  const type = Number(form.value.type)
  if (type === 1) return "商品"
  if (type === 2) return "分类"
  if (type === 3) return "活动商品"
  return "对象"
}

// 取消按钮
function cancel() {
  open.value = false
  reset()
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    title: null,
    alt: null,
    type: null,
    targetIds: [],
    targetNames: "",
    pictures: "",
    coverPicture: null,
    sort: 0,
    status: "1",
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  }
  tempSelectedProducts.value = []
  currentCategoryRow.value = null
  proxy.resetForm("hotRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加首页热门推荐"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _id = row?.id || ids.value[0]
  getHot(_id).then(response => {
    const data = response.data || {}
    data.type = data.type !== null && data.type !== undefined ? Number(data.type) : null
    data.targetIds = parseMultiValue(data.targetIds || data.targetId)
    data.pictures = Array.isArray(data.pictures) ? data.pictures.join(",") : (data.pictures || "")
    form.value = {
      ...form.value,
      ...data
    }
    open.value = true
    title.value = "修改首页热门推荐"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["hotRef"].validate(valid => {
    if (valid) {
      const submitData = buildSubmitData()
      if (form.value.id != null) {
        updateHot(submitData).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addHot(submitData).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row?.id || ids.value
  proxy.$modal.confirm('是否确认删除首页热门推荐编号为"' + _ids + '"的数据项？').then(function () {
    return delHot(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    "hxmall/hot/export",
    {
      ...queryParams.value
    },
    `hot_${new Date().getTime()}.xlsx`
  )
}

/** 类型切换时清空旧选择 */
function handleTypeChange() {
  form.value.targetIds = []
  form.value.targetNames = ""
  form.value.pictures = ""
  tempSelectedProducts.value = []
  currentCategoryRow.value = null
}

/** 清空关联对象 */
function clearRelation() {
  form.value.targetIds = []
  form.value.targetNames = ""
  if (Number(form.value.type) === 1 || Number(form.value.type) === 3) {
    form.value.pictures = ""
  }
  tempSelectedProducts.value = []
  currentCategoryRow.value = null
}

/** 打开关联对象选择弹窗 */
function handleOpenRelationDialog() {
  const type = Number(form.value.type)
  if (!type) {
    proxy.$modal.msgWarning("请先选择推荐类型")
    return
  }

  if (type === 1 || type === 3) {
    initTempSelectedProducts()
    productDialogOpen.value = true
    getProductTableList()
  } else if (type === 2) {
    initCurrentCategoryRow()
    categoryDialogOpen.value = true
    getCategoryTableList()
  }
}

/** 初始化已选商品 */
function initTempSelectedProducts() {
  const idsList = parseMultiValue(form.value.targetIds)
  const names = (form.value.targetNames || "").split(/[，,]/).map(item => item.trim()).filter(Boolean)

  tempSelectedProducts.value = idsList.map((id, index) => ({
    id,
    name: names[index] || `商品ID:${id}`,
    mainImage: ""
  }))
}

/** 初始化已选分类 */
function initCurrentCategoryRow() {
  const idsList = parseMultiValue(form.value.targetIds)
  if (idsList.length > 0) {
    currentCategoryRow.value = {
      id: idsList[0],
      name: form.value.targetNames || `分类ID:${idsList[0]}`
    }
  } else {
    currentCategoryRow.value = null
  }
}

/** 查询商品表格 */
function getProductTableList() {
  relationLoading.value = true
  pageHotRelationProducts(productQueryParams).then(res => {
    productTableList.value = res.rows || []
    productTotal.value = res.total || 0

    // 用当前页的真实数据覆盖占位数据
    const selectedMap = new Map(tempSelectedProducts.value.map(item => [String(item.id), item]))
    productTableList.value.forEach(row => {
      if (selectedMap.has(String(row.id))) {
        selectedMap.set(String(row.id), { ...selectedMap.get(String(row.id)), ...row })
      }
    })
    tempSelectedProducts.value = Array.from(selectedMap.values())
  }).finally(() => {
    relationLoading.value = false
  })
}

function resetProductQuery() {
  productQueryParams.pageNum = 1
  productQueryParams.pageSize = 10
  productQueryParams.keyword = null
  getProductTableList()
}

/** 查询分类表格 */
function getCategoryTableList() {
  relationLoading.value = true
  pageHotRelationCategories(categoryQueryParams).then(res => {
    categoryTableList.value = res.rows || []
    categoryTotal.value = res.total || 0
  }).finally(() => {
    relationLoading.value = false
  })
}

function resetCategoryQuery() {
  categoryQueryParams.pageNum = 1
  categoryQueryParams.pageSize = 10
  categoryQueryParams.keyword = null
  getCategoryTableList()
}

/** 商品是否已选 */
function isProductSelected(row) {
  return tempSelectedProducts.value.some(item => String(item.id) === String(row.id))
}

/** 商品表格选中样式 */
function getProductRowClassName({ row }) {
  return isProductSelected(row) ? "selected-row" : ""
}

/** 选择/取消商品 */
function toggleProductSelect(row) {
  const index = tempSelectedProducts.value.findIndex(item => String(item.id) === String(row.id))
  if (index > -1) {
    tempSelectedProducts.value.splice(index, 1)
    return
  }

  if (Number(form.value.type) === 1 && tempSelectedProducts.value.length >= 2) {
    proxy.$modal.msgWarning("商品推荐最多只能选择2个商品")
    return
  }

  tempSelectedProducts.value.push({ ...row })
}

function handleProductRowClick(row) {
  toggleProductSelect(row)
}

function removeSelectedProduct(id) {
  const index = tempSelectedProducts.value.findIndex(item => String(item.id) === String(id))
  if (index > -1) {
    tempSelectedProducts.value.splice(index, 1)
  }
}

/** 确认商品选择 */
function confirmProductSelect() {
  if (!tempSelectedProducts.value.length) {
    proxy.$modal.msgWarning("请选择商品")
    return
  }

  form.value.targetIds = tempSelectedProducts.value.map(item => item.id)
  form.value.targetNames = tempSelectedProducts.value.map(item => item.name).join("，")

  const imageList = tempSelectedProducts.value
    .map(item => item.mainImage)
    .filter(Boolean)

  // 商品推荐：自动带前2张
  if (Number(form.value.type) === 1) {
    form.value.pictures = imageList.slice(0, 2).join(",")
  }

  // 活动推荐：默认带前3张，可手动调整
  if (Number(form.value.type) === 3) {
    form.value.pictures = imageList.slice(0, 3).join(",")
  }

  productDialogOpen.value = false
}

/** 分类是否已选 */
function isCategorySelected(row) {
  return currentCategoryRow.value && String(currentCategoryRow.value.id) === String(row.id)
}

/** 分类表格选中样式 */
function getCategoryRowClassName({ row }) {
  return isCategorySelected(row) ? "selected-row" : ""
}

/** 选择分类 */
function handleCategoryRowClick(row) {
  currentCategoryRow.value = { ...row }
}

/** 确认分类选择 */
function confirmCategorySelect() {
  if (!currentCategoryRow.value) {
    proxy.$modal.msgWarning("请选择分类")
    return
  }

  form.value.targetIds = [currentCategoryRow.value.id]
  form.value.targetNames = currentCategoryRow.value.name
  categoryDialogOpen.value = false
}

getList()
</script>

<style scoped>
.form-tip {
  line-height: 20px;
  font-size: 12px;
  color: #909399;
  margin-top: 6px;
}

.relation-box {
  display: flex;
  width: 100%;
  gap: 10px;
}

.selected-panel {
  margin-top: 14px;
  padding: 12px 14px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background: #fafafa;
}

.selected-title {
  margin-bottom: 10px;
  font-size: 13px;
  color: #606266;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
}

.mr8 {
  margin-right: 8px;
}

.mb8 {
  margin-bottom: 8px;
}

:deep(.selected-row td) {
  background-color: #ecf5ff !important;
}
</style>