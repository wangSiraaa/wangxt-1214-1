<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getInspectionList } from '@/api/inspection'
import type { Inspection } from '@/api/inspection'

const router = useRouter()

const inspections = ref<Inspection[]>([])
const total = ref(0)
const loading = ref(false)

const searchParams = ref({
  page: 1,
  pageSize: 20,
  batteryCode: '',
  inspector: '',
  safetyLevel: '',
  result: '',
})

const safetyLevelOptions = [
  { label: '全部', value: '' },
  { label: 'A级', value: 'A' },
  { label: 'B级', value: 'B' },
  { label: 'C级', value: 'C' },
  { label: 'D级', value: 'D' },
]

const resultOptions = [
  { label: '全部', value: '' },
  { label: '合格', value: 'qualified' },
  { label: '不合格', value: 'unqualified' },
  { label: '待判定', value: 'pending' },
]

onMounted(() => {
  loadData()
})

async function loadData() {
  loading.value = true
  try {
    const res: any = await getInspectionList(searchParams.value)
    inspections.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('Failed to load inspections:', error)
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
    inspector: '',
    safetyLevel: '',
    result: '',
  }
  loadData()
}

function onPageChange(event: any) {
  searchParams.value.page = event.page + 1
  searchParams.value.pageSize = event.rows
  loadData()
}

function goToCreate() {
  router.push('/inspection/create')
}

function getResultLabel(result: string): string {
  const map: Record<string, string> = {
    qualified: '合格',
    unqualified: '不合格',
    pending: '待判定',
  }
  return map[result] || result
}

function getResultClass(result: string): string {
  if (result === 'qualified') return 'status-tag status-qualified'
  if (result === 'unqualified') return 'status-tag status-unqualified'
  return 'status-tag status-inspecting'
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
      <div class="section-title">检测记录</div>
      <Button label="新增检测" icon="pi pi-plus" @click="goToCreate" />
    </div>

    <div class="filter-bar">
      <div>
        <label style="display: block; font-size: 12px; color: #64748b; margin-bottom: 4px">电池包编号</label>
        <InputText v-model="searchParams.batteryCode" placeholder="请输入" @keyup.enter="handleSearch" />
      </div>
      <div>
        <label style="display: block; font-size: 12px; color: #64748b; margin-bottom: 4px">检测人员</label>
        <InputText v-model="searchParams.inspector" placeholder="请输入" @keyup.enter="handleSearch" />
      </div>
      <div>
        <label style="display: block; font-size: 12px; color: #64748b; margin-bottom: 4px">安全等级</label>
        <Dropdown v-model="searchParams.safetyLevel" :options="safetyLevelOptions" optionLabel="label" optionValue="value" style="min-width: 120px" />
      </div>
      <div>
        <label style="display: block; font-size: 12px; color: #64748b; margin-bottom: 4px">检测结果</label>
        <Dropdown v-model="searchParams.result" :options="resultOptions" optionLabel="label" optionValue="value" style="min-width: 120px" />
      </div>
      <div style="display: flex; gap: 8px">
        <Button label="查询" icon="pi pi-search" @click="handleSearch" />
        <Button label="重置" icon="pi pi-refresh" class="p-button-secondary" @click="handleReset" />
      </div>
    </div>

    <DataTable
      :value="inspections"
      :paginator="true"
      :rows="searchParams.pageSize"
      :totalRecords="total"
      :loading="loading"
      @page="onPageChange($event)"
      :lazy="true"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[10, 20, 50, 100]"
      currentPageReportTemplate="共 {totalRecords} 条记录"
    >
      <Column field="batteryCode" header="电池包编号" style="width: 140px"></Column>
      <Column field="inspector" header="检测人员" style="width: 100px"></Column>
      <Column header="检测日期" style="width: 160px">
        <template #body="slotProps">
          {{ formatDate(slotProps.data.inspectionDate) }}
        </template>
      </Column>
      <Column field="capacity" header="容量(Ah)" style="width: 100px"></Column>
      <Column field="internalResistance" header="内阻(mΩ)" style="width: 100px"></Column>
      <Column header="安全等级" style="width: 80px">
        <template #body="slotProps">
          {{ slotProps.data.safetyLevel }}级
        </template>
      </Column>
      <Column header="检测结果" style="width: 100px">
        <template #body="slotProps">
          <span :class="getResultClass(slotProps.data.result)">
            {{ getResultLabel(slotProps.data.result) }}
          </span>
        </template>
      </Column>
      <Column field="conclusion" header="检测结论" style="min-width: 150px"></Column>
    </DataTable>
  </div>
</template>
