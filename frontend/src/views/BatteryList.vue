<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { DataTable } from 'primevue/datatable'
import { Column } from 'primevue/column'
import { InputText } from 'primevue/inputtext'
import { Button } from 'primevue/button'
import { Dropdown } from 'primevue/dropdown'
import { getBatteryList } from '@/api/battery'
import type { Battery } from '@/api/battery'

const router = useRouter()

const batteries = ref<Battery[]>([])
const total = ref(0)
const loading = ref(false)

const searchParams = ref({
  page: 1,
  pageSize: 20,
  batteryCode: '',
  vin: '',
  status: '',
  safetyLevel: '',
})

const statusOptions = [
  { label: '全部', value: '' },
  { label: '已登记', value: 'registered' },
  { label: '检测中', value: 'inspecting' },
  { label: '检测合格', value: 'qualified' },
  { label: '检测不合格', value: 'unqualified' },
  { label: '待销售', value: 'for_sale' },
  { label: '已销售', value: 'sold' },
  { label: '已发货', value: 'shipped' },
  { label: '拆解中', value: 'disassembling' },
]

const safetyLevelOptions = [
  { label: '全部', value: '' },
  { label: 'A级', value: 'A' },
  { label: 'B级', value: 'B' },
  { label: 'C级', value: 'C' },
  { label: 'D级', value: 'D' },
]

onMounted(() => {
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    const res: any = await getBatteryList(searchParams.value)
    batteries.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('Failed to load batteries:', error)
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
    batteryCode: '',
    vin: '',
    status: '',
    safetyLevel: '',
  }
  loadData()
}

function onPageChange(event: any) {
  searchParams.value.page = event.page + 1
  searchParams.value.pageSize = event.rows
  loadData()
}

function goToRegister() {
  router.push('/battery/register')
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    registered: '已登记',
    inspecting: '检测中',
    qualified: '检测合格',
    unqualified: '检测不合格',
    for_sale: '待销售',
    sold: '已销售',
    shipped: '已发货',
    disassembling: '拆解中',
  }
  return map[status] || status
}

function getStatusClass(status: string): string {
  return `status-tag status-${status}`
}

function formatDate(date: any): string {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="page-card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
      <div class="section-title">电池包管理</div>
      <Button label="新增登记" icon="pi pi-plus" @click="goToRegister" />
    </div>

    <div class="filter-bar">
      <div>
        <label style="display: block; font-size: 12px; color: #64748b; margin-bottom: 4px">电池包编号</label>
        <InputText v-model="searchParams.batteryCode" placeholder="请输入" @keyup.enter="handleSearch" />
      </div>
      <div>
        <label style="display: block; font-size: 12px; color: #64748b; margin-bottom: 4px">VIN码</label>
        <InputText v-model="searchParams.vin" placeholder="请输入" @keyup.enter="handleSearch" />
      </div>
      <div>
        <label style="display: block; font-size: 12px; color: #64748b; margin-bottom: 4px">状态</label>
        <Dropdown v-model="searchParams.status" :options="statusOptions" optionLabel="label" optionValue="value" style="min-width: 150px" />
      </div>
      <div>
        <label style="display: block; font-size: 12px; color: #64748b; margin-bottom: 4px">安全等级</label>
        <Dropdown v-model="searchParams.safetyLevel" :options="safetyLevelOptions" optionLabel="label" optionValue="value" style="min-width: 120px" />
      </div>
      <div style="display: flex; gap: 8px">
        <Button label="查询" icon="pi pi-search" @click="handleSearch" />
        <Button label="重置" icon="pi pi-refresh" class="p-button-secondary" @click="handleReset" />
      </div>
    </div>

    <DataTable
      :value="batteries"
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
      <Column field="batteryCode" header="电池包编号" style="width: 140px"></Column>
      <Column field="vin" header="VIN码" style="width: 180px"></Column>
      <Column field="vehiclePlate" header="车牌号" style="width: 100px"></Column>
      <Column header="状态" style="width: 100px">
        <template #body="slotProps">
          <span :class="getStatusClass(slotProps.data.status)">
            {{ getStatusLabel(slotProps.data.status) }}
          </span>
        </template>
      </Column>
      <Column header="安全等级" style="width: 80px">
        <template #body="slotProps">
          <span v-if="slotProps.data.safetyLevel">{{ slotProps.data.safetyLevel }}级</span>
          <span v-else style="color: #94a3b8">-</span>
        </template>
      </Column>
      <Column field="capacity" header="容量(Ah)" style="width: 100px">
        <template #body="slotProps">
          <span v-if="slotProps.data.capacity">{{ slotProps.data.capacity }}</span>
          <span v-else style="color: #94a3b8">-</span>
        </template>
      </Column>
      <Column field="internalResistance" header="内阻(mΩ)" style="width: 100px">
        <template #body="slotProps">
          <span v-if="slotProps.data.internalResistance">{{ slotProps.data.internalResistance }}</span>
          <span v-else style="color: #94a3b8">-</span>
        </template>
      </Column>
      <Column field="receiver" header="收货员" style="width: 100px"></Column>
      <Column header="收货日期" style="width: 160px">
        <template #body="slotProps">
          {{ formatDate(slotProps.data.receiveDate) }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>
