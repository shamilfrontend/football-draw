<template>
  <el-card class="players-card">
    <template #header>
      <div class="card-header">
        <span>Игроки ({{ players.length }}/8)</span>
      </div>
    </template>
    <div class="players-content">
      <el-input
        v-model="newPlayer"
        placeholder="Введите имя игрока"
        @keyup.enter="addPlayer"
        :disabled="players.length >= 8"
        class="player-input"
      >
        <template #append>
          <el-button
            @click="addPlayer"
            :disabled="players.length >= 8 || !newPlayer.trim()"
            type="primary"
          >
            Добавить
          </el-button>
        </template>
      </el-input>
      <div class="players-list">
        <el-tag
          v-for="(player, index) in players"
          :key="index"
          closable
          @close="removePlayer(index)"
          class="player-tag"
        >
          <span v-if="editingIndex !== index" @dblclick="startEdit(index)">{{ player }}</span>
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

const newPlayer = ref('')
const players = ref([...props.modelValue])
const editingIndex = ref(-1)
const editingValue = ref('')

watch(() => props.modelValue, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(players.value)) {
    players.value = [...newVal]
  }
}, { deep: true })

const addPlayer = () => {
  if (players.value.length < 8 && newPlayer.value.trim()) {
    const updated = [...players.value, newPlayer.value.trim()]
    players.value = updated
    emit('update:modelValue', updated)
    newPlayer.value = ''
  }
}

const removePlayer = (index) => {
  if (editingIndex.value === index) {
    cancelEdit()
  }
  const updated = players.value.filter((_, i) => i !== index)
  players.value = updated
  emit('update:modelValue', updated)
}

const startEdit = (index) => {
  editingIndex.value = index
  editingValue.value = players.value[index]
}

const finishEdit = (index) => {
  if (editingValue.value.trim() && editingValue.value.trim() !== players.value[index]) {
    const updated = [...players.value]
    updated[index] = editingValue.value.trim()
    players.value = updated
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
.players-card {
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

.players-content {
  .player-input {
    margin-bottom: 15px;
  }

  .players-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    min-height: 40px;
  }

  .player-tag {
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

