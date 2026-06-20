<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const menuItems = [
  { icon: 'pi pi-home', label: '首页', path: '/' },
  { icon: 'pi pi-box', label: '入厂登记', path: '/battery' },
  { icon: 'pi pi-search', label: '检测录入', path: '/inspection' },
  { icon: 'pi pi-shopping-cart', label: '梯次销售', path: '/sales' },
  { icon: 'pi pi-history', label: '流转追踪', path: '/flow' },
  { icon: 'pi pi-shield', label: '审计查询', path: '/audit' },
]

const activeIndex = computed(() => {
  return menuItems.findIndex(item => item.path === route.path)
})

function navigateTo(path: string) {
  router.push(path)
}
</script>

<template>
  <div class="layout-container">
    <div class="layout-sidebar">
      <div class="sidebar-header">
        电池回收管理系统
      </div>
      <div class="sidebar-menu">
        <div
          v-for="(item, index) in menuItems"
          :key="item.path"
          class="menu-item"
          :class="{ active: activeIndex === index }"
          @click="navigateTo(item.path)"
        >
          <i :class="item.icon"></i>
          <span>{{ item.label }}</span>
        </div>
      </div>
    </div>
    <div class="layout-main">
      <div class="layout-header">
        <div class="page-title">{{ menuItems[activeIndex]?.label || '首页' }}</div>
        <div>
          <span>管理员</span>
        </div>
      </div>
      <div class="layout-content">
        <router-view />
      </div>
    </div>
  </div>
</template>
