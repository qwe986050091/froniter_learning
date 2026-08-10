<template>
  <el-sub-menu
    v-if="item.children && item.children.length"
    :index="item.id"
  >
    <template #title>
      <el-icon v-if="iconComponent">
        <component :is="iconComponent" />
      </el-icon>
      <span>{{ item.name }}</span>
    </template>
    <SidebarMenuItem
      v-for="child in item.children"
      :key="child.id"
      :item="child"
    />
  </el-sub-menu>

  <el-menu-item v-else :index="item.path || item.id">
    <el-icon v-if="iconComponent">
      <component :is="iconComponent" />
    </el-icon>
    <span>{{ item.name }}</span>
  </el-menu-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  HomeFilled,
  DataBoard,
  Odometer,
  TrendCharts,
  Setting,
  User,
  Avatar,
  Tools,
  Monitor,
  Menu as MenuIcon,
} from '@element-plus/icons-vue'
import type { Component } from 'vue'
import type { MenuItem } from '@/types'

const props = defineProps<{ item: MenuItem }>()

const iconMap: Record<string, Component> = {
  HomeFilled,
  DataBoard,
  Odometer,
  TrendCharts,
  Setting,
  User,
  Avatar,
  Tools,
  Monitor,
}

const iconComponent = computed(() =>
  props.item.icon ? iconMap[props.item.icon] || MenuIcon : undefined
)
</script>
