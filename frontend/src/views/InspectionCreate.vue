<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { InputText } from 'primevue/inputtext'
import { InputNumber } from 'primevue/inputnumber'
import { Button } from 'primevue/button'
import { Dropdown } from 'primevue/dropdown'
import { Textarea } from 'primevue/textarea'
import { createInspection, getInspectionsByBattery } from '@/api/inspection'
import { getBatteryByCode } from '@/api/battery'

const router = useRouter()

const form = ref({
  batteryId: '',
  batteryCode: '',
  inspector: '',
  capacity: null as number | null,
  capacityRatio: null as number | null,
  internalResistance: null as number | null,
  internalResistanceRatio: null as number | null,
  safetyLevel: '',
  voltage: null as number | null,
  temperature: null as number | null,
  insulationResistance: null as number | null,
  appearanceCheck: '',
  conclusion: '',
  suggestRoute: '',
})

const batteryInfo = ref<any>(null)
const loading = ref(false)
const searching = ref(false)

const safetyLevelOptions = [
  { label: 'A级 - 优秀', value: 'A' },
  { label: 'B级 - 良好', value: 'B' },
  { label: 'C级 - 合格', value: 'C' },
  { label: 'D级 - 不合格', value: 'D' },
]

async function searchBattery() {
  if (!form.value.batteryCode) {
    alert('请输入电池包编号')
    return
  }

  searching.value = true
  try {
    const res: any = await getBatteryByCode(form.value.batteryCode)
    batteryInfo.value = res.data
    form.value.batteryId = res.data._id

    if (res.data.isInspectionLocked) {
      alert('该电池包已进入梯次出库，不能再录入或修改检测结论')
    }

    try {
      const inspRes: any = await getInspectionsByBattery(res.data._id)
      if (inspRes.data && inspRes.data.length > 0) {
        const latest = inspRes.data[0]
        form.value.capacity = latest.capacity
        form.value.internalResistance = latest.internalResistance
        form.value.safetyLevel = latest.safetyLevel
        form.value.voltage = latest.voltage
        form.value.temperature = latest.temperature
        form.value.conclusion = latest.conclusion
        alert('已加载最近一次检测记录，可在其基础上修改')
      }
    } catch (e) {
      // ignore
    }
  } catch (error: any) {
    alert(error?.response?.data?.message || '未找到该电池包')
    batteryInfo.value = null
    form.value.batteryId = ''
  } finally {
    searching.value = false
  }
}

async function handleSubmit() {
  if (!form.value.batteryId) {
    alert('请先查询并选择电池包')
    return
  }
  if (!form.value.inspector) {
    alert('请输入检测人员')
    return
  }
  if (form.value.capacity == null) {
    alert('请输入容量')
    return
  }
  if (form.value.internalResistance == null) {
    alert('请输入内阻')
    return
  }
  if (!form.value.safetyLevel) {
    alert('请选择安全等级')
    return
  }

  if (batteryInfo.value?.isInspectionLocked) {
    alert('该电池包已进入梯次出库，不能修改检测结论')
    return
  }

  loading.value = true
  try {
    const res: any = await createInspection(form.value as any)
    if (res.data.result === 'qualified') {
      alert('检测录入成功！该电池包检测合格，进入梯次利用路线')
    } else {
      alert('检测录入成功！安全等级不达标，该电池包将转拆解路线')
    }
    router.push('/inspection')
  } catch (error: any) {
    console.error('Failed to create inspection:', error)
    alert(error?.response?.data?.message || '检测录入失败')
  } finally {
    loading.value = false
  }
}

function handleCancel() {
  router.back()
}
</script>

