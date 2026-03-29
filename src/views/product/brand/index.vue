<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="品牌名称" prop="brandName">
        <el-input
          v-model="queryParams.brandName"
          placeholder="请输入品牌名称"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in brand_status"
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

    <!-- 工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['hxmall:brand:add']"
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
          v-hasPermi="['hxmall:brand:edit']"
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
          v-hasPermi="['hxmall:brand:remove']"
        >
          删除
        </el-button>
      </el-col>

      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <!-- 表格 -->
    <el-table
      v-loading="loading"
      :data="brandList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="品牌ID" align="center" prop="id" width="100" />
      <el-table-column label="品牌名称" align="center" prop="brandName" min-width="140" />

      <el-table-column label="品牌Logo" align="center" prop="brandLogo" width="120">
        <template #default="scope">
          <image-preview
            v-if="scope.row.brandLogo"
            :src="scope.row.brandLogo"
            :width="50"
            :height="50"
          />
          <span v-else>暂无Logo</span>
        </template>
      </el-table-column>

      <el-table-column label="品牌描述" align="center" prop="brandDesc" min-width="180" show-overflow-tooltip />
      <el-table-column label="排序" align="center" prop="sort" width="80" />

      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">{{
            scope.row.status === 1 ? "启用" : "禁用"
            }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>

      <el-table-column label="修改时间" align="center" prop="updateTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>

      <el-table-column label="创建人" align="center" prop="createBy" width="100" />
      <el-table-column label="修改人" align="center" prop="updateBy" width="100" />

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="160">
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['hxmall:brand:edit']"
          >
            修改
          </el-button>
          <el-button
            link
            type="primary"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['hxmall:brand:remove']"
          >
            删除
          </el-button>
          <el-button link type="primary" :icon="scope.row.status === 1 ? 'Unlock' : 'Lock'"
            @click="handleEnable(scope.row)">{{ scope.row.status === 1 ? "禁用" : "启用" }}</el-button>
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

    <!-- 添加或修改品牌对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="brandRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="品牌名称" prop="brandName">
          <el-input v-model="form.brandName" placeholder="请输入品牌名称" />
        </el-form-item>

        <el-form-item label="品牌Logo" prop="brandLogo">
          <image-upload v-model="form.brandLogo" :limit="1" />
        </el-form-item>

        <el-form-item label="品牌描述" prop="brandDesc">
          <el-input
            v-model="form.brandDesc"
            type="textarea"
            :rows="3"
            placeholder="请输入品牌描述"
          />
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" controls-position="right" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in brand_status"
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

<script setup name="Brand">
import { ref, reactive, toRefs, getCurrentInstance } from "vue"
import { listBrand, getBrand, delBrand, addBrand, updateBrand } from "@/api/product/brand"

const { proxy } = getCurrentInstance()
const { brand_status } = proxy.useDict("brand_status")

const brandList = ref([])
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
    brandName: null,
    status: null
  },
  rules: {
    brandName: [
      { required: true, message: "品牌名称不能为空", trigger: "blur" }
    ],
    sort: [
      { required: true, message: "排序不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询品牌列表 */
function getList() {
  loading.value = true
  listBrand(queryParams.value).then(response => {
    brandList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/** 表单重置 */
function reset() {
  form.value = {
    id: null,
    brandName: null,
    brandLogo: null,
    brandDesc: null,
    sort: 0,
    status: "1",
    createTime: null,
    updateTime: null,
    createBy: null,
    updateBy: null
  }
  proxy.resetForm("brandRef")
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
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

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = selection.length === 0
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加商品品牌"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _id = row?.id || ids.value[0]
  getBrand(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改商品品牌"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["brandRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateBrand(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addBrand(form.value).then(() => {
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
  proxy.$modal.confirm('是否确认删除商品品牌编号为"' + _ids + '"的数据项？').then(function () {
    return delBrand(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 启用禁用按钮操作 */
function handleEnable(row) {
  const params = {
    id: row.id,
    status: row.status === 1 ? 0 : 1,
  };
  const msg = row.status === 1 ? "禁用" : "启用";
  proxy.$modal
    .confirm(`是否确认${msg}这条项目？`)
    .then(function () {
      return updateBrand(params);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess(`${msg}成功`);
    })
    .catch(() => { });
}

getList()
</script>