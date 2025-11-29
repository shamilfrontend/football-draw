<template>
  <el-card class="bracket-card" v-if="bracket.length > 0">
    <template #header>
      <div class="card-header">
        <span>Турнирная сетка</span>
        <el-button @click="handleReset" type="danger" size="small">Сбросить</el-button>
      </div>
    </template>
    <div class="bracket-container">
      <div
        v-for="(round, roundIndex) in bracket"
        :key="roundIndex"
        class="bracket-round"
      >
        <div class="round-title">
          {{ getRoundTitle(roundIndex, bracket.length) }}
        </div>
        <div class="round-matches">
          <div
            v-for="(match, matchIndex) in round"
            :key="matchIndex"
            class="match"
          >
            <div class="match-content">
              <div
                class="match-team"
                :class="{
                  'winner': match.winner === match.team1
                }"
              >
                {{ match.team1 || 'TBD' }}
              </div>
              <div class="match-score">
                <el-input-number
                  v-model="match.score1"
                  :min="0"
                  :max="99"
                  :disabled="!!match.winner"
                  size="small"
                  controls-position="right"
                  @change="updateScore(roundIndex, matchIndex)"
                  class="score-input"
                  placeholder="0"
                />
                <span class="score-separator">:</span>
                <el-input-number
                  v-model="match.score2"
                  :min="0"
                  :max="99"
                  :disabled="!!match.winner"
                  size="small"
                  controls-position="right"
                  @change="updateScore(roundIndex, matchIndex)"
                  class="score-input"
                  placeholder="0"
                />
                <span v-if="match.winner && match.penalty1 !== null && match.penalty2 !== null" class="penalty-display">
                  (пен. {{ match.penalty1 }}:{{ match.penalty2 }})
                </span>
              </div>
              <div
                class="match-team"
                :class="{
                  'winner': match.winner === match.team2
                }"
              >
                {{ match.team2 || 'TBD' }}
              </div>
            </div>
            <div v-if="!match.winner && match.score1 !== null && match.score2 !== null && match.score1 === match.score2" class="match-penalties">
              <div class="penalties-label">Пенальти:</div>
              <div class="penalties-inputs">
                <el-input-number
                  v-model="match.penalty1"
                  :min="0"
                  :max="20"
                  size="small"
                  controls-position="right"
                  class="penalty-input"
                  placeholder="0"
                />
                <span class="score-separator">:</span>
                <el-input-number
                  v-model="match.penalty2"
                  :min="0"
                  :max="20"
                  size="small"
                  controls-position="right"
                  class="penalty-input"
                  placeholder="0"
                />
              </div>
            </div>
            <div v-if="!match.winner" class="match-status">
              <el-button
                size="small"
                type="primary"
                @click="confirmScore(roundIndex, matchIndex)"
                :disabled="match.score1 === null || match.score2 === null || (match.score1 === match.score2 && (match.penalty1 === null || match.penalty2 === null || match.penalty1 === match.penalty2))"
              >
                Подтвердить счет
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="champion" class="champion">
      <el-divider>🏆 ЧЕМПИОН 🏆</el-divider>
      <div class="champion-name">{{ champion }}</div>
    </div>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  players: {
    type: Array,
    default: () => []
  },
  teams: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['matchFinished'])

const bracket = ref([])
const champion = ref('')

const generateBracket = () => {
  if (props.players.length !== 8 || props.teams.length !== 8) {
    return
  }

  // Перемешиваем игроков и команды отдельно
  const shuffledPlayers = [...props.players].sort(() => Math.random() - 0.5)
  const shuffledTeams = [...props.teams].sort(() => Math.random() - 0.5)

  // Создаем пары: случайный игрок + случайная команда
  const pairs = []
  for (let i = 0; i < 8; i++) {
    pairs.push(`${shuffledPlayers[i]} (${shuffledTeams[i]})`)
  }

  // Перемешиваем пары для жеребьевки
  const shuffled = [...pairs].sort(() => Math.random() - 0.5)

  // Создаем первый раунд (четвертьфиналы)
  const firstRound = []
  for (let i = 0; i < shuffled.length; i += 2) {
    firstRound.push({
      team1: shuffled[i],
      team2: shuffled[i + 1],
      score1: null,
      score2: null,
      penalty1: null,
      penalty2: null,
      winner: null
    })
  }

  bracket.value = [firstRound]
  champion.value = ''
}


const updateScore = (roundIndex, matchIndex) => {
  const match = bracket.value[roundIndex][matchIndex]
  
  // Если счет равный, сбрасываем пенальти
  if (match.score1 !== null && match.score2 !== null && match.score1 !== match.score2) {
    match.penalty1 = null
    match.penalty2 = null
  }
}

const confirmScore = (roundIndex, matchIndex) => {
  const match = bracket.value[roundIndex][matchIndex]
  
  if (match.score1 === null || match.score2 === null) {
    ElMessage.warning('Введите счет для обеих команд')
    return
  }

  // Если счет равный, проверяем пенальти
  if (match.score1 === match.score2) {
    if (match.penalty1 === null || match.penalty2 === null) {
      ElMessage.warning('При ничейном результате необходимо ввести счет пенальти')
      return
    }
    
    if (match.penalty1 === match.penalty2) {
      ElMessage.warning('Счет пенальти не может быть равным. Введите другой счет.')
      return
    }

    // Определяем победителя по пенальти
    match.winner = match.penalty1 > match.penalty2 ? match.team1 : match.team2
  } else {
    // Определяем победителя по счету
    match.winner = match.score1 > match.score2 ? match.team1 : match.team2
  }
  
  // Эмитим событие для обновления бомбардиров
  emit('matchFinished', {
    roundIndex,
    matchIndex,
    team1: match.team1,
    team2: match.team2,
    score1: match.score1,
    score2: match.score2,
    penalty1: match.penalty1,
    penalty2: match.penalty2,
    winner: match.winner
  })
  
  finishMatch(roundIndex, matchIndex)
}

