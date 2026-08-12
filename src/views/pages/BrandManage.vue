<template>
  <div class="brand-page">
    <!-- 搜索和操作栏 -->
    <div class="toolbar">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="品牌名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入品牌名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="全部"
            clearable
            style="width: 140px"
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
      <el-button type="primary" :icon="Plus" :disabled="loading" @click="handleAdd">新增品牌</el-button>
    </div>

    <!-- 品牌列表表格 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      border
      stripe
      style="width: 100%"
    >
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="logo" label="品牌LOGO" width="120" align="center">
        <template #default="{ row }">
          <el-avatar :src="row.logo" shape="square" :size="48" />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="品牌名称" min-width="160" />
      <el-table-column prop="firstLetter" label="首字母" width="100" align="center" />
      <el-table-column label="排序" width="170" align="center">
        <template #default="{ row }">
          <el-input-number
            v-model="row.sort"
            :min="0"
            :max="9999"
            size="small"
            style="width: 140px"
            :disabled="loading"
            @change="handleSortChange(row as Brand)"
          />
        </template>
      </el-table-column>
      <el-table-column label="状态" width="120" align="center">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            :active-value="1"
            :inactive-value="0"
            :disabled="loading"
            @change="handleStatusChange(row as Brand)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right" align="center">
        <template #default="{ row }">
          <el-button type="primary" link :icon="Edit" :disabled="loading" @click="handleEdit(row as Brand)">编辑</el-button>
          <el-button type="danger" link :icon="Delete" :disabled="loading" @click="handleDelete(row as Brand)">删除</el-button>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @closed="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="90px"
      >
        <el-form-item label="品牌名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入品牌名称" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="品牌LOGO" prop="logo">
          <el-input v-model="form.logo" placeholder="请输入LOGO图片URL" />
          <div class="form-tip">示例：https://xxx.com/logo.png（留空使用默认LOGO）</div>
        </el-form-item>
        <el-form-item label="首字母" prop="firstLetter">
          <el-input
            v-model="form.firstLetter"
            placeholder="请输入首字母（A-Z）"
            maxlength="1"
            style="width: 120px"
          />
        </el-form-item>
        <el-form-item label="品牌分类" prop="category">
          <el-select
            v-model="form.category"
            placeholder="请选择品牌分类"
            style="width: 100%"
          >
            <el-option label="服装鞋帽" value="CLOTHING" />
            <el-option label="数码电器" value="ELECTRONICS" />
            <el-option label="食品饮料" value="FOOD" />
            <el-option label="美妆个护" value="BEAUTY" />
            <el-option label="家居生活" value="HOME" />
            <el-option label="其他" value="OTHER" />
          </el-select>
        </el-form-item>
        <el-form-item label="品牌描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入品牌描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  RefreshRight,
  Plus,
  Edit,
  Delete,
} from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Brand } from '@/types'
import { frontierService } from '@/api'

// ---------- 搜索 ----------
const searchForm = reactive({
  name: '',
  status: undefined as number | undefined,
})

// ---------- 分页 ----------
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

// ---------- 表格数据 ----------
const tableData = ref<Brand[]>([])
const loading = ref(false)
const submitting = ref(false)

// 加载列表（支持带搜索条件和分页）
const loadList = async () => {
  loading.value = true
  try {
    const result = await frontierService.listBrand({
      name: searchForm.name || undefined,
      status: searchForm.status,
      page: pagination.page,
      pageSize: pagination.pageSize,
    })
    tableData.value = result.list
    pagination.total = Number(result.total)
  } catch (err) {
    const e = err as { code?: string; description?: string }
    ElMessage.error(e.description || '加载品牌列表失败')
  } finally {
    loading.value = false
  }
}

// ---------- 搜索/重置 ----------
const handleSearch = () => {
  pagination.page = 1
  loadList()
}

const handlePageChange = () => {
  loadList()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.status = undefined
  pagination.page = 1
  loadList()
}

// ---------- 排序修改 ----------
const handleSortChange = async (row: Brand) => {
  if (row.id == null) return
  try {
    await frontierService.updateBrandSort({ id: row.id, sort: row.sort ?? 0 })
    ElMessage.success(`品牌【${row.name}】排序已更新为：${row.sort}`)
    loadList()
  } catch (err) {
    const e = err as { code?: string; description?: string }
    ElMessage.error(e.description || '更新排序失败')
    loadList() // 失败回滚本地值
  }
}

