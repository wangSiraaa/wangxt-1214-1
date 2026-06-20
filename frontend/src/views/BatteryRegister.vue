<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { InputText } from 'primevue/inputtext'
import { InputNumber } from 'primevue/inputnumber'
import { Button } from 'primevue/button'
import { MessageService } from 'primevue/api'
import { registerBattery } from '@/api/battery'

const router = useRouter()

const form = ref({
  batteryCode: '',
  vin: '',
  vehiclePlate: '',
  vehicleModel: '',
  batteryModel: '',
  nominalCapacity: null as number | null,
  nominalVoltage: null as number | null,
  receiver: '',
  packageCount: null as number | null,
  weight: null as number | null,
  remark: '',
})

const loading = ref(false)

function validateVin(vin: string): boolean {
  if (!vin || vin.length < 17) {
    return false
  }
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i
  return vinRegex.test(vin)
}

async function handleSubmit() {
  if (!form.value.batteryCode) {
    alert('请输入电池包编号')
    return
  }
  if (!form.value.vin) {
    alert('请输入VIN码')
    return
  }
  if (!validateVin(form.value.vin)) {
    alert('VIN码不完整（需17位有效字符），不能入库登记')
    return
  }

  loading.value = true
  try {
    const res: any = await registerBattery(form.value)
    alert('登记成功！')
    router.push('/battery')
  } catch (error: any) {
    console.error('Failed to register:', error)
    alert(error?.response?.data?.message || '登记失败')
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
    <div class="section-title">入厂登记</div>
    <div style="max-width: 800px; margin: 0 auto">
      <div style="background: #eff6ff; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px; color: #1d4ed8; font-size: 13px">
        <i class="pi pi-info-circle" style="margin-right: 6px"></i>
        VIN码必须完整（17位有效字符）才能入库登记
      </div>

      <div class="section-title" style="font-size: 14px; margin-bottom: 16px">基本信息</div>
      <div class="form-row">
        <div>
          <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px">
            电池包编号 <span style="color: #ef4444">*</span>
          </label>
          <InputText v-model="form.batteryCode" placeholder="请输入电池包编号" style="width: 100%" />
        </div>
        <div>
          <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px">
            VIN码 <span style="color: #ef4444">*</span>
          </label>
          <InputText v-model="form.vin" placeholder="请输入17位VIN码" style="width: 100%" />
        </div>
      </div>

      <div class="form-row">
        <div>
          <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px">车牌号</label>
          <InputText v-model="form.vehiclePlate" placeholder="请输入车牌号" style="width: 100%" />
        </div>
        <div>
          <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px">车辆型号</label>
          <InputText v-model="form.vehicleModel" placeholder="请输入车辆型号" style="width: 100%" />
        </div>
      </div>

      <div class="form-row">
        <div>
          <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px">电池型号</label>
          <InputText v-model="form.batteryModel" placeholder="请输入电池型号" style="width: 100%" />
        </div>
        <div>
          <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px">收货员</label>
          <InputText v-model="form.receiver" placeholder="请输入收货员姓名" style="width: 100%" />
        </div>
      </div>

      <div class="section-title" style="font-size: 14px; margin: 24px 0 16px 0">规格参数</div>
      <div class="form-row-3">
        <div>
          <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px">标称容量(Ah)</label>
          <InputNumber v-model="form.nominalCapacity" placeholder="请输入" style="width: 100%" />
        </div>
        <div>
          <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px">标称电压(V)</label>
          <InputNumber v-model="form.nominalVoltage" placeholder="请输入" style="width: 100%" />
        </div>
        <div>
          <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px">包件数量</label>
          <InputNumber v-model="form.packageCount" placeholder="请输入" style="width: 100%" />
        </div>
      </div>

      <div class="form-row">
        <div>
          <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px">重量(kg)</label>
          <InputNumber v-model="form.weight" placeholder="请输入" style="width: 100%" />
        </div>
        <div>
          <label style="display: block; font-size: 13px; color: #475569; margin-bottom: 6px">备注</label>
          <InputText v-model="form.remark" placeholder="请输入备注" style="width: 100%" />
        </div>
      </div>

      <div class="form-actions">
        <Button label="取消" class="p-button-secondary" @click="handleCancel" />
        <Button label="提交登记" :loading="loading" @click="handleSubmit" />
      </div>
    </div>
  </div>
</template>
