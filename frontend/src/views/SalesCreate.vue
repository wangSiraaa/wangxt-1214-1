<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { createSaleOrder, getCascadePurposes, getAvailableBatteries } from '@/api/sales'
import type { SaleOrder } from '@/api/sales'

const router = useRouter()

const form = ref({
  customerName: '',
  customerContact: '',
  customerPhone: '',
  customerAddress: '',
  cascadePurpose: '',
  batteryIds: [] as string[],
  totalAmount: null as number | null,
  salesPerson: '',
  remark: '',
  shippingAddress: '',
})

const purposeOptions = ref<{ value: string; label: string; description: string }[]>([])
const availableBatteries = ref<any[]>([])
const selectedBatteries = ref<any[]>([])
const loading = ref(false)
const loadingBatteries = ref(false)

onMounted(() => {
  loadPurposes()
  loadAvailableBatteries()
})

async function loadPurposes() {
  try {
    const res: any = await getCascadePurposes()
    purposeOptions.value = res.data
  } catch (error) {
    console.error('Failed to load purposes:', error)
  }
}

async function loadAvailableBatteries() {
  loadingBatteries.value = true
  try {
    const res: any = await getAvailableBatteries()
    availableBatteries.value = res.data
  } catch (error) {
    console.error('Failed to load batteries:', error)
  } finally {
    loadingBatteries.value = false
  }
}

const selectedBatteryCodes = computed(() => {
  return selectedBatteries.value.map(b => b.batteryCode).join(', ')
})

function onBatterySelectionChange(event: any) {
  form.value.batteryIds = event.value.map((b: any) => b._id)
}

function isRowDisabled(data: any): boolean {
  return data._disabled
}

function isBatteryUsableForPurpose(battery: any, purpose: string): boolean {
  if (!battery.safetyLevel) return false
  if (battery.safetyLevel === 'A') return true
  if (battery.safetyLevel === 'B') {
    const excluded = ['energy_storage']
    return !excluded.includes(purpose)
  }
  return false
}

const filteredBatteries = computed(() => {
  if (!form.value.cascadePurpose) {
    return availableBatteries.value.map(b => ({
      ...b,
      _disabled: false,
      _disabledReason: '',
    }))
  }
  return availableBatteries.value.map(b => {
    const usable = isBatteryUsableForPurpose(b, form.value.cascadePurpose)
    return {
      ...b,
      _disabled: !usable,
      _disabledReason: usable ? '' : `安全等级${b.safetyLevel}级不适用于此梯次用途`,
    }
  })
})

async function handleSubmit() {
  if (!form.value.customerName) {
    alert('请输入客户名称')
    return
  }
  if (!form.value.cascadePurpose) {
    alert('请选择梯次用途')
    return
  }
  if (form.value.batteryIds.length === 0) {
    alert('请选择至少一个电池包')
    return
  }
  if (!form.value.salesPerson) {
    alert('请输入销售人员')
    return
  }

  const invalidBatteries = selectedBatteries.value.filter(
    b => !isBatteryUsableForPurpose(b, form.value.cascadePurpose)
  )
  if (invalidBatteries.length > 0) {
    alert(
      `以下电池包安全等级不适用于当前梯次用途：\n${invalidBatteries
        .map((b: any) => `${b.batteryCode}(${b.safetyLevel}级)`)
        .join('、')}`
    )
    return
  }

  loading.value = true
  try {
    const res: any = await createSaleOrder(form.value as any)
    alert('创建成功！')
    router.push('/sales')
  } catch (error: any) {
    console.error('Failed to create order:', error)
    alert(error?.response?.data?.message || '创建失败')
  } finally {
    loading.value = false
  }
}

function handleCancel() {
  router.back()
}

function getSafetyLevelClass(level: string): string {
  if (level === 'A') return 'status-tag status-qualified'
  if (level === 'B') return 'status-tag status-qualified'
  return 'status-tag status-unqualified'
}
</script>

