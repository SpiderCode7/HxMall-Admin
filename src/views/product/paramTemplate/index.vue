<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="模板名称" prop="templateName">
        <el-input
          v-model="queryParams.templateName"
          placeholder="请输入模板名称"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>

      <el-form-item label="商品分类" prop="categoryId">
        <el-tree-select
          v-model="queryParams.categoryId"
          :data="categoryOptions"
          :props="{ value: 'id', label: 'name', children: 'children' }"
          value-key="id"
          placeholder="请选择商品分类"
          check-strictly
          clearable
          style="width: 200px"
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
          v-hasPermi="['product:paramTemplate:add']"
        >新增</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="templateList">
      <el-table-column label="模板ID" align="center" prop="id" width="100" />
      <el-table-column label="模板名称" align="center" prop="templateName" min-width="180" />
      <el-table-column label="商品分类ID" align="center" prop="categoryId" width="120" />
      <el-table-column label="备注" align="center" prop="remark" min-width="180" show-overflow-tooltip />
      <el-table-column label="排序" align="center" prop="sort" width="80" />
      <el-table-column label="创建人" align="center" prop="createBy" width="120" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改人" align="center" prop="updateBy" width="120" />
      <el-table-column label="修改时间" align="center" prop="updateTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width" fixed="right">
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['product:paramTemplate:edit']"
          >修改</el-button>
          <el-button
            link
            type="primary"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['product:paramTemplate:remove']"
          >删除</el-button>
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

    <!-- 添加或修改参数模板对话框 -->
    <el-dialog :title="title" v-model="open" width="1100px" append-to-body>
      <el-form ref="templateRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="模板名称" prop="templateName">
              <el-input v-model="form.templateName" placeholder="请输入模板名称" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="商品分类" prop="categoryId">
              <el-tree-select
                v-model="form.categoryId"
                :data="categoryOptions"
                :props="{ value: 'id', label: 'name', children: 'children' }"
                value-key="id"
                placeholder="请选择商品分类"
                check-strictly
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" controls-position="right" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">参数项配置</el-divider>

        <div style="margin-bottom: 12px">
          <el-button type="primary" plain icon="Plus" @click="handleAddItem">新增参数项</el-button>
        </div>

        <el-table :data="form.paramTemplateItemList" border>
          <el-table-column label="参数名称" align="center" min-width="150">
            <template #default="scope">
              <el-input v-model="scope.row.paramName" placeholder="请输入参数名称" />
            </template>
          </el-table-column>

          <el-table-column label="输入类型" align="center" width="140">
            <template #default="scope">
              <el-select v-model="scope.row.inputType" placeholder="请选择" style="width: 100%">
                <el-option
                  v-for="dict in param_input_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </template>
          </el-table-column>

          <el-table-column label="可选值" align="center" min-width="220">
            <template #default="scope">
              <el-input
                v-model="scope.row.optionsValue"
                placeholder="多个值用英文逗号分隔，如：红色,蓝色,黑色"
              />
            </template>
          </el-table-column>

          <el-table-column label="是否必填" align="center" width="120">
            <template #default="scope">
              <el-select v-model="scope.row.isRequired" placeholder="请选择" style="width: 100%">
                <el-option
                  v-for="dict in paraitem_yes_no"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </template>
          </el-table-column>

          <el-table-column label="排序" align="center" width="100">
            <template #default="scope">
              <el-input-number v-model="scope.row.sort" :min="0" controls-position="right" style="width: 80px" />
            </template>
          </el-table-column>

          <el-table-column label="状态" align="center" width="120">
            <template #default="scope">
              <el-select v-model="scope.row.status" placeholder="请选择" style="width: 100%">
                <el-option
                  v-for="dict in param_item_status"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </template>
          </el-table-column>

          <el-table-column label="操作" align="center" width="100" fixed="right">
            <template #default="scope">
              <el-button link type="danger" icon="Delete" @click="handleDeleteItem(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
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

<script setup name="ParamTemplate">
import {
  listParamTemplate,
  getParamTemplate,
  addParamTemplate,
  updateParamTemplate,
  delParamTemplate
} from "@/api/product/paramTemplate"

import { listCategoryTree } from "@/api/product/category"

const { proxy } = getCurrentInstance()
const { sys_normal_disable, paraitem_yes_no, param_input_type,param_item_status } = proxy.useDict(
  "sys_normal_disable",
  "paraitem_yes_no",
  "param_input_type",
  "param_item_status"
)

const templateList = ref([])
const categoryOptions = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const title = ref("")
const total = ref(0)

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    templateName: undefined,
    categoryId: undefined
  },
  rules: {
    templateName: [{ required: true, message: "模板名称不能为空", trigger: "blur" }],
    categoryId: [{ required: true, message: "商品分类不能为空", trigger: "change" }],
    sort: [{ required: true, message: "排序不能为空", trigger: "blur" }]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询分类树 */
function getCategoryTree() {
  listCategoryTree().then(response => {
    categoryOptions.value = response.data || []
  })
}

/** 查询参数模板列表 */
function getList() {
  loading.value = true
  listParamTemplate(queryParams.value).then(response => {
    templateList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    id: undefined,
    templateName: undefined,
    categoryId: undefined,
    remark: undefined,
    sort: 0,
    paramTemplateItemList: []
  }
  proxy.resetForm("templateRef")
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

/** 新增模板 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加参数模板"
}

/** 修改模板 */
function handleUpdate(row) {
  reset()
  getParamTemplate(row.id).then(response => {
    form.value = {
      ...response.data,
      paramTemplateItemList: response.data.paramTemplateItemList || []
    }
    open.value = true
    title.value = "修改参数模板"
  })
}

/** 删除模板 */
function handleDelete(row) {
  proxy.$modal.confirm('是否确认删除参数模板名称为"' + row.templateName + '"的数据项？').then(function () {
    return delParamTemplate(row.id)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 新增参数项 */
function handleAddItem() {
  form.value.paramTemplateItemList.push({
    id: undefined,
    templateId: form.value.id,
    paramName: undefined,
    inputType: "请选择",
    optionsValue: undefined,
    isRequired: "1",
    sort: 0,
    status: "1"
  })
}

/** 删除参数项 */
function handleDeleteItem(index) {
  form.value.paramTemplateItemList.splice(index, 1)
}

/** 提交按钮 */
function submitForm() {
  if (!form.value.paramTemplateItemList || form.value.paramTemplateItemList.length === 0) {
    proxy.$modal.msgError("请至少添加一个参数项")
    return
  }

  const invalidItem = form.value.paramTemplateItemList.find(item => !item.paramName || !item.inputType)
  if (invalidItem) {
    proxy.$modal.msgError("参数项中的参数名称和输入类型不能为空")
    return
  }

  proxy.$refs["templateRef"].validate(valid => {
    if (valid) {
      if (form.value.id != undefined) {
        updateParamTemplate(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addParamTemplate(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

getCategoryTree()
getList()
</script>