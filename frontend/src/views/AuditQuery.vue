<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { TabView, TabPanel } from 'primevue/tabview'
import { DataTable } from 'primevue/datatable'
import { Column } from 'primevue/column'
import { InputText } from 'primevue/inputtext'
import { Button } from 'primevue/button'
import { Dropdown } from 'primevue/dropdown'
import { getBatteryAuditList, getFlowEventAuditList } from '@/api/flow'

const activeIndex = ref(0)

const batteryList = ref<any[]>([])
const batteryTotal = ref(0)
const batteryLoading = ref(false)
const batterySearch = ref({
  page: 1,
  pageSize: 20,
  batteryCode: '',
  status: '',
  safetyLevel: '',
  vin: '',
})

const eventList = ref<any[]>([])
const eventTotal = ref(0)
const eventLoading = ref(false)
const eventSearch = ref({
  page: 1,
  pageSize: 20,
  batteryCode: '',
  eventType: '',
  operator: '',
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
]

const safetyLevelOptions = [
  { label: '全部', value: '' },
  { label: 'A级', value: 'A' },
  { label: 'B级', value: 'B' },
  { label: 'C级', value: 'C' },
  { label: 'D级', value: 'D' },
]

const eventTypeOptions = [
  { label: '全部', value: '' },
  { label: '入厂登记', value: 'register' },
  { label: '检测完成', value: 'inspection_complete' },
  { label: '检测合格', value: 'qualified' },
  { label: '检测不合格', value: 'unqualified' },
  { label: '已销售', value: 'sold' },
  { label: '已发货', value: 'shipped' },
  { label: '信息修改', value: 'modify' },
]

onMounted(() => {
  loadBatteryAudit()
})

function onTabChange(event: any) {
  if (event.index === 0) {
    loadBatteryAudit()
  } else {
    loadEventAudit()
  }
}

async function loadBatteryAudit() {
  batteryLoading.value = true
  try {
    const res: any = await getBatteryAuditList(batterySearch.value)
    batteryList.value = res.data.list
    batteryTotal.value = res.data.total
  } catch (error) {
    console.error('Failed to load battery audit:', error)
  } finally {
    batteryLoading.value = false
  }
}

async function loadEventAudit() {
  eventLoading.value = true
  try {
    const res: any = await getFlowEventAuditList(eventSearch.value)
    eventList.value = res.data.list
    eventTotal.value = res.data.total
  } catch (error) {
    console.error('Failed to load event audit:', error)
  } finally {
    eventLoading.value = false
  }
}

function handleBatterySearch() {
  batterySearch.value.page = 1
  loadBatteryAudit()
}

function handleBatteryReset() {
  batterySearch.value = {
    page: 1,
    pageSize: 20,
    batteryCode: '',
    status: '',
    safetyLevel: '',
    vin: '',
  }
  loadBatteryAudit()
}

function handleEventSearch() {
  eventSearch.value.page = 1
  loadEventAudit()
}

function handleEventReset() {
  eventSearch.value = {
    page: 1,
    pageSize: 20,
    batteryCode: '',
    eventType: '',
    operator: '',
  }
  loadEventAudit()
}

function onBatteryPageChange(event: any) {
  batterySearch.value.page = event.page + 1
  batterySearch.value.pageSize = event.rows
  loadBatteryAudit()
}

function onEventPageChange(event: any) {
  eventSearch.value.page = event.page + 1
  eventSearch.value.pageSize = event.rows
  loadEventAudit()
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

function getEventTypeLabel(type: string): string {
  const map: Record<string, string> = {
    register: '入厂登记',
    inspection_start: '检测开始',
    inspection_complete: '检测完成',
    qualified: '检测合格',
    unqualified: '检测不合格',
    to_disassemble: '转拆解',
    for_sale: '待售',
    sold: '已销售',
    shipped: '已发货',
    modify: '信息修改',
    lock_inspection: '检测锁定',
  }
  return map[type] || type
}

function formatDate(date: any): string {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="page-card">
    <div class="section-title">审计查询（PostgreSQL）</div>
    <p style="color: #64748b; font-size: 13px; margin-bottom: 16px">
      关键状态变化同步写入 PostgreSQL 审计索引，用于审计追溯和快速查询
    </p>

    <TabView :activeIndex="activeIndex" @tab-change="onTabChange">
      <TabPanel header="电池包状态索引">
        <div class="filter-bar" style="margin-top: 16px">
          <div>
            <label style="display: block; font-size: 12px; color: #64748b; margin-bottom: 4px">电池包编号</label>
            <InputText v-model="batterySearch.batteryCode" placeholder="请输入" @keyup.enter="handleBatterySearch" />
          </div>
          <div>
            <label style="display: block; font-size: 12px; color: #64748b; margin-bottom: 4px">VIN码</label>
            <InputText v-model="batterySearch.vin" placeholder="请输入" @keyup.enter="handleBatterySearch" />
          </div>
          <div>
            <label style="display: block; font-size: 12px; color: #64748b; margin-bottom: 4px">状态</label>
            <Dropdown v-model="batterySearch.status" :options="statusOptions" optionLabel="label" optionValue="value" style="min-width: 120px" />
          </div>
          <div>
            <label style="display: block; font-size: 12px; color: #64748b; margin-bottom: 4px">安全等级</label>
            <Dropdown v-model="batterySearch.safetyLevel" :options="safetyLevelOptions" optionLabel="label" optionValue="value" style="min-width: 100px" />
          </div>
          <div style="display: flex; gap: 8px">
            <Button label="查询" icon="pi pi-search" @click="handleBatterySearch" />
            <Button label="重置" icon="pi pi-refresh" class="p-button-secondary" @click="handleBatteryReset" />
          </div>
        </div>

        <DataTable
          :value="batteryList"
          :paginator="true"
          :rows="batterySearch.pageSize"
          :totalRecords="batteryTotal"
          :loading="batteryLoading"
          (onPage)="onBatteryPageChange($event)"
          :lazy="true"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[10, 20, 50, 100]"
          currentPageReportTemplate="共 {totalRecords} 条记录"
        >
          <Column field="batteryCode" header="电池包编号" style="width: 140px"></Column>
          <Column field="vin" header="VIN码" style="width: 160px"></Column>
          <Column field="vehiclePlate" header="车牌号" style="width: 100px"></Column>
          <Column header="状态" style="width: 100px">
            <template #body="slotProps">
              {{ getStatusLabel(slotProps.data.status) }}
            </template>
          </Column>
          <Column header="安全等级" style="width: 80px">
            <template #body="slotProps">
              <span v-if="slotProps.data.safetyLevel">{{ slotProps.data.safetyLevel }}级</span>
              <span v-else>-</span>
            </template>
          </Column>
          <Column field="capacity" header="容量(Ah)" style="width: 100px"></Column>
          <Column field="receiver" header="收货员" style="width: 100px"></Column>
          <Column field="inspector" header="检测员" style="width: 100px"></Column>
          <Column field="salesPerson" header="销售员" style="width: 100px"></Column>
          <Column header="最后操作" style="width: 140px">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.lastOperationTime) }}
            </template>
          </Column>
          <Column header="更新时间" style="width: 160px">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.updatedAt) }}
            </template>
          </Column>
        </DataTable>
      </TabPanel>

      <TabPanel header="流转事件审计">
        <div class="filter-bar" style="margin-top: 16px">
          <div>
            <label style="display: block; font-size: 12px; color: #64748b; margin-bottom: 4px">电池包编号</label>
            <InputText v-model="eventSearch.batteryCode" placeholder="请输入" @keyup.enter="handleEventSearch" />
          </div>
          <div>
            <label style="display: block; font-size: 12px; color: #64748b; margin-bottom: 4px">事件类型</label>
            <Dropdown v-model="eventSearch.eventType" :options="eventTypeOptions" optionLabel="label" optionValue="value" style="min-width: 140px" />
          </div>
          <div>
            <label style="display: block; font-size: 12px; color: #64748b; margin-bottom: 4px">操作人</label>
            <InputText v-model="eventSearch.operator" placeholder="请输入" @keyup.enter="handleEventSearch" />
          </div>
          <div style="display: flex; gap: 8px">
            <Button label="查询" icon="pi pi-search" @click="handleEventSearch" />
            <Button label="重置" icon="pi pi-refresh" class="p-button-secondary" @click="handleEventReset" />
          </div>
        </div>

        <DataTable
          :value="eventList"
          :paginator="true"
          :rows="eventSearch.pageSize"
          :totalRecords="eventTotal"
          :loading="eventLoading"
          (onPage)="onEventPageChange($event)"
          :lazy="true"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[10, 20, 50, 100]"
          currentPageReportTemplate="共 {totalRecords} 条记录"
        >
          <Column field="batteryCode" header="电池包编号" style="width: 140px"></Column>
          <Column header="事件类型" style="width: 120px">
            <template #body="slotProps">
              {{ getEventTypeLabel(slotProps.data.eventType) }}
            </template>
          </Column>
          <Column field="fromStatus" header="原状态" style="width: 100px"></Column>
          <Column field="toStatus" header="目标状态" style="width: 100px"></Column>
          <Column field="operator" header="操作人" style="width: 100px"></Column>
          <Column header="事件时间" style="width: 160px">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.eventTime) }}
            </template>
          </Column>
          <Column field="remark" header="备注" style="min-width: 150px"></Column>
          <Column header="同步时间" style="width: 160px">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.syncedAt) }}
            </template>
          </Column>
        </DataTable>
      </TabPanel>
    </TabView>
  </div>
</template>
