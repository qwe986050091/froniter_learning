<template>
  <div class="table-card">
    <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
    >
      <template #empty>
        <el-empty :description="selectedLevel3Id ? '暂无数据' : '请先选择三级分类后查看平台属性'">
          <template #image>
            <el-image
                src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimal%20empty%20state%20illustration%20with%20folder%20and%20magnifier&image_size=square"
                :preview-src-list="[]"
                fit="contain"
                style="width: 160px; height: 160px"
            />
          </template>
        </el-empty>
      </template>

      <el-table-column label="序号" width="80" align="center">
        <template #default="{ $index }">
          {{ (page - 1) * pageSize + $index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="属性名称" min-width="160"/>
      <el-table-column label="属性值名称" min-width="560">
        <template #default="{ row }">
          <div class="value-tags">
            <el-tag
                v-for="(v, idx) in row.values"
                :key="v.id ?? `${row.id}-${idx}-${v.value}`"
                :type="idx % 2 === 0 ? 'success' : 'warning'"
                effect="light"
                size="default"
                class="value-tag"
            >{{ v.value }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right" align="center">
        <template #default="{ row }">
          <el-button type="primary" link :icon="Edit" :disabled="loading"
                     @click="emit('edit', row as PlatformAttrWithValues)">编辑
          </el-button>
          <el-button type="danger" link :icon="Delete" :disabled="loading"
                     @click="emit('delete', row as PlatformAttrWithValues)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :disabled="loading"
          @size-change="emit('size-change')"
          @current-change="emit('current-change')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {Edit, Delete} from '@element-plus/icons-vue'
import type {PlatformAttrWithValues} from '@/types'

defineProps<{
  tableData: PlatformAttrWithValues[]
  loading: boolean
  selectedLevel3Id?: number | undefined
  total: number
}>()

// 分页：父组件通过 v-model:page / v-model:page-size 双向绑定
// required: true 让类型从 number|undefined 收窄为 number，避免模板里算术报错
const page = defineModel<number>('page', {required: true})
const pageSize = defineModel<number>('pageSize', {required: true})

const emit = defineEmits<{
  edit: [row: PlatformAttrWithValues]
  delete: [row: PlatformAttrWithValues]
  'size-change': []
  'current-change': []
}>()
</script>

<style scoped>
.table-card {
  padding: 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.value-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.value-tag {
  margin-right: 0 !important;
}
</style>
