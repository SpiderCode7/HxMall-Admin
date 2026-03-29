<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="名称" prop="title">
        <el-input v-model="queryParams.title" placeholder="请输入名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" clearable placeholder="请选择" style="width: 240px">
          <el-option v-for="item in banner_status" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
        <!-- <el-input
          v-model="queryParams.title"
          placeholder="请输入轮播图名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item> -->
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
          v-hasPermi="['marketing:banner:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['marketing:banner:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['marketing:banner:remove']"
        >删除</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['marketing:banner:export']"
        >导出</el-button>
      </el-col> -->
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="bannerList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键ID" align="center" prop="id" />
      <el-table-column label="图片" align="center" prop="imgUrl" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.imgUrl" :width="50" :height="50" />
        </template>
      </el-table-column>
      <el-table-column label="轮播图名称" align="center" prop="title" />
      <el-table-column label="跳转类型" align="center" prop="type">
        <template #default="scope">
          <dict-tag :options="banner_type" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="120">
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
      <el-table-column label="创建人" align="center" prop="createBy" />
      <el-table-column label="修改人" align="center" prop="updateBy" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" min-width="120">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['marketing:banner:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['marketing:banner:remove']">删除</el-button>
          <el-button link type="primary" :icon="scope.row.status === 1 ? 'Unlock' : 'Lock'"
            @click="handleEnable(scope.row)">{{ scope.row.status === 1 ? "禁用" : "启用" }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

<!-- 添加或修改Banner轮播图对话框 -->
<el-dialog :title="title" v-model="open" width="500px" append-to-body>
  <el-form ref="bannerRef" :model="form" :rules="rules" label-width="80px">
    <el-form-item label="名称" prop="title">
      <el-input v-model="form.title" placeholder="请输入轮播图名称" />
    </el-form-item>

    <el-form-item label="图片" prop="imgUrl">
      <image-upload v-model="form.imgUrl" />
    </el-form-item>

    <!-- 新增：跳转类型 -->
    <el-form-item label="跳转类型" prop="type">
      <el-select
        v-model="form.type"
        placeholder="请选择跳转类型"
        clearable
        style="width: 100%"
        @change="handleTypeChange"
      >
        <el-option
          v-for="dict in banner_type"
          :key="dict.value"
          :label="dict.label"
          :value="dict.value"
        />
      </el-select>
    </el-form-item>

    <!-- 只有不是“无跳转”时才显示 -->
    <el-form-item
      label="跳转地址"
      prop="hrefUrl"
      v-if="form.type !== '0'"
    >
      <el-input v-model="form.hrefUrl" placeholder="请输入点击跳转地址" />
    </el-form-item>

    <el-form-item label="排序" prop="sort">
      <el-input-number
        v-model="form.sort"
        :min="0"
        controls-position="right"
        style="width: 100px"
      />
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

<script setup name="Banner">
import { listBanner, getBanner, delBanner, addBanner, updateBanner } from "@/api/marketing/banner"

const { proxy } = getCurrentInstance()

const bannerList = ref([])
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
    title: null,
    status: null,
  },
  rules: {
    imgUrl: [
      { required: true, message: "轮播图片不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "状态：0禁用 1启用不能为空", trigger: "change" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询Banner轮播图列表 */
function getList() {
  loading.value = true
  listBanner(queryParams.value).then(response => {
    bannerList.value = response.rows
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
    title: null,
    imgUrl: null,
    hrefUrl: null,
    type: null,
    sort: null,
    status: null,
    createTime: null,
    updateTime: null,
    createBy: null,
    updateBy: null
  }
  proxy.resetForm("bannerRef")
}

// banner状态字典数据
const { banner_status } = proxy.useDict("banner_status");
// type字典数据
const { banner_type } = proxy.useDict("banner_type");


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
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加Banner轮播图"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _id = row.id || ids.value
  getBanner(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改Banner轮播图"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["bannerRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateBanner(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addBanner(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除Banner轮播图编号为"' + _ids + '"的数据项？').then(function() {
    return delBanner(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/banner/export', {
    ...queryParams.value
  }, `banner_${new Date().getTime()}.xlsx`)
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
      return updateBanner(params);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess(`${msg}成功`);
    })
    .catch(() => { });
}

getList()
</script>