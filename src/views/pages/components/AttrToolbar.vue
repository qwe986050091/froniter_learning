<template>
  <div class="toolbar">
    <!-- 三下拉级联分类 -->
    <div class="category-cascader">
      <el-select
          v-model="selectedLevel1Id"
          placeholder="请选择一级分类"
          style="width: 180px"
          :disabled="loadingCategory"
          @change="emit('level1-change')"
      >
        <el-option
            v-for="c in level1Categories"
            :key="c.id"
            :label="c.name"
            :value="c.id"
        />
      </el-select>

      <el-select
          v-model="selectedLevel2Id"
          placeholder="请选择二级分类"
          style="width: 180px; margin-left: 12px"
          :disabled="!selectedLevel1Id || loadingCategory"
          @change="emit('level2-change')"
      >
        <el-option
            v-for="c in level2Categories"
            :key="c.id"
            :label="c.name"
            :value="c.id"
        />
      </el-select>

      <el-select
          v-model="selectedLevel3Id"
          placeholder="请选择三级分类"
          style="width: 180px; margin-left: 12px"
          :disabled="!selectedLevel2Id || loadingCategory"
          @change="emit('level3-change')"
      >
        <el-option
            v-for="c in level3Categories"
            :key="c.id"
            :label="c.name"
            :value="c.id"
        />
      </el-select>
    </div>

    <!-- 搜索 + 新增按钮 -->
    <div class="toolbar-right">
      <el-form :inline="true" class="search-form">
        <el-form-item label="属性名称">
          <el-input
              v-model="searchName"
              placeholder="请输入属性名称"
              clearable
              style="width: 180px"
              @keyup.enter="emit('search')"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
              v-model="searchStatus"
              placeholder="全部"
              clearable
              style="width: 120px"
          >
            <el-option label="启用" :value="1"/>
            <el-option label="禁用" :value="0"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" :loading="loading" @click="emit('search')">搜索</el-button>
          <el-button :icon="RefreshRight" :disabled="loading" @click="emit('reset')">重置</el-button>
        </el-form-item>
      </el-form>

      <el-button
          type="primary"
          :icon="Plus"
          :disabled="!canAdd || loading"
          @click="emit('add')"
      >+ 添加平台属性
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {Search, RefreshRight, Plus} from '@element-plus/icons-vue'
import type {Category} from '@/types'

defineProps<{
  level1Categories: Category[]
  level2Categories: Category[]
  level3Categories: Category[]
  loadingCategory: boolean
  loading: boolean
  canAdd: boolean
}>()

// 分类选中值：父组件通过 v-model:xxx 双向绑定
const selectedLevel1Id = defineModel<number | undefined>('selectedLevel1Id')
const selectedLevel2Id = defineModel<number | undefined>('selectedLevel2Id')
const selectedLevel3Id = defineModel<number | undefined>('selectedLevel3Id')
// 搜索表单：同样由父组件 v-model 提供
const searchName = defineModel<string>('searchName')
const searchStatus = defineModel<number | undefined>('searchStatus')

const emit = defineEmits<{
  'level1-change': []
  'level2-change': []
  'level3-change': []
  search: []
  reset: []
  add: []
}>()
</script>

<style scoped>
.toolbar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  margin-bottom: 12px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.category-cascader {
  display: flex;
  align-items: center;
}

.toolbar-right {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.search-form {
  margin-bottom: 0;
}
</style>
