<template>
  <div class="platform-attr-page">

    <!-- 顶部：三下拉级联分类 + 搜索 + 新增按钮 -->
    <div class="toolbar">
      <div class="category-cascader">
        <el-select
          v-model="selectedLevel1Id"
          placeholder="请选择一级分类"
          style="width: 180px"
          :disabled="loadingCategory"
          @change="handleLevel1Change"
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
          @change="handleLevel2Change"
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
          @change="handleLevel3Change"
        >
          <el-option
            v-for="c in level3Categories"
            :key="c.id"
            :label="c.name"
            :value="c.id"
          />
        </el-select>
      </div>

      <div class="toolbar-right">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="属性名称">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入属性名称"
              clearable
              style="width: 180px"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="searchForm.status"
              placeholder="全部"
              clearable
              style="width: 120px"
            >
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" :loading="loading" @click="handleSearch">搜索</el-button>
            <el-button :icon="RefreshRight" :disabled="loading" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>

        <el-button
          type="primary"
          :icon="Plus"
          :disabled="!selectedLevel3Id || loading"
          @click="handleAdd"
        >+ 添加平台属性</el-button>
      </div>
    </div>

    <!-- 表格 -->
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
          {{ (pagination.page - 1) * pagination.pageSize + $index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="属性名称" min-width="160" />
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
            >{{ v.value }}</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right" align="center">
        <template #default="{ row }">
          <el-button type="primary" link :icon="Edit" :disabled="loading" @click="handleEdit(row as PlatformAttrWithValues)">编辑</el-button>
          <el-button type="danger" link :icon="Delete" :disabled="loading" @click="handleDelete(row as PlatformAttrWithValues)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        :disabled="loading"
        @size-change="handleSearch"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="620px"
      @closed="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="90px"
      >
        <el-form-item label="所属分类">
          <div class="category-readonly">{{ categoryPathLabel }}</div>
        </el-form-item>
        <el-form-item label="属性名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入属性名称" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="属性值" prop="values">
          <div class="values-editor">
            <el-input
              v-model="valueDraft"
              placeholder="回车或点击「+ 添加」加入"
              size="default"
              style="width: 300px"
              clearable
              @keyup.enter="handleAddValue"
            />
            <el-button type="primary" :icon="Plus" style="margin-left: 8px" @click="handleAddValue">添加</el-button>

            <div class="values-tags">
              <el-tag
                v-for="(v, idx) in form.values"
                :key="idx"
                :type="idx % 2 === 0 ? 'success' : 'warning'"
                effect="light"
                closable
                class="value-tag"
                @close="form.values.splice(idx, 1)"
              >{{ v }}</el-tag>
            </div>
            <div v-if="form.values.length === 0" class="form-tip">请至少添加一个属性值</div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :disabled="submitting" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  RefreshRight,
  Plus,
  Edit,
  Delete,
} from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Category, PlatformAttrWithValues } from '@/types'
import { frontierService } from '@/api'

// ---------- 三下拉级联 ----------
const level1Categories = ref<Category[]>([])
const level2Categories = ref<Category[]>([])
const level3Categories = ref<Category[]>([])
const selectedLevel1Id = ref<number | undefined>(undefined)
const selectedLevel2Id = ref<number | undefined>(undefined)
const selectedLevel3Id = ref<number | undefined>(undefined)
const loadingCategory = ref(false)

const loadCategories = async (level: 1 | 2 | 3, parentId: number | undefined): Promise<Category[]> => {
  loadingCategory.value = true
  try {
    return await frontierService.listCategory({ level, parentId })
  } finally {
    loadingCategory.value = false
  }
}

const handleLevel1Change = async () => {
  selectedLevel2Id.value = undefined
  selectedLevel3Id.value = undefined
  level2Categories.value = []
  level3Categories.value = []
  if (selectedLevel1Id.value != null) {
    level2Categories.value = await loadCategories(2, selectedLevel1Id.value)
  }
  // 一级变化，刷新属性列表（通常为空，因为属性只绑三级）
  pagination.page = 1
  loadList()
}

const handleLevel2Change = async () => {
  selectedLevel3Id.value = undefined
  level3Categories.value = []
  if (selectedLevel2Id.value != null) {
    level3Categories.value = await loadCategories(3, selectedLevel2Id.value)
  }
  pagination.page = 1
  loadList()
}

const handleLevel3Change = () => {
  pagination.page = 1
  loadList()
}

// ---------- 搜索 ----------
const searchForm = reactive({
  name: '',
  status: undefined as number | undefined,
})

const handleSearch = () => {
  pagination.page = 1
  loadList()
}
const handleReset = () => {
  searchForm.name = ''
  searchForm.status = undefined
  pagination.page = 1
  loadList()
}

// ---------- 分页 / 表格 ----------
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const tableData = ref<PlatformAttrWithValues[]>([])
const loading = ref(false)
const submitting = ref(false)

