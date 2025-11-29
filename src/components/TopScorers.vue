<template>
  <el-card class="scorers-card" v-if="scorers.length > 0">
    <template #header>
      <div class="card-header">
        <span>🏆 Бомбардиры</span>
      </div>
    </template>
    <div class="scorers-list">
      <div
        v-for="(scorer, index) in sortedScorers"
        :key="index"
        class="scorer-item"
        :class="{ 'top-three': index < 3 }"
      >
        <div class="scorer-rank">
          <span v-if="index === 0" class="medal gold">🥇</span>
          <span v-else-if="index === 1" class="medal silver">🥈</span>
          <span v-else-if="index === 2" class="medal bronze">🥉</span>
          <span v-else class="rank-number">{{ index + 1 }}</span>
        </div>
        <div class="scorer-info">
          <div class="scorer-name">{{ scorer.name }}</div>
          <div class="scorer-team">{{ scorer.team }}</div>
        </div>
        <div class="scorer-goals">
          <span class="goals-count">{{ scorer.goals }}</span>
          <span class="goals-label">{{ getGoalsLabel(scorer.goals) }}</span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  matches: {
    type: Array,
    default: () => []
  },
  players: {
    type: Array,
    default: () => []
  },
  teams: {
    type: Array,
    default: () => []
  }
})

const scorers = ref([])

const sortedScorers = computed(() => {
  return [...scorers.value].sort((a, b) => b.goals - a.goals)
})

const getGoalsLabel = (goals) => {
  const lastDigit = goals % 10
  const lastTwoDigits = goals % 100

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'голов'
  }

  if (lastDigit === 1) {
    return 'гол'
  } else if (lastDigit >= 2 && lastDigit <= 4) {
    return 'гола'
  } else {
    return 'голов'
  }
}

const updateScorers = () => {
  const goalsMap = new Map()

  // Проходим по всем матчам и собираем голы
  props.matches.forEach(round => {
    round.forEach(match => {
      if (match.winner && match.score1 !== null && match.score2 !== null) {
        // Извлекаем имя игрока и команду из строки "Игрок (Команда)"
        const parsePlayer = (str) => {
          const match = str.match(/^(.+?)\s*\((.+?)\)$/)
          if (match) {
            return { name: match[1].trim(), team: match[2].trim() }
          }
          return { name: str, team: '' }
        }

        const player1 = parsePlayer(match.team1)
        const player2 = parsePlayer(match.team2)

        // Добавляем голы
        const key1 = `${player1.name}|${player1.team}`
        const key2 = `${player2.name}|${player2.team}`

        if (!goalsMap.has(key1)) {
          goalsMap.set(key1, { name: player1.name, team: player1.team, goals: 0 })
        }
        if (!goalsMap.has(key2)) {
          goalsMap.set(key2, { name: player2.name, team: player2.team, goals: 0 })
        }

        goalsMap.get(key1).goals += match.score1
        goalsMap.get(key2).goals += match.score2
      }
    })
  })

  scorers.value = Array.from(goalsMap.values())
}

watch(() => props.matches, () => {
  updateScorers()
}, { deep: true, immediate: true })
</script>

<style scoped lang="scss">
.scorers-card {
  margin-top: 20px;
  width: 100%;
}

.card-header {
  font-weight: 600;
  font-size: 18px;
}

.scorers-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.scorer-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  transition: all 0.3s;

  &.top-three {
    background: linear-gradient(135deg, #fef3e2 0%, #fff9e6 100%);
    border: 2px solid #e6a23c;
  }

  &:hover {
    transform: translateX(5px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    gap: 10px;
    padding: 10px;
    flex-wrap: wrap;
  }
}

.scorer-rank {
  width: 40px;
  text-align: center;
  flex-shrink: 0;

  .medal {
    font-size: 24px;
  }

  .rank-number {
    font-weight: 600;
    font-size: 18px;
    color: #909399;
  }
}

.scorer-info {
  flex: 1;
  min-width: 0;

  .scorer-name {
    font-weight: 600;
    font-size: 16px;
    color: #303133;
    margin-bottom: 4px;
    word-break: break-word;
  }

  .scorer-team {
    font-size: 12px;
    color: #909399;
  }

  @media (max-width: 768px) {
    width: 100%;

    .scorer-name {
      font-size: 14px;
    }

    .scorer-team {
      font-size: 11px;
    }
  }
}

.scorer-goals {
  text-align: right;
  flex-shrink: 0;

  .goals-count {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: #409eff;
    line-height: 1;
  }

  .goals-label {
    display: block;
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  @media (max-width: 768px) {
    text-align: left;
    width: 100%;

    .goals-count {
      font-size: 20px;
    }

    .goals-label {
      font-size: 11px;
    }
  }
}
</style>

