
<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" :icon="CirclePlus" @click="dialogVisible = true">新增订单</el-button>
        </div>
        <div>
          <el-tooltip content="下载">
            <el-button type="primary" :icon="Download" circle />
          </el-tooltip>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" :icon="RefreshRight" circle @click="queryAllOrders()" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="tableData">
          <el-table-column prop="order_id" label="订单ID" align="center" />
          <el-table-column prop="order_type" label="订单类型" align="center">
            <template #default="scope">
              <el-tag type="primary" effect="plain">{{ scope.row.order_type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="order_status" label="订单状态" align="center">
            <template #default="scope">
              {{scope.row.order_status}}
            </template>
          </el-table-column>
          <el-table-column prop="order_date" label="创建时间" align="center" />
          <el-table-column fixed="right" label="操作" width="200" align="center">
            <template #default="scope">
              <el-button type="primary" text bg size="small" @click="startCooking(scope.row)">开始制作</el-button>
              <el-button type="default" text bg size="small" @click="completeCooking(scope.row)">制作完成</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 新增/修改 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formData.id === undefined ? '创建订单' : '修改用户'"
      @closed="resetForm"
      width="30%"
    >
      <el-form ref="formRef" :model="formData" label-width="100px" label-position="left" class="form-container">
        <el-form-item prop="orderType" label="购买方式：">
          <el-radio-group v-model="formData.orderType">
            <el-radio value="onspot">门店购买</el-radio>
            <el-radio value="online">在线购买</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="selected_drinks" label="饮品选择：">
          <el-card v-for="(drink) in allDrinks" :key="drink.drink_id" @click="drink.selected = !drink.selected;" :class="{ 'selected': drink.selected }">
            <label>{{ drink.drink_name }}</label>
            <div>
              <img :src="drink.img" width="30px" height="40px">
            </div>
            <span>{{ drink.price }}元</span>
          </el-card>
        </el-form-item>
        <el-form-item prop="orderTotalAmount" label="订单总价：">
          <el-input v-model="formData.orderTotalAmount" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateOrUpdate" :loading="loading">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import { createTableDataApi, deleteTableDataApi, updateTableDataApi, getTableDataApi } from "@/api/table"
import { type CreateOrUpdateTableRequestData, type TableData } from "@/api/table/types/table"
import { type FormInstance, type FormRules, ElMessage, ElMessageBox } from "element-plus"
import { Search, Refresh, CirclePlus, Delete, Download, RefreshRight } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import { cloneDeep } from "lodash-es"
import IpcDict from "@/constants/ipc-dict"
import { onMounted, onUnmounted } from "vue"
import { OrderModel, OrderStatus } from "@/models/dtos/OrderModel"
import dayjs from "dayjs"

defineOptions({
  // 命名当前组件
  name: "ElementPlus"
})

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//#region 增
const DEFAULT_FORM_DATA: any = {
  orderType: 0,
  orderTotalAmount: 0,
  selected_drinks: []
}
const dialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const formData = ref<any>(cloneDeep(DEFAULT_FORM_DATA))
const resetForm = () => {
  formRef.value?.clearValidate()
  formData.value = cloneDeep(DEFAULT_FORM_DATA)
}
const tableData = ref<TableData[]>([])

/* 查询所有订单 */
const queryAllOrders = () => {
  loading.value = true
  // 查询所有订单
  window.vIpcRenderer.send(IpcDict.CODE_ORDER_QUERY);
}
const queryAllOrdersCallbackFn = (event, orderList) => {
  loading.value = false
  tableData.value = orderList;
};
/* 查询所有订单 */

/* 所有饮品 */
const allDrinks = ref<Array<any>>([]);
const retrieveAllDrinks = () => {
  window.vIpcRenderer.send(IpcDict.CODE_DRINKS_QUERY);
};
const retrieveAllDrinksCallbackFn = (result, rows) => {
  allDrinks.value = rows || [];
};
/* 所有饮品 */

/* 创建订单 */
const handleCreateOrUpdate = () => {
  const allSelected: any = [];
  debugger
  let total = 0;
  allDrinks.value.forEach((drink) => {
    if (drink.selected) {
      allSelected.push({
        drink_id: drink.drink_id,
        drink_name: drink.drink_name,
        price: drink.price
      });
      total += drink.price;
    }
  });
  const order = new OrderModel(null, null, null, 0);
  order.orderType = formData.value.orderType;
  order.orderStatus = OrderStatus.PENDING;
  order.orderTotalAmount = formData.value.orderTotalAmount;
  order.orderDate = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss");
  window.vIpcRenderer.send(IpcDict.CODE_CREATE_ORDER_WITH_DRINKS, order, allSelected);
}
const handleCreateOrUpdateCallbackFn = () => {
  ElMessage.success("操作成功")
  dialogVisible.value = false
};
/* 创建订单 */

/* 开始制作 */
const startCooking = (orderDetail) => {
  debugger
  loading.value = true
  window.vIpcRenderer.send(IpcDict.CODE_START_COOKING_WITH_DRINKS, orderDetail.order_id);
};
const startCookingCallbackFn = (event: any, orderDetail: OrderModel) => {
  debugger
  loading.value = false
  queryAllOrders();
};
/* 开始制作 */

/* 结束制作 */
const completeCooking = (orderDetail) => {
  debugger
  loading.value = true
  window.vIpcRenderer.send(IpcDict.CODE_COMPLETE_COOKING_WITH_DRINKS, orderDetail.order_id);
};
const completeCookingCallbackFn = (event, orderDetail: OrderModel) => {
  debugger
  loading.value = false
  queryAllOrders();
};
/* 结束制作 */

onMounted(() => {
  retrieveAllDrinks();
  queryAllOrders();
  // on查询所有订单
  window.vIpcRenderer.on(IpcDict.CODE_ORDER_QUERY, queryAllOrdersCallbackFn)
  // on查询所有饮品
  window.vIpcRenderer.on(IpcDict.CODE_DRINKS_QUERY, retrieveAllDrinksCallbackFn)
  // on创建订单
  window.vIpcRenderer.on(IpcDict.CODE_CREATE_ORDER_WITH_DRINKS, handleCreateOrUpdateCallbackFn)
  // 开始制作
  window.vIpcRenderer.on(IpcDict.CODE_START_COOKING_WITH_DRINKS, startCookingCallbackFn)
  // 完成制作
  window.vIpcRenderer.on(IpcDict.CODE_COMPLETE_COOKING_WITH_DRINKS, completeCookingCallbackFn)
});
onUnmounted(() => {
  // off查询所有订单
  window.vIpcRenderer.off(IpcDict.CODE_ORDER_QUERY, queryAllOrdersCallbackFn)
  // off查询所有饮品
  window.vIpcRenderer.off(IpcDict.CODE_DRINKS_QUERY, retrieveAllDrinksCallbackFn)
  // off创建订单
  window.vIpcRenderer.off(IpcDict.CODE_CREATE_ORDER_WITH_DRINKS, handleCreateOrUpdateCallbackFn)
  // 开始制作
  window.vIpcRenderer.off(IpcDict.CODE_START_COOKING_WITH_DRINKS, startCookingCallbackFn)
  // 完成制作
  window.vIpcRenderer.off(IpcDict.CODE_COMPLETE_COOKING_WITH_DRINKS, completeCookingCallbackFn)
})
</script>
<style lang="scss" scoped>
.search-wrapper {
  margin-bottom: 20px;
  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}

.form-container {
  .selected {
    border: 1px solid red;
  }
  .el-card {
    margin-left: 10px;
    &:first-child {
      margin-left: 0;
    }
  }
}
</style>
