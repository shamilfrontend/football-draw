const STORAGE_KEYS = {
  PLAYERS: 'football-draw-players',
  TEAMS: 'football-draw-teams'
}

export const storage = {
  savePlayers(players) {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players))
    } catch (error) {
      console.error('Ошибка сохранения игроков:', error)
    }
  },

  loadPlayers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLAYERS)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Ошибка загрузки игроков:', error)
      return []
    }
  },

  saveTeams(teams) {
    try {
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams))
    } catch (error) {
      console.error('Ошибка сохранения команд:', error)
    }
  },

  loadTeams() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEAMS)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Ошибка загрузки команд:', error)
      return []
    }
  },

  clearAll() {
    try {
      localStorage.removeItem(STORAGE_KEYS.PLAYERS)
      localStorage.removeItem(STORAGE_KEYS.TEAMS)
    } catch (error) {
      console.error('Ошибка очистки хранилища:', error)
    }
  }
}

