<template>
  <div class="platform-attr-page">

    <!-- 顶部：三下拉级联分类 + 搜索 + 新增按钮 -->
    <AttrToolbar
        v-model:selected-level-1-id="selectedLevel1Id"
        v-model:selected-level-2-id="selectedLevel2Id"
        v-model:selected-level-3-id="selectedLevel3Id"
        v-model:search-name="searchForm.name"
        v-model:search-status="searchForm.status"
        :level1-categories="level1Categories"
        :level2-categories="level2Categories"
        :level3-categories="level3Categories"
        :loading-category="loadingCategory"
        :loading="loading"
        :can-add="!!selectedLevel3Id"
        @level1-change="handleLevel1Change"
        @level2-change="handleLevel2Change"
        @level3-change="handleLevel3Change"
        @search="handleSearch"
        @reset="handleReset"
        @add="handleAdd"
    />

    <!-- 表格 + 分页 -->
    <AttrTable
        v-model:page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :table-data="tableData"
        :loading="loading"
        :selected-level-3-id="selectedLevel3Id"
        :total="pagination.total"
        @edit="handleEdit"
        @delete="handleDelete"
        @size-change="handleSearch"
        @current-change="handlePageChange"
    />

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
          <el-input v-model="form.name" placeholder="请输入属性名称" maxlength="50" show-word-limit/>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="9999"/>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0"/>
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
              >{{ v }}
              </el-tag>
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
import {ref, reactive, computed, onMounted, watch} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {Plus} from '@element-plus/icons-vue'
import type {FormInstance, FormRules} from 'element-plus'
import type {Category, PlatformAttrWithValues} from '@/types'
import {frontierService} from '@/api'
import AttrToolbar from './components/AttrToolbar.vue'
import AttrTable from './components/AttrTable.vue'

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
    return await frontierService.listCategory({level, parentId})
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
const pagination = reactive({page: 1, pageSize: 10, total: 0})
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
    {required: true, message: '请输入属性名称', trigger: 'blur'},
    {min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur'},
  ],
  values: [
    {
      validator: (_rule, _value, cb) => {
        // 直接用 reactive form 判断
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

const handleEdit = (row: PlatformAttrWithValues) => {
  isEditing.value = true
  editingId.value = row.id
  resetForm()
  // row 本身已带 values 和 categoryId，直接填充表单，省去一次后端请求
  form.name = row.name
  form.sort = row.sort ?? 0
  form.status = row.status ?? 1
  form.values = row.values.map(v => v.value)
  // 如果当前三级分类不是该属性所属分类，尽量把分类下拉定位到对应项，用户直观
  if (row.categoryId !== selectedLevel3Id.value) {
    const matchedL3 = level3Categories.value.find(c => c.id === row.categoryId)
    if (matchedL3) {
      selectedLevel3Id.value = row.categoryId
    }
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
  formRef.value?.validateField('values').catch(() => {
  })
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
        {type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消'}
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
    formRef.value?.validateField('values').catch(() => {
    })
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

.values-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.value-tag {
  margin-right: 0 !important;
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
</style>
