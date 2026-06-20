<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getBatteryStatistics } from '@/api/battery'

const router = useRouter()
const statistics = ref<Record<string, number>>({})

onMounted(() => {
  loadStatistics()
})

async function loadStatistics() {
  try {
    const res: any = await getBatteryStatistics()
    statistics.value = res.data
  } catch (error) {
    console.error('Failed to load statistics:', error)
  }
}

const statCards = [
  { key: 'total', label: '电池包总数', icon: 'pi pi-box', color: '#3b82f6' },
  { key: 'registered', label: '待检测', icon: 'pi pi-clock', color: '#f59e0b' },
  { key: 'qualified', label: '合格待售', icon: 'pi pi-check-circle', color: '#10b981' },
  { key: 'sold', label: '已销售', icon: 'pi pi-shopping-cart', color: '#8b5cf6' },
]

const quickActions = [
  { label: '入厂登记', icon: 'pi pi-plus', path: '/battery/register', color: '#3b82f6' },
  { label: '检测录入', icon: 'pi pi-search', path: '/inspection/create', color: '#10b981' },
  { label: '创建销售', icon: 'pi pi-shopping-cart', path: '/sales/create', color: '#8b5cf6' },
  { label: '流转追踪', icon: 'pi pi-history', path: '/flow', color: '#f59e0b' },
]

function goTo(path: string) {
  router.push(path)
}
</script>

<template>
  <div>
    <div class="stat-cards">
      <div
        v-for="card in statCards"
        :key="card.key"
        class="stat-card"
        style="cursor: pointer"
        @click="goTo('/battery')"
      >
        <div style="display: flex; align-items: center; justify-content: space-between">
          <div>
            <h3>{{ card.label }}</h3>
            <div class="stat-value">{{ statistics[card.key] || 0 }}</div>
          </div>
          <i
            :class="card.icon"
            :style="{ fontSize: '36px', color: card.color, opacity: 0.8 }"
          ></i>
        </div>
      </div>
    </div>

    <div class="page-card">
      <div class="section-title">快捷操作</div>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px">
        <div
          v-for="action in quickActions"
          :key="action.path"
          style="
            padding: 24px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            cursor: pointer;
            text-align: center;
            transition: all 0.2s;
          "
          @click="goTo(action.path)"
        >
          <i
            :class="action.icon"
            :style="{ fontSize: '32px', color: action.color, marginBottom: '12px' }"
          ></i>
          <div style="font-size: 14px; font-weight: 600; color: #1e293b">
            {{ action.label }}
          </div>
        </div>
      </div>
    </div>

    <div class="page-card" style="margin-top: 20px">
      <div class="section-title">业务流程说明</div>
      <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
        <div
          style="
            padding: 12px 20px;
            background: #dbeafe;
            color: #1d4ed8;
            border-radius: 6px;
            font-weight: 500;
          "
        >
          入厂登记
        </div>
        <i class="pi pi-arrow-right" style="color: #94a3b8"></i>
        <div
          style="
            padding: 12px 20px;
            background: #fef3c7;
            color: #b45309;
            border-radius: 6px;
            font-weight: 500;
          "
        >
          检测录入
        </div>
        <i class="pi pi-arrow-right" style="color: #94a3b8"></i>
        <div
          style="
            padding: 12px 20px;
            background: #d1fae5;
            color: #047857;
            border-radius: 6px;
            font-weight: 500;
          "
        >
          合格判定
        </div>
        <i class="pi pi-arrow-right" style="color: #94a3b8"></i>
        <div
          style="
            padding: 12px 20px;
            background: #e0e7ff;
            color: #3730a3;
            border-radius: 6px;
            font-weight: 500;
          "
        >
          梯次销售
        </div>
        <i class="pi pi-arrow-right" style="color: #94a3b8"></i>
        <div
          style="
            padding: 12px 20px;
            background: #f3e8ff;
            color: #6b21a8;
            border-radius: 6px;
            font-weight: 500;
          "
        >
          发货完成
        </div>
      </div>
      <div style="margin-top: 16px; color: #64748b; font-size: 13px">
        <p><strong>业务规则：</strong></p>
        <ul style="margin-top: 8px; padding-left: 20px">
          <li>VIN码不完整的电池包不能入库登记</li>
          <li>安全等级A/B级为合格，可进行梯次利用；C/D级为不合格，转拆解路线</li>
          <li>销售人员只能选择合规的梯次用途销售合格电池包</li>
          <li>已进入梯次出库的电池包不能再修改检测结论</li>
        </ul>
      </div>
    </div>
  </div>
</template>
