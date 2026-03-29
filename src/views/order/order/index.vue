<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
      label-width="80px"
    >
      <el-form-item label="订单编号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单编号"
          clearable
          style="width: 220px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>

      <el-form-item label="用户ID" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户ID"
          clearable
          style="width: 220px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>

      <el-form-item label="订单状态" prop="orderStatus">
        <el-select
          v-model="queryParams.orderStatus"
          placeholder="请选择订单状态"
          clearable
          style="width: 220px"
        >
          <el-option
            v-for="dict in order_statis"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="支付状态" prop="payStatus">
        <el-select
          v-model="queryParams.payStatus"
          placeholder="请选择支付状态"
          clearable
          style="width: 220px"
        >
          <el-option
            v-for="dict in pay_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="支付方式" prop="payType">
        <el-select
          v-model="queryParams.payType"
          placeholder="请选择支付方式"
          clearable
          style="width: 220px"
        >
          <el-option
            v-for="dict in pay_type"
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
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="orderList" border>
      <el-table-column label="订单ID" align="center" prop="id" width="90" />
      <el-table-column label="订单编号" align="center" prop="orderNo" min-width="180" show-overflow-tooltip />
      <el-table-column label="用户ID" align="center" prop="userId" width="100" />
      <el-table-column label="商品摘要" align="center" prop="productSummary" min-width="220" show-overflow-tooltip />
      <el-table-column label="商品总数" align="center" prop="totalQuantity" width="100" />
      <el-table-column label="实付金额" align="center" prop="payAmount" width="120">
        <template #default="scope">
          <span>¥{{ scope.row.payAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="支付方式" align="center" prop="payType" width="100">
        <template #default="scope">
          <dict-tag :options="pay_type" :value="scope.row.payType" />
        </template>
      </el-table-column>
      <el-table-column label="支付状态" align="center" prop="payStatus" width="110">
        <template #default="scope">
          <dict-tag :options="pay_status" :value="scope.row.payStatus" />
        </template>
      </el-table-column>
      <el-table-column label="订单状态" align="center" prop="orderStatus" width="110">
        <template #default="scope">
          <dict-tag :options="order_statis" :value="scope.row.orderStatus" />
        </template>
      </el-table-column>
      <el-table-column label="收货人" align="center" prop="receiverName" width="100" />
      <el-table-column label="联系电话" align="center" prop="receiverPhone" width="130" />
      <el-table-column label="下单时间" align="center" prop="submitTime" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.submitTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="220">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleDetail(scope.row)">
            详情
          </el-button>
          <el-button
            link
            type="primary"
            icon="Van"
            :disabled="!canDelivery(scope.row)"
            @click="handleDelivery(scope.row)"
          >
            发货
          </el-button>
          <el-button
            link
            type="danger"
            icon="CircleClose"
            :disabled="!canClose(scope.row)"
            @click="handleClose(scope.row)"
          >
            关闭
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

    <!-- 详情弹窗 -->
    <el-dialog title="订单详情" v-model="detailOpen" width="1100px" append-to-body>
      <el-descriptions title="订单信息" :column="3" border>
        <el-descriptions-item label="订单ID">{{ detailForm.order.id }}</el-descriptions-item>
        <el-descriptions-item label="订单编号">{{ detailForm.order.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ detailForm.order.userId }}</el-descriptions-item>

        <el-descriptions-item label="订单状态">
          <dict-tag :options="order_statis" :value="detailForm.order.orderStatus" />
        </el-descriptions-item>
        <el-descriptions-item label="支付状态">
          <dict-tag :options="pay_status" :value="detailForm.order.payStatus" />
        </el-descriptions-item>
        <el-descriptions-item label="支付方式">
          <dict-tag :options="pay_type" :value="detailForm.order.payType" />
        </el-descriptions-item>

        <el-descriptions-item label="商品总金额">¥{{ detailForm.order.totalAmount }}</el-descriptions-item>
        <el-descriptions-item label="优惠金额">¥{{ detailForm.order.discountAmount }}</el-descriptions-item>
        <el-descriptions-item label="实付金额">¥{{ detailForm.order.payAmount }}</el-descriptions-item>

        <el-descriptions-item label="收货人">{{ detailForm.order.receiverName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ detailForm.order.receiverPhone }}</el-descriptions-item>
        <el-descriptions-item label="下单时间">
          {{ parseTime(detailForm.order.submitTime, '{y}-{m}-{d}') }}
        </el-descriptions-item>

        <el-descriptions-item label="收货地址" :span="3">
          {{
            (detailForm.order.receiverProvince || '') +
            (detailForm.order.receiverCity || '') +
            (detailForm.order.receiverDistrict || '') +
            (detailForm.order.receiverAddress || '')
          }}
        </el-descriptions-item>

        <el-descriptions-item label="买家留言" :span="3">
          {{ detailForm.order.buyerMessage || '无' }}
        </el-descriptions-item>
      </el-descriptions>

      <div class="section-title">订单商品</div>
      <el-table :data="detailForm.orderItemList" border>
        <el-table-column label="商品ID" align="center" prop="productId" width="100" />
        <el-table-column label="SKU ID" align="center" prop="skuId" width="100" />
        <el-table-column label="商品名称" align="center" prop="productName" min-width="180" show-overflow-tooltip />
        <el-table-column label="商品图片" align="center" prop="productImage" width="120">
          <template #default="scope">
            <image-preview :src="scope.row.productImage" :width="50" :height="50" />
          </template>
        </el-table-column>
        <el-table-column label="规格" align="center" prop="specData" min-width="180" show-overflow-tooltip />
        <el-table-column label="单价" align="center" prop="price" width="100">
          <template #default="scope">
            <span>¥{{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column label="数量" align="center" prop="quantity" width="80" />
        <el-table-column label="小计金额" align="center" prop="totalAmount" width="110">
          <template #default="scope">
            <span>¥{{ scope.row.totalAmount }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="section-title">支付信息</div>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="支付单号">{{ detailForm.orderPay.payNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="支付方式">
          <dict-tag :options="pay_type" :value="detailForm.orderPay.payType" />
        </el-descriptions-item>
        <el-descriptions-item label="支付状态">
          <dict-tag :options="pay_status" :value="detailForm.orderPay.payStatus" />
        </el-descriptions-item>

        <el-descriptions-item label="支付金额">¥{{ detailForm.orderPay.payAmount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="第三方流水号">{{ detailForm.orderPay.thirdTradeNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">
          {{ parseTime(detailForm.orderPay.payTime, '{y}-{m}-{d}') }}
        </el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailOpen = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Order">
import { listOrder, getOrder, deliveryOrder, closeOrder } from "@/api/order/order";

const { proxy } = getCurrentInstance();
const { order_statis, pay_status, pay_type } = proxy.useDict("order_statis", "pay_status", "pay_type");

const orderList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const detailOpen = ref(false);

const detailForm = reactive({
  order: {},
  orderItemList: [],
  orderPay: {}
});

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderNo: undefined,
    userId: undefined,
    orderStatus: undefined,
    payStatus: undefined,
    payType: undefined
  }
});

const { queryParams } = toRefs(data);

function getList() {
  loading.value = true;
  listOrder(queryParams.value).then(response => {
    orderList.value = response.rows || [];
    total.value = response.total || 0;
    loading.value = false;
  });
}

function resetDetail() {
  detailForm.order = {};
  detailForm.orderItemList = [];
  detailForm.orderPay = {};
}

function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

function handleDetail(row) {
  resetDetail();
  getOrder(row.id).then(response => {
    const data = response.data || {};
    detailForm.order = data.order || {};
    detailForm.orderItemList = data.orderItemList || [];
    detailForm.orderPay = data.orderPay || {};
    detailOpen.value = true;
  });
}

function handleDelivery(row) {
  proxy.$modal.confirm('确认将订单【' + row.orderNo + '】改为已发货吗？').then(() => {
    return deliveryOrder(row.id);
  }).then(() => {
    proxy.$modal.msgSuccess("发货成功");
    getList();
  }).catch(() => {});
}

function handleClose(row) {
  proxy.$modal.confirm('确认关闭订单【' + row.orderNo + '】吗？').then(() => {
    return closeOrder(row.id);
  }).then(() => {
    proxy.$modal.msgSuccess("关闭成功");
    getList();
  }).catch(() => {});
}

function canDelivery(row) {
  return String(row.orderStatus) === "1";
}

function canClose(row) {
  return String(row.orderStatus) === "0";
}

getList();
</script>

<style scoped>
.section-title {
  margin: 20px 0 10px;
  font-size: 15px;
  font-weight: 600;
}
</style>