const finishMatch = (roundIndex, matchIndex) => {
  // Проверяем, все ли матчи в текущем раунде завершены
  const currentRound = bracket.value[roundIndex]
  const allMatchesFinished = currentRound.every(m => m.winner)

  if (allMatchesFinished) {
    // Если это последний раунд и остался один победитель - это чемпион
    if (currentRound.length === 1) {
      champion.value = currentRound[0].winner
    } else {
      // Создаем следующий раунд
      createNextRound(roundIndex)
    }
  }
}

const createNextRound = (currentRoundIndex) => {
  const currentRound = bracket.value[currentRoundIndex]
  const winners = currentRound.map(match => match.winner)

  if (winners.length === 1) {
    champion.value = winners[0]
    return
  }

  const nextRound = []
  for (let i = 0; i < winners.length; i += 2) {
    nextRound.push({
      team1: winners[i],
      team2: winners[i + 1],
      score1: null,
      score2: null,
      penalty1: null,
      penalty2: null,
      winner: null
    })
  }

  bracket.value.push(nextRound)
}

const handleReset = async () => {
  try {
    await ElMessageBox.confirm(
      'Вы уверены, что хотите сбросить турнирную сетку? Все результаты будут потеряны.',
      'Подтверждение сброса',
      {
        confirmButtonText: 'Сбросить',
        cancelButtonText: 'Отмена',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    resetBracket()
    ElMessage.success('Турнирная сетка сброшена')
  } catch {
    // Пользователь отменил действие
  }
}

const resetBracket = () => {
  bracket.value = []
  champion.value = ''
  generateBracket()
}

const getRoundTitle = (roundIndex, totalRounds) => {
  const titles = ['Четвертьфинал', 'Полуфинал', 'Финал']
  return titles[roundIndex] || `Раунд ${roundIndex + 1}`
}

defineExpose({
  generateBracket,
  getBracket: () => bracket.value
})
</script>

<style scoped lang="scss">
.bracket-card {
  margin-top: 20px;
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 18px;
}

.bracket-container {
  display: flex;
  gap: 30px;
  overflow-x: auto;
  padding: 20px 0;
  justify-content: flex-start;
  width: 100%;

  @media (max-width: 1024px) {
    gap: 20px;
    padding: 15px 0;
  }

  @media (max-width: 768px) {
    gap: 15px;
    padding: 10px 0;
    flex-direction: column;
    overflow-x: visible;
  }
}

.bracket-round {
  min-width: 250px;

  @media (max-width: 768px) {
    min-width: 100%;
    width: 100%;
  }
}

.round-title {
  text-align: center;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 15px;
  color: #409eff;

  @media (max-width: 768px) {
    font-size: 14px;
    margin-bottom: 10px;
  }
}

.round-matches {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.match {
  background: white;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 140px;
  justify-content: center;
  transition: all 0.3s;

  &:hover {
    border-color: #409eff;
    box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
  }

  @media (max-width: 768px) {
    padding: 12px;
    gap: 10px;
    min-height: auto;
  }
}

.match-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
}

.match-team {
  flex: 1;
  padding: 12px;
  text-align: center;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.3s;
  min-width: 0;
  word-break: break-word;

  &.winner {
    background: #67c23a;
    color: white;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 10px;
    font-size: 14px;
  }
}

.match-score {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-shrink: 0;
  flex-wrap: wrap;

  .score-input {
    width: 70px;

    @media (max-width: 768px) {
      width: 60px;
    }
  }

  .score-separator {
    font-size: 20px;
    font-weight: 700;
    color: #409eff;
    margin: 0 5px;

    @media (max-width: 768px) {
      font-size: 18px;
      margin: 0 3px;
    }
  }

  .penalty-display {
    font-size: 12px;
    color: #e6a23c;
    font-weight: 600;
    margin-left: 8px;

    @media (max-width: 768px) {
      font-size: 10px;
      margin-left: 5px;
      width: 100%;
      text-align: center;
      margin-top: 5px;
    }
  }

  @media (max-width: 768px) {
    width: 100%;
    gap: 5px;
  }
}

.match-penalties {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 10px 0;
  padding: 10px;
  background: #fff7e6;
  border-radius: 6px;
  border: 1px solid #e6a23c;
  flex-wrap: wrap;

  .penalties-label {
    font-weight: 600;
    font-size: 14px;
    color: #e6a23c;

    @media (max-width: 768px) {
      font-size: 12px;
      width: 100%;
      text-align: center;
    }
  }

  .penalties-inputs {
    display: flex;
    align-items: center;
    gap: 8px;

    .penalty-input {
      width: 60px;

      @media (max-width: 768px) {
        width: 50px;
      }
    }
  }

  @media (max-width: 768px) {
    padding: 8px;
    gap: 8px;
  }
}

.match-status {
  display: flex;
  justify-content: center;
  margin-top: 5px;
}

.champion {
  margin-top: 30px;
  text-align: center;
  padding: 20px;

  .champion-name {
    font-size: 24px;
    font-weight: 700;
    color: #e6a23c;
    margin-top: 15px;
  }

  @media (max-width: 768px) {
    margin-top: 20px;
    padding: 15px;

    .champion-name {
      font-size: 20px;
      margin-top: 10px;
    }
  }
}
</style>

