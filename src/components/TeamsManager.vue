<template>
  <el-card class="teams-card">
    <template #header>
      <div class="card-header">
        <span>Команды ({{ teams.length }}/8)</span>
      </div>
    </template>
    <div class="teams-content">
      <el-input
        v-model="newTeam"
        placeholder="Введите название команды"
        @keyup.enter="addTeam"
        :disabled="teams.length >= 8"
        class="team-input"
      >
        <template #append>
          <el-button
            @click="addTeam"
            :disabled="teams.length >= 8 || !newTeam.trim()"
            type="primary"
          >
            Добавить
          </el-button>
        </template>
      </el-input>
      <div class="teams-list">
        <el-tag
          v-for="(team, index) in teams"
          :key="index"
          closable
          @close="removeTeam(index)"
          class="team-tag"
          type="success"
        >
          <span v-if="editingIndex !== index" @dblclick="startEdit(index)">{{ team }}</span>
          <el-input
            v-else
            v-model="editingValue"
            @blur="finishEdit(index)"
            @keyup.enter="finishEdit(index)"
            @keyup.esc="cancelEdit"
            size="small"
            class="edit-input"
          />
        </el-tag>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const newTeam = ref('')
const teams = ref([...props.modelValue])
const editingIndex = ref(-1)
const editingValue = ref('')

watch(() => props.modelValue, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(teams.value)) {
    teams.value = [...newVal]
  }
}, { deep: true })

const addTeam = () => {
  if (teams.value.length < 8 && newTeam.value.trim()) {
    const updated = [...teams.value, newTeam.value.trim()]
    teams.value = updated
    emit('update:modelValue', updated)
    newTeam.value = ''
  }
}

const removeTeam = (index) => {
  if (editingIndex.value === index) {
    cancelEdit()
  }
  const updated = teams.value.filter((_, i) => i !== index)
  teams.value = updated
  emit('update:modelValue', updated)
}

const startEdit = (index) => {
  editingIndex.value = index
  editingValue.value = teams.value[index]
}

const finishEdit = (index) => {
  if (editingValue.value.trim() && editingValue.value.trim() !== teams.value[index]) {
    const updated = [...teams.value]
    updated[index] = editingValue.value.trim()
    teams.value = updated
    emit('update:modelValue', updated)
  }
  cancelEdit()
}

const cancelEdit = () => {
  editingIndex.value = -1
  editingValue.value = ''
}
</script>

<style scoped lang="scss">
.teams-card {
  flex: 1;
  min-width: 300px;
  height: 100%;

  @media (max-width: 1024px) {
    min-width: 100%;
  }

  @media (max-width: 768px) {
    min-width: 100%;
  }
}

.card-header {
  font-weight: 600;
  font-size: 18px;

  @media (max-width: 768px) {
    font-size: 16px;
  }
}

.teams-content {
  .team-input {
    margin-bottom: 15px;
  }

  .teams-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    min-height: 40px;
  }

  .team-tag {
    font-size: 14px;
    padding: 8px 12px;
    cursor: pointer;

    span {
      user-select: none;
    }

    .edit-input {
      width: 100px;
    }

    @media (max-width: 768px) {
      font-size: 12px;
      padding: 6px 10px;

      .edit-input {
        width: 80px;
      }
    }
  }
}
</style>

