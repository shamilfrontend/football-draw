<template>
  <div class="app-container">
    <el-container>
      <el-header class="app-header">
        <h1>⚽ Футбольная жеребьевка ⚽</h1>
      </el-header>
      <el-main class="app-main">
        <div class="top-section">
          <PlayersManager v-model="players" />
          <TeamsManager v-model="teams" />
          <el-card class="action-card">
            <el-button
              type="success"
              size="large"
              @click="startTournament"
              :disabled="players.length !== 8 || teams.length !== 8"
              class="start-button"
            >
              Начать жеребьевку
            </el-button>
            <div v-if="players.length !== 8 || teams.length !== 8" class="hint">
              Добавьте 8 игроков и 8 команд для начала жеребьевки
            </div>
          </el-card>
        </div>
        <div class="bracket-section">
          <TournamentBracket
            ref="bracketRef"
            :players="players"
            :teams="teams"
            @matchFinished="handleMatchFinished"
          />
          <TopScorers
            :matches="bracketMatches"
            :players="players"
            :teams="teams"
          />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import PlayersManager from './components/PlayersManager.vue'
import TeamsManager from './components/TeamsManager.vue'
import TournamentBracket from './components/TournamentBracket.vue'
import TopScorers from './components/TopScorers.vue'
import { ElMessage } from 'element-plus'
import { storage } from './utils/storage.js'

const players = ref([])
const teams = ref([])
const bracketRef = ref(null)
const bracketMatches = ref([])

// Загрузка из LocalStorage при инициализации
onMounted(() => {
  const savedPlayers = storage.loadPlayers()
  const savedTeams = storage.loadTeams()
  
  if (savedPlayers.length > 0) {
    players.value = savedPlayers
  }
  
  if (savedTeams.length > 0) {
    teams.value = savedTeams
  }
})

// Сохранение в LocalStorage при изменении
watch(players, (newVal) => {
  storage.savePlayers(newVal)
}, { deep: true })

watch(teams, (newVal) => {
  storage.saveTeams(newVal)
}, { deep: true })

const startTournament = () => {
  if (players.value.length !== 8 || teams.value.length !== 8) {
    ElMessage.warning('Необходимо добавить 8 игроков и 8 команд')
    return
  }

  if (bracketRef.value) {
    bracketRef.value.generateBracket()
    // Обновляем данные после генерации сетки
    setTimeout(() => {
      if (bracketRef.value) {
        bracketMatches.value = JSON.parse(JSON.stringify(bracketRef.value.getBracket()))
      }
    }, 100)
    ElMessage.success('Жеребьевка началась!')
  }
}

const handleMatchFinished = () => {
  // Обновляем данные бомбардиров после завершения матча
  if (bracketRef.value) {
    bracketMatches.value = JSON.parse(JSON.stringify(bracketRef.value.getBracket()))
  }
}
</script>

<style scoped lang="scss">
.app-container {
  width: 100%;
  margin: 0;
}

.app-header {
  text-align: center;
  padding: 30px 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  margin-bottom: 30px;

  h1 {
    color: white;
    font-size: 32px;
    font-weight: 700;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  @media (max-width: 768px) {
    padding: 20px 0;
    margin-bottom: 20px;

    h1 {
      font-size: 24px;
    }
  }
}

.app-main {
  padding: 0;
  width: 100%;
}

.top-section {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;

  @media (max-width: 1024px) {
    flex-direction: column;
    gap: 15px;
    margin-bottom: 20px;
  }

  @media (max-width: 768px) {
    gap: 10px;
    margin-bottom: 15px;
  }
}

.action-card {
  flex: 1;
  min-width: 250px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .start-button {
    width: 100%;
    height: 50px;
    font-size: 18px;
    font-weight: 600;
  }

  .hint {
    margin-top: 15px;
    text-align: center;
    color: #909399;
    font-size: 14px;
  }

  @media (max-width: 768px) {
    min-width: 100%;

    .start-button {
      height: 45px;
      font-size: 16px;
    }

    .hint {
      font-size: 12px;
      margin-top: 10px;
    }
  }
}

.bracket-section {
  width: 100%;
  min-height: 400px;
}
</style>