const loadList = async () => {
  // 平台属性只绑定三级分类：未选中三级时，不请求接口，直接展示空表
  if (selectedLevel3Id.value == null) {
    tableData.value = []
    pagination.total = 0
    return
  }
  loading.value = true
  try {
    const result = await frontierService.listPlatformAttr({
      categoryId: selectedLevel3Id.value,
      name: searchForm.name || undefined,
      status: searchForm.status,
      page: pagination.page,
      pageSize: pagination.pageSize,
    })
    tableData.value = result.list
    pagination.total = Number(result.total)
  } catch (e: any) {
    ElMessage.error(e?.message || '加载平台属性失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = () => loadList()

// ---------- 新增 / 编辑 ----------
const dialogVisible = ref(false)
const isEditing = ref(false)
const editingId = ref<number | undefined>(undefined)

const form = reactive<{
  name: string
  sort: number
  status: number
  values: string[]
}>({
  name: '',
  sort: 0,
  status: 1,
  values: [],
})

const valueDraft = ref('')

const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入属性名称', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' },
  ],
  values: [
    {
      validator: (_rule, cb) => {
        // 此处 value 会拿 form.values 也能，直接用 reactive form 判断
        if (!form.values || form.values.length === 0) {
          cb(new Error('请至少添加一个属性值'))
        } else {
          cb()
        }
      },
      trigger: 'change',
    },
  ],
})

const formRef = ref<FormInstance>()

const dialogTitle = computed(() => (isEditing.value ? '编辑平台属性' : '新增平台属性'))

const categoryPathLabel = computed(() => {
  const l1 = level1Categories.value.find(c => c.id === selectedLevel1Id.value)?.name ?? '-'
  const l2 = level2Categories.value.find(c => c.id === selectedLevel2Id.value)?.name ?? '-'
  const l3 = level3Categories.value.find(c => c.id === selectedLevel3Id.value)?.name ?? '-'
  return `${l1} / ${l2} / ${l3}`
})

const handleAdd = () => {
  if (!selectedLevel3Id.value) {
    ElMessage.warning('请先选中三级分类后再添加平台属性')
    return
  }
  isEditing.value = false
  editingId.value = undefined
  resetForm()
  dialogVisible.value = true
}

const handleEdit = async (row: PlatformAttrWithValues) => {
  isEditing.value = true
  editingId.value = row.id
  resetForm()
  // 先取详情（虽然 row 已经带 values，但为了接口一致性走一次）
  try {
    const detail = await frontierService.getPlatformAttrById(Number(row.id))
    form.name = detail.name
    form.sort = detail.sort ?? 0
    form.status = detail.status ?? 1
    form.values = detail.values.map(v => v.value)
    // 如果当前三级分类不是详情的分类，尽量把分类下拉定位到对应项，用户直观
    if (detail.categoryId !== selectedLevel3Id.value) {
      const matchedL3 = level3Categories.value.find(c => c.id === detail.categoryId)
      if (matchedL3) {
        selectedLevel3Id.value = detail.categoryId
      }
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '加载属性详情失败')
    return
  }
  dialogVisible.value = true
}

const handleAddValue = () => {
  const v = valueDraft.value.trim()
  if (!v) return
  if (form.values.includes(v)) {
    ElMessage.warning('该属性值已存在')
    return
  }
  form.values.push(v)
  valueDraft.value = ''
  // 手动触发 values 的 rules 校验
  formRef.value?.validateField('values').catch(() => {})
}

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  if (!selectedLevel3Id.value) {
    ElMessage.warning('请先选中三级分类')
    return
  }

  submitting.value = true
  try {
    if (isEditing.value && editingId.value != null) {
      await frontierService.updatePlatformAttr({
        id: editingId.value,
        name: form.name,
        categoryId: selectedLevel3Id.value,
        sort: form.sort,
        status: form.status,
        values: [...form.values],
      })
      ElMessage.success('编辑成功')
    } else {
      await frontierService.createPlatformAttr({
        name: form.name,
        categoryId: selectedLevel3Id.value,
        sort: form.sort,
        status: form.status,
        values: [...form.values],
      })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    loadList()
  } catch (e: any) {
    ElMessage.error(e?.message || (isEditing.value ? '编辑失败' : '新增失败'))
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (row: PlatformAttrWithValues) => {
  try {
    await ElMessageBox.confirm(
      `确认删除平台属性「${row.name}」吗？该操作会同步删除其下所有属性值。`,
      '提示',
      { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }
    )
  } catch {
    return
  }
  try {
    await frontierService.deletePlatformAttrById(Number(row.id))
    ElMessage.success('删除成功')
    loadList()
  } catch (e: any) {
    ElMessage.error(e?.message || '删除失败')
  }
}

const resetForm = () => {
  form.name = ''
  form.sort = 0
  form.status = 1
  form.values = []
  valueDraft.value = ''
  formRef.value?.resetFields()
}

// 当搜索条件变化（比如 name）且未走搜索按钮时，也允许 values 校验立即生效（rules trigger change）
watch(() => form.values.length, () => {
  if (dialogVisible.value) {
    formRef.value?.validateField('values').catch(() => {})
  }
})

// ---------- 初始化 ----------
onMounted(async () => {
  level1Categories.value = await loadCategories(1, undefined)
  loadList()
})
</script>

<style scoped>
.platform-attr-page {
  padding: 16px;
}

.toolbar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
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

.value-tags,
.values-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.value-tag {
  margin-right: 0 !important;
}

.values-tags {
  margin-top: 12px;
}

.values-editor {
  display: flex;
  flex-direction: column;
}

.values-editor > :first-child {
  display: flex;
  align-items: center;
}

.form-tip {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
}

.category-readonly {
  line-height: 32px;
  color: #303133;
  background: #f5f7fa;
  padding: 0 10px;
  border-radius: 4px;
  display: inline-block;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
