<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DataTable } from 'primevue/datatable'
import { Column } from 'primevue/column'
import { InputText } from 'primevue/inputtext'
import { Button } from 'primevue/button'
import { Dropdown } from 'primevue/dropdown'
import { getFlowEventList } from '@/api/flow'
import type { FlowEvent } from '@/api/flow'

const events = ref<FlowEvent[]>([])
const total = ref(0)
const loading = ref(false)

const searchParams = ref({
  page: 1,
  pageSize: 20,
  batteryCode: '',
  eventType: '',
  operator: '',
})

const eventTypeOptions = [
  { label: '全部', value: '' },
  { label: '入厂登记', value: 'register' },
  { label: '检测开始', value: 'inspection_start' },
  { label: '检测完成', value: 'inspection_complete' },
  { label: '检测合格', value: 'qualified' },
  { label: '检测不合格', value: 'unqualified' },
  { label: '转拆解', value: 'to_disassemble' },
  { label: '待售', value: 'for_sale' },
  { label: '已销售', value: 'sold' },
  { label: '已发货', value: 'shipped' },
  { label: '信息修改', value: 'modify' },
  { label: '检测锁定', value: 'lock_inspection' },
]

onMounted(() => {
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    const res: any = await getFlowEventList(searchParams.value)
    events.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('Failed to load flow events:', error)
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
    eventType: '',
    operator: '',
  }
  loadData()
}

function onPageChange(event: any) {
  searchParams.value.page = event.page + 1
  searchParams.value.pageSize = event.rows
  loadData()
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

function getEventClass(type: string): string {
  const classMap: Record<string, string> = {
    register: 'status-tag status-registered',
    inspection_start: 'status-tag status-inspecting',
    inspection_complete: 'status-tag status-qualified',
    qualified: 'status-tag status-qualified',
    unqualified: 'status-tag status-unqualified',
    to_disassemble: 'status-tag status-disassembling',
    for_sale: 'status-tag status-for_sale',
    sold: 'status-tag status-sold',
    shipped: 'status-tag status-shipped',
    modify: 'status-tag status-inspecting',
    lock_inspection: 'status-tag status-unqualified',
  }
  return classMap[type] || 'status-tag'
}

function formatDate(date: any): string {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
</script>

<template>
  <div class="page-card">
    <div class="section-title">流转追踪</div>

    <div class="filter-bar">
      <div>
        <label style="display: block; font-size: 12px; color: #64748b; margin-bottom: 4px">电池包编号</label>
        <InputText v-model="searchParams.batteryCode" placeholder="请输入" @keyup.enter="handleSearch" />
      </div>
      <div>
        <label style="display: block; font-size: 12px; color: #64748b; margin-bottom: 4px">事件类型</label>
        <Dropdown v-model="searchParams.eventType" :options="eventTypeOptions" optionLabel="label" optionValue="value" style="min-width: 140px" />
      </div>
      <div>
        <label style="display: block; font-size: 12px; color: #64748b; margin-bottom: 4px">操作人</label>
        <InputText v-model="searchParams.operator" placeholder="请输入" @keyup.enter="handleSearch" />
      </div>
      <div style="display: flex; gap: 8px">
        <Button label="查询" icon="pi pi-search" @click="handleSearch" />
        <Button label="重置" icon="pi pi-refresh" class="p-button-secondary" @click="handleReset" />
      </div>
    </div>

    <DataTable
      :value="events"
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
      <Column header="事件类型" style="width: 120px">
        <template #body="slotProps">
          <span :class="getEventClass(slotProps.data.eventType)">
            {{ getEventTypeLabel(slotProps.data.eventType) }}
          </span>
        </template>
      </Column>
      <Column field="fromStatus" header="原状态" style="width: 100px">
        <template #body="slotProps">
          <span v-if="slotProps.data.fromStatus">{{ slotProps.data.fromStatus }}</span>
          <span v-else style="color: #94a3b8">-</span>
        </template>
      </Column>
      <Column field="toStatus" header="目标状态" style="width: 100px">
        <template #body="slotProps">
          <span v-if="slotProps.data.toStatus">{{ slotProps.data.toStatus }}</span>
          <span v-else style="color: #94a3b8">-</span>
        </template>
      </Column>
      <Column field="operator" header="操作人" style="width: 100px"></Column>
      <Column header="操作时间" style="width: 160px">
        <template #body="slotProps">
          {{ formatDate(slotProps.data.operationTime) }}
        </template>
      </Column>
      <Column field="remark" header="备注" style="min-width: 150px"></Column>
      <Column header="审计同步" style="width: 100px">
        <template #body="slotProps">
          <span v-if="slotProps.data.syncedToAudit" style="color: #10b981">
            <i class="pi pi-check-circle"></i> 已同步
          </span>
          <span v-else style="color: #f59e0b">
            <i class="pi pi-clock"></i> 待同步
          </span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