<template>
  <div class="page-card">
    <div class="section-title">检测录入</div>
    <div style="max-width: 800px; margin: 0 auto">
      <div style="background: #fffbeb; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px; color: #b45309; font-size: 13px">
        <i class="pi pi-exclamation-triangle" style="margin-right: 6px"></i>
        安全等级A/B级为合格，可进行梯次利用；C/D级为不合格，自动转拆解路线
      </div>

      <div class="section-title" style="font-size: 14px; margin-bottom: 16px">选择电池包</div>
      <div style="display: flex; gap: 12px; margin-bottom: 16px; align-items: flex-end">
        <div style="flex: 1">
          <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px">
            电池包编号 <span style="color: #ef4444">*</span>
          </label>
          <InputText v-model="form.batteryCode" placeholder="请输入电池包编号查询" style="width: 100%" @keyup.enter="searchBattery" />
        </div>
        <Button label="查询" icon="pi pi-search" :loading="searching" @click="searchBattery" />
      </div>

      <div v-if="batteryInfo" style="background: #f1f5f9; padding: 16px; border-radius: 6px; margin-bottom: 20px">
        <div style="font-weight: 600; margin-bottom: 8px; color: #1e293b">电池包信息</div>
        <div class="form-row-3" style="margin-bottom: 0">
          <div style="font-size: 13px; color: #64748b">
            VIN码：<span style="color: #1e293b">{{ batteryInfo.vin }}</span>
          </div>
          <div style="font-size: 13px; color: #64748b">
            车牌号：<span style="color: #1e293b">{{ batteryInfo.vehiclePlate || '-' }}</span>
          </div>
          <div style="font-size: 13px; color: #64748b">
            当前状态：<span :class="'status-tag status-' + batteryInfo.status">
              {{ batteryInfo.status }}
            </span>
          </div>
        </div>
        <div v-if="batteryInfo.isInspectionLocked" style="color: #ef4444; font-size: 12px; margin-top: 8px">
          <i class="pi pi-lock"></i> 该电池包检测结论已锁定，不能修改
        </div>
      </div>

      <div class="section-title" style="font-size: 14px; margin: 24px 0 16px 0">检测信息</div>
      <div class="form-row">
        <div>
          <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px">
            检测人员 <span style="color: #ef4444">*</span>
          </label>
          <InputText v-model="form.inspector" placeholder="请输入检测人员姓名" style="width: 100%" />
        </div>
        <div>
          <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px">
            安全等级 <span style="color: #ef4444">*</span>
          </label>
          <Dropdown v-model="form.safetyLevel" :options="safetyLevelOptions" optionLabel="label" optionValue="value" style="width: 100%" placeholder="请选择" />
        </div>
      </div>

      <div class="form-row-3">
        <div>
          <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px">
            容量(Ah) <span style="color: #ef4444">*</span>
          </label>
          <InputNumber v-model="form.capacity" placeholder="请输入" style="width: 100%" />
        </div>
        <div>
          <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px">容量保持率(%)</label>
          <InputNumber v-model="form.capacityRatio" placeholder="请输入" style="width: 100%" />
        </div>
        <div>
          <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px">
            内阻(mΩ) <span style="color: #ef4444">*</span>
          </label>
          <InputNumber v-model="form.internalResistance" placeholder="请输入" style="width: 100%" />
        </div>
      </div>

      <div class="form-row-3">
        <div>
          <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px">电压(V)</label>
          <InputNumber v-model="form.voltage" placeholder="请输入" style="width: 100%" />
        </div>
        <div>
          <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px">温度(℃)</label>
          <InputNumber v-model="form.temperature" placeholder="请输入" style="width: 100%" />
        </div>
        <div>
          <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px">绝缘电阻(MΩ)</label>
          <InputNumber v-model="form.insulationResistance" placeholder="请输入" style="width: 100%" />
        </div>
      </div>

      <div class="form-row" style="margin-top: 16px">
        <div>
          <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px">外观检查</label>
          <InputText v-model="form.appearanceCheck" placeholder="请输入外观检查结果" style="width: 100%" />
        </div>
        <div>
          <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px">建议路线</label>
          <InputText v-model="form.suggestRoute" placeholder="梯次利用/拆解回收等" style="width: 100%" />
        </div>
      </div>

      <div style="margin-top: 16px">
        <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px">检测结论</label>
        <textarea
          v-model="form.conclusion"
          rows="3"
          placeholder="请输入检测结论"
          style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px"
        ></textarea>
      </div>

      <div class="form-actions">
        <Button label="取消" class="p-button-secondary" @click="handleCancel" />
        <Button label="提交检测" :loading="loading" @click="handleSubmit" />
      </div>
    </div>
  </div>
</template>
