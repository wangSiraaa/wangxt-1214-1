<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { DataTable } from 'primevue/datatable'
import { Column } from 'primevue/column'
import { InputText } from 'primevue/inputtext'
import { Button } from 'primevue/button'
import { Dropdown } from 'primevue/dropdown'
import { getSaleOrderList, confirmSaleOrder, shipSaleOrder, cancelSaleOrder, completeSaleOrder } from '@/api/sales'
import type { SaleOrder } from '@/api/sales'

const router = useRouter()

const orders = ref<SaleOrder[]>([])
const total = ref(0)
const loading = ref(false)

const searchParams = ref({
  page: 1,
  pageSize: 20,
  orderNo: '',
  customerName: '',
  status: '',
  cascadePurpose: '',
})

const statusOptions = [
  { label: '全部', value: '' },
  { label: '草稿', value: 'draft' },
  { label: '已确认', value: 'confirmed' },
  { label: '已发货', value: 'shipped' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
]

const purposeOptions = [
  { label: '全部', value: '' },
  { label: '储能电站', value: 'energy_storage' },
  { label: '低速电动车', value: 'low_speed_ev' },
  { label: '基站备电', value: 'communication_base' },
  { label: 'UPS电源', value: 'ups' },
  { label: '太阳能路灯', value: 'solar_street_lamp' },
  { label: '其他', value: 'other' },
]

onMounted(() => {
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    const res: any = await getSaleOrderList(searchParams.value)
    orders.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('Failed to load orders:', error)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  searchParams.value.page = 1
  loadData()
}

function handleReset() {
  searchParams.value = {
    page: 1,
    pageSize: 20,
    orderNo: '',
    customerName: '',
    status: '',
    cascadePurpose: '',
  }
  loadData()
}

function onPageChange(event: any) {
  searchParams.value.page = event.page + 1
  searchParams.value.pageSize = event.rows
  loadData()
}

function goToCreate() {
  router.push('/sales/create')
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: '草稿',
    confirmed: '已确认',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消',
  }
  return map[status] || status
}

function getStatusClass(status: string): string {
  const classMap: Record<string, string> = {
    draft: 'status-tag status-inspecting',
    confirmed: 'status-tag status-qualified',
    shipped: 'status-tag status-shipped',
    completed: 'status-tag status-sold',
    cancelled: 'status-tag status-unqualified',
  }
  return classMap[status] || 'status-tag'
}

function getPurposeLabel(purpose: string): string {
  const map: Record<string, string> = {
    energy_storage: '储能电站',
    low_speed_ev: '低速电动车',
    communication_base: '基站备电',
    ups: 'UPS电源',
    solar_street_lamp: '太阳能路灯',
    other: '其他',
  }
  return map[purpose] || purpose
}

function formatDate(date: any): string {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

async function handleConfirm(id: string) {
  if (!confirm('确定要确认此销售订单吗？确认后电池包检测结论将被锁定。')) return
  try {
    await confirmSaleOrder(id)
    alert('确认成功')
    loadData()
  } catch (error: any) {
    alert(error?.response?.data?.message || '操作失败')
  }
}

async function handleShip(id: string) {
  if (!confirm('确定要发货吗？')) return
  try {
    await shipSaleOrder(id)
    alert('发货成功')
    loadData()
  } catch (error: any) {
    alert(error?.response?.data?.message || '操作失败')
  }
}

async function handleComplete(id: string) {
  if (!confirm('确定要完成此订单吗？')) return
  try {
    await completeSaleOrder(id)
    alert('完成成功')
    loadData()
  } catch (error: any) {
    alert(error?.response?.data?.message || '操作失败')
  }
}

async function handleCancel(id: string) {
  if (!confirm('确定要取消此订单吗？')) return
  try {
    await cancelSaleOrder(id)
    alert('取消成功')
    loadData()
  } catch (error: any) {
    alert(error?.response?.data?.message || '操作失败')
  }
}
</script>

<template>
  <div class="page-card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
      <div class="section-title">梯次销售</div>
      <Button label="新建销售" icon="pi pi-plus" @click="goToCreate" />
    </div>

    <div class="filter-bar">
      <div>
        <label style="display: block; font-size: 12px; color: #64748b; margin-bottom: 4px">订单编号</label>
        <InputText v-model="searchParams.orderNo" placeholder="请输入" @keyup.enter="handleSearch" />
      </div>
      <div>
        <label style="display: block; font-size: 12px; color: #64748b; margin-bottom: 4px">客户名称</label>
        <InputText v-model="searchParams.customerName" placeholder="请输入" @keyup.enter="handleSearch" />
      </div>
      <div>
        <label style="display: block; font-size: 12px; color: #64748b; margin-bottom: 4px">状态</label>
        <Dropdown v-model="searchParams.status" :options="statusOptions" optionLabel="label" optionValue="value" style="min-width: 120px" />
      </div>
      <div>
        <label style="display: block; font-size: 12px; color: #64748b; margin-bottom: 4px">梯次用途</label>
        <Dropdown v-model="searchParams.cascadePurpose" :options="purposeOptions" optionLabel="label" optionValue="value" style="min-width: 140px" />
      </div>
      <div style="display: flex; gap: 8px">
        <Button label="查询" icon="pi pi-search" @click="handleSearch" />
        <Button label="重置" icon="pi pi-refresh" class="p-button-secondary" @click="handleReset" />
      </div>
    </div>

    <DataTable
      :value="orders"
      :paginator="true"
      :rows="searchParams.pageSize"
      :totalRecords="total"
      :loading="loading"
      (onPage)="onPageChange($event)"
      :lazy="true"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[10, 20, 50, 100]"
      currentPageReportTemplate="共 {totalRecords} 条记录"
    >
      <Column field="orderNo" header="订单编号" style="width: 160px"></Column>
      <Column field="customerName" header="客户名称" style="width: 140px"></Column>
      <Column header="梯次用途" style="width: 120px">
        <template #body="slotProps">
          {{ getPurposeLabel(slotProps.data.cascadePurpose) }}
        </template>
      </Column>
      <Column field="totalQuantity" header="数量" style="width: 80px"></Column>
      <Column field="salesPerson" header="销售人员" style="width: 100px"></Column>
      <Column header="状态" style="width: 100px">
        <template #body="slotProps">
          <span :class="getStatusClass(slotProps.data.status)">
            {{ getStatusLabel(slotProps.data.status) }}
          </span>
        </template>
      </Column>
      <Column header="创建时间" style="width: 160px">
        <template #body="slotProps">
          {{ formatDate(slotProps.data.createdAt) }}
        </template>
      </Column>
      <Column header="操作" style="width: 200px">
        <template #body="slotProps">
          <div style="display: flex; gap: 6px; flex-wrap: wrap">
            <Button
              v-if="slotProps.data.status === 'draft'"
              size="small"
              label="确认"
              class="p-button-success"
              @click="handleConfirm(slotProps.data._id)"
            />
            <Button
              v-if="slotProps.data.status === 'confirmed'"
              size="small"
              label="发货"
              class="p-button-info"
              @click="handleShip(slotProps.data._id)"
            />
            <Button
              v-if="slotProps.data.status === 'shipped'"
              size="small"
              label="完成"
              class="p-button-success"
              @click="handleComplete(slotProps.data._id)"
            />
            <Button
              v-if="slotProps.data.status !== 'completed' && slotProps.data.status !== 'cancelled'"
              size="small"
              label="取消"
              class="p-button-danger"
              @click="handleCancel(slotProps.data._id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