// ---------- 启用/禁用切换 ----------
const handleStatusChange = async (row: Brand) => {
  if (row.id == null) return
  const prev = row.status
  try {
    await frontierService.updateBrandStatus({ id: row.id, status: row.status as number })
    ElMessage.success(`品牌【${row.name}】已${row.status === 1 ? '启用' : '禁用'}`)
  } catch (err) {
    const e = err as { code?: string; description?: string }
    ElMessage.error(e.description || '更新状态失败')
    row.status = prev // 回滚
  }
}

// ---------- 新增/编辑弹窗 ----------
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const isEdit = ref(false)
const editId = ref<number | null>(null)

const dialogTitle = computed(() => (isEdit.value ? '编辑品牌' : '新增品牌'))

interface BrandForm {
  name: string
  logo: string
  firstLetter: string
  category: string
  description: string
  sort: number
  status: 0 | 1
}

const defaultForm = (): BrandForm => ({
  name: '',
  logo: '',
  firstLetter: '',
  category: '',
  description: '',
  sort: 0,
  status: 1,
})

const form = reactive<BrandForm>(defaultForm())

const rules: FormRules = {
  name: [
    { required: true, message: '请输入品牌名称', trigger: 'blur' },
    { min: 2, max: 50, message: '品牌名称长度为 2-50 个字符', trigger: 'blur' },
  ],
  firstLetter: [
    { required: true, message: '请输入首字母（A-Z）', trigger: 'blur' },
    {
      validator: (_rule, value: string, cb) => {
        if (value && !/^[A-Z]$/.test(value)) {
          cb(new Error('首字母必须是单个大写英文字母（A-Z）'))
        } else {
          cb()
        }
      },
      trigger: 'blur',
    },
  ],
  category: [{ required: true, message: '请选择品牌分类', trigger: 'change' }],
  sort: [{ required: true, message: '请输入排序值', trigger: 'blur' }],
}

const resetForm = () => {
  Object.assign(form, defaultForm())
  formRef.value?.clearValidate()
  isEdit.value = false
  editId.value = null
}

const handleAdd = () => {
  resetForm()
  isEdit.value = false
  dialogVisible.value = true
}

const handleEdit = (row: Brand) => {
  resetForm()
  isEdit.value = true
  editId.value = row.id ?? null
  Object.assign(form, {
    name: row.name,
    logo: row.logo || '',
    firstLetter: row.firstLetter,
    category: row.category,
    description: row.description || '',
    sort: row.sort ?? 0,
    status: (row.status ?? 1) as 0 | 1,
  })
  dialogVisible.value = true
}

const handleDelete = (row: Brand) => {
  if (row.id == null) return
  ElMessageBox.confirm(
    `确定要删除品牌【${row.name}】吗？删除后无法恢复。`,
    '提示',
    { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }
  ).then(async () => {
    try {
      await frontierService.deleteBrandById(row.id!)
      ElMessage.success(`品牌【${row.name}】删除成功`)
      loadList()
    } catch (err) {
      const e = err as { code?: string; description?: string }
      ElMessage.error(e.description || '删除失败')
    }
  }).catch(() => {
    // cancelled
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isEdit.value && editId.value !== null) {
      await frontierService.updateBrand({
        id: editId.value,
        name: form.name,
        logo: form.logo || undefined,
        firstLetter: form.firstLetter,
        category: form.category,
        description: form.description || undefined,
        sort: form.sort,
        status: form.status,
      })
      ElMessage.success(`品牌【${form.name}】修改成功`)
    } else {
      await frontierService.createBrand({
        name: form.name,
        logo: form.logo || undefined,
        firstLetter: form.firstLetter,
        category: form.category,
        description: form.description || undefined,
        sort: form.sort,
        status: form.status,
      })
      ElMessage.success(`品牌【${form.name}】新增成功`)
    }
    dialogVisible.value = false
    loadList()
  } catch (err) {
    const e = err as { code?: string; description?: string }
    ElMessage.error(e.description || '提交失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadList()
})
</script>

<style lang="scss" scoped>
.brand-page {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;

    .search-form :deep(.el-form-item) {
      margin-bottom: 0;
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .form-tip {
    margin: 4px 0 0;
    color: #909399;
    font-size: 12px;
  }
}
</style>
