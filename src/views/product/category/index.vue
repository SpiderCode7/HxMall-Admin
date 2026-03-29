<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="分类名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入分类名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>

      <el-form-item label="父分类" prop="parentId">
        <el-select
          v-model="queryParams.parentId"
          placeholder="请选择父分类"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="item in categoryOptions"
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
          style="width: 240px"
        >
          <el-option
            v-for="dict in category_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
          v-hasPermi="['product:category:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['product:category:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="categoryList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="分类名称" align="center" prop="name" />
      <el-table-column label="分类图标" align="center" prop="icon">
        <template #default="scope">
          <image-preview
            v-if="scope.row.icon"
            :src="scope.row.icon"
            :width="50"
            :height="50"
          />
          <span v-else>暂无Logo</span>
        </template>
      </el-table-column>

      <el-table-column label="父分类" align="center" prop="parentId">
        <template #default="scope">
          <span>{{ getParentName(scope.row.parentId) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="排序" align="center" prop="sort" />

      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <el-tag :type="String(scope.row.status) === '1' ? 'success' : 'danger'">
            {{ String(scope.row.status) === '1' ? "启用" : "禁用" }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['product:category:edit']"
          >修改</el-button>

          <el-button
            link
            type="primary"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['product:category:remove']"
          >删除</el-button>

          <el-button
            link
            type="primary"
            :icon="String(scope.row.status) === '1' ? 'Unlock' : 'Lock'"
            @click="handleEnable(scope.row)"
          >
            {{ String(scope.row.status) === '1' ? '禁用' : '启用' }}
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

    <!-- 添加或修改商品分类对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="categoryRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>

        <el-form-item label="图标" prop="icon">
          <image-upload v-model="form.icon" :limit="1" />
        </el-form-item>

        <el-form-item label="父级分类" prop="parentId">
          <el-select
            v-model="form.parentId"
            placeholder="请选择父级分类"
            style="width: 100%"
          >
            <el-option
              v-for="item in categoryOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="排序值" prop="sort">
          <el-input v-model="form.sort" placeholder="请输入排序值" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in category_status"
              :key="dict.value"
              :label="dict.value"
            >
              {{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
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

<script setup name="Category">
import { getCurrentInstance, ref, reactive, toRefs } from "vue"
import { listCategory, getCategory, delCategory, addCategory, updateCategory, listCategoryTree } from "@/api/product/category"

const { proxy } = getCurrentInstance()
const { category_status } = proxy.useDict("category_status")

const categoryList = ref([])
const categoryOptions = ref([])

const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    parentId: null,
    status: "1",
  },
  rules: {
    name: [
      { required: true, message: "分类名称不能为空", trigger: "blur" }
    ],
    parentId: [
      { required: true, message: "请选择父级分类", trigger: "change" }
    ],
    status: [
      { required: true, message: "分类状态不能为空", trigger: "change" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 获取分类下拉选项 */
function getCategoryOptions() {
  listCategoryTree().then(response => {
    const list = response.data || response.rows || []
    categoryOptions.value = [
      { id: 0, name: "无" },
      ...list
    ]
  })
}

/** 根据 parentId 获取父分类名称 */
function getParentName(parentId) {
  if (String(parentId) === "0") {
    return "无"
  }
  const item = categoryOptions.value.find(item => String(item.id) === String(parentId))
  return item ? item.name : parentId
}

/** 查询商品分类列表 */
function getList() {
  loading.value = true
  listCategory(queryParams.value).then(response => {
    categoryList.value = response.rows
    total.value = response.total
    loading.value = false
  })
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
    name: null,
    icon: null,
    parentId: 0,
    sort: null,
    status: null,
    createTime: null,
    updateTime: null,
    createBy: null,
    updateBy: null
  }
  proxy.resetForm("categoryRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  queryParams.value.parentId = null
  handleQuery()
}

/** 启用禁用按钮操作 */
function handleEnable(row) {
  const params = {
    id: row.id,
    status: String(row.status) === "1" ? "0" : "1",
  }
  const msg = String(row.status) === "1" ? "禁用" : "启用"
  proxy.$modal.confirm(`是否确认${msg}该分类？`)
    .then(function () {
      return updateCategory(params)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess(`${msg}成功`)
    })
    .catch(() => {})
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加商品分类"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _id = row.id || ids.value
  getCategory(_id).then(response => {
    form.value = response.data
    if (form.value.parentId === null || form.value.parentId === undefined) {
      form.value.parentId = 0
    }
    form.value.status = String(form.value.status)
    open.value = true
    title.value = "修改商品分类"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["categoryRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateCategory(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addCategory(form.value).then(response => {
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
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除商品分类编号为"' + _ids + '"的数据项？').then(function() {
    return delCategory(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('product/category/export', {
    ...queryParams.value
  }, `category_${new Date().getTime()}.xlsx`)
}

getCategoryOptions()
getList()
</script>