<template>
  <div class="page-card">
    <div class="section-title">新建销售订单</div>
    <div style="max-width: 900px; margin: 0 auto">
      <div style="background: #ecfdf5; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px; color: #047857; font-size: 13px">
        <i class="pi pi-check-circle" style="margin-right: 6px"></i>
        仅显示安全等级A/B级的合格电池包；A级电池包适用于所有梯次用途，B级电池包不适用于储能电站等高要求场景
      </div>

      <div class="section-title" style="font-size: 14px; margin-bottom: 16px">客户信息</div>
      <div class="form-row">
        <div>
          <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px">
            客户名称 <span style="color: #ef4444">*</span>
          </label>
          <InputText v-model="form.customerName" placeholder="请输入客户名称" style="width: 100%" />
        </div>
        <div>
          <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px">联系人</label>
          <InputText v-model="form.customerContact" placeholder="请输入联系人" style="width: 100%" />
        </div>
      </div>
      <div class="form-row">
        <div>
          <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px">联系电话</label>
          <InputText v-model="form.customerPhone" placeholder="请输入联系电话" style="width: 100%" />
        </div>
        <div>
          <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px">客户地址</label>
          <InputText v-model="form.customerAddress" placeholder="请输入客户地址" style="width: 100%" />
        </div>
      </div>

      <div class="section-title" style="font-size: 14px; margin: 24px 0 16px 0">销售信息</div>
      <div class="form-row">
        <div>
          <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px">
            梯次用途 <span style="color: #ef4444">*</span>
          </label>
          <Dropdown v-model="form.cascadePurpose" :options="purposeOptions" optionLabel="label" optionValue="value" style="width: 100%" placeholder="请选择梯次用途" />
        </div>
        <div>
          <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px">
            销售人员 <span style="color: #ef4444">*</span>
          </label>
          <InputText v-model="form.salesPerson" placeholder="请输入销售人员姓名" style="width: 100%" />
        </div>
      </div>
      <div class="form-row">
        <div>
          <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px">总金额(元)</label>
          <InputNumber v-model="form.totalAmount" placeholder="请输入总金额" style="width: 100%" />
        </div>
        <div>
          <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px">收货地址</label>
          <InputText v-model="form.shippingAddress" placeholder="请输入收货地址" style="width: 100%" />
        </div>
      </div>

      <div class="section-title" style="font-size: 14px; margin: 24px 0 16px 0">
        选择电池包 <span style="color: #ef4444">*</span>
        <span style="font-size: 12px; color: #64748b; font-weight: normal">（已选 {{ selectedBatteries.length }} 个）</span>
      </div>
      <div style="border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden">
        <DataTable
          :value="filteredBatteries"
          :loading="loadingBatteries"
          v-model:selection="selectedBatteries"
          selectionMode="multiple"
          @selection-change="onBatterySelectionChange"
          dataKey="_id"
          :rowDisabled="isRowDisabled"
          :rows="10"
          :paginator="true"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
        >
          <Column selectionMode="multiple" style="width: 3em"></Column>
          <Column field="batteryCode" header="电池包编号" style="width: 140px"></Column>
          <Column field="vin" header="VIN码" style="width: 160px"></Column>
          <Column header="安全等级" style="width: 100px">
            <template #body="slotProps">
              <span :class="getSafetyLevelClass(slotProps.data.safetyLevel)">
                {{ slotProps.data.safetyLevel }}级
              </span>
              <div v-if="slotProps.data._disabled" style="font-size: 11px; color: #ef4444; margin-top: 2px">
                {{ slotProps.data._disabledReason }}
              </div>
            </template>
          </Column>
          <Column field="capacity" header="容量(Ah)" style="width: 100px"></Column>
          <Column field="internalResistance" header="内阻(mΩ)" style="width: 100px"></Column>
          <Column field="receiver" header="收货员" style="width: 100px"></Column>
        </DataTable>
      </div>

      <div style="margin-top: 16px">
        <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px">备注</label>
        <textarea
          v-model="form.remark"
          rows="2"
          placeholder="请输入备注"
          style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px"
        ></textarea>
      </div>

      <div class="form-actions">
        <Button label="取消" class="p-button-secondary" @click="handleCancel" />
        <Button label="创建订单" :loading="loading" @click="handleSubmit" />
      </div>
    </div>
  </div>
</template>
