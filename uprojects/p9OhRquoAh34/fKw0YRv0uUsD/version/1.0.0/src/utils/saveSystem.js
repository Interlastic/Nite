import { GAME_CONFIG, ACHIEVEMENTS } from './gameConstants';

const STORAGE_KEY = 'tamagotchi_save';
const CEMETERY_KEY = 'tamagotchi_cemetery';
const STATS_KEY = 'tamagotchi_stats';

// Initial game state
export function createInitialState() {
  return {
    // Pet info
    petName: 'Pixie',
    lifeStage: 'egg',
    petState: 'idle',
    age: 0,
    isAlive: true,
    
    // Stats (0-100)
    stats: {
      hunger: 80,
      happiness: 80,
      energy: 80,
      health: 100,
      cleanliness: 100,
    },
    
    // Game state
    isSleeping: false,
    coins: 100,
    inventory: {
      food: ['apple', 'apple', 'apple'],
      toys: ['ball'],
      medicine: ['bandage'],
    },
    decorations: [],
    
    // Achievements & records
    achievements: {},
    gamesPlayed: 0,
    gamesWon: 0,
    totalPurchases: 0,
    totalCleans: 0,
    
    // Lifetime records
    lifetimeStats: {
      totalAge: 0,
      maxAge: 0,
      totalFeeds: 0,
      totalPlays: 0,
      totalCures: 0,
      coinsEarned: 0,
      petsRaised: 0,
    },
    
    // Timestamps
    createdAt: Date.now(),
    lastSaveTime: Date.now(),
    deathTime: null,
    deathCause: null,
  };
}

// Save game state to localStorage
export function saveGame(gameState) {
  try {
    const saveData = {
      ...gameState,
      lastSaveTime: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    return true;
  } catch (error) {
    console.error('Failed to save game:', error);
    return false;
  }
}

// Load game state from localStorage
export function loadGame() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const gameState = JSON.parse(savedData);
      // Ensure all achievements exist
      const achievements = {};
      Object.keys(ACHIEVEMENTS).forEach(key => {
        achievements[key] = gameState.achievements[key] || false;
      });
      return {
        ...gameState,
        achievements,
      };
    }
  } catch (error) {
    console.error('Failed to load game:', error);
  }
  return null;
}

// Delete save data
export function deleteSave() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to delete save:', error);
    return false;
  }
}

// Add pet to cemetery
export function addToCemetery(pet) {
  try {
    const cemetery = loadCemetery();
    cemetery.push({
      name: pet.petName,
      age: pet.age,
      deathCause: pet.deathCause,
      deathTime: pet.deathTime,
      lifeStage: pet.lifeStage,
    });
    localStorage.setItem(CEMETERY_KEY, JSON.stringify(cemetery));
    return true;
  } catch (error) {
    console.error('Failed to add to cemetery:', error);
    return false;
  }
}

// Load cemetery
export function loadCemetery() {
  try {
    const data = localStorage.getItem(CEMETERY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load cemetery:', error);
    return [];
  }
}

// Update lifetime stats
export function updateLifetimeStats(gameState) {
  const stats = {
    ...gameState.lifetimeStats,
    totalAge: gameState.lifetimeStats.totalAge + gameState.age,
    maxAge: Math.max(gameState.lifetimeStats.maxAge, gameState.age),
    coinsEarned: gameState.lifetimeStats.coinsEarned + gameState.coins,
  };
  
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    return stats;
  } catch (error) {
    console.error('Failed to save stats:', error);
    return gameState.lifetimeStats;
  }
}

// Load lifetime stats
export function loadLifetimeStats() {
  try {
    const data = localStorage.getItem(STATS_KEY);
    return data ? JSON.parse(data) : {
      totalAge: 0,
      maxAge: 0,
      totalFeeds: 0,
      totalPlays: 0,
      totalCures: 0,
      coinsEarned: 0,
      petsRaised: 0,
    };
  } catch (error) {
    console.error('Failed to load stats:', error);
    return {
      totalAge: 0,
      maxAge: 0,
      totalFeeds: 0,
      totalPlays: 0,
      totalCures: 0,
      coinsEarned: 0,
      petsRaised: 0,
    };
  }
}

// Reset game (new pet)
export function resetGame(currentState) {
  const lifetimeStats = updateLifetimeStats(currentState);
  
  // Add current pet to cemetery if dead
  if (!currentState.isAlive) {
    addToCemetery(currentState);
    lifetimeStats.petsRaised += 1;
  }
  
  const newState = createInitialState();
  newState.lifetimeStats = lifetimeStats;
  
  saveGame(newState);
  return newState;
}

// Check if save exists
export function hasSave() {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

// Export save data
export function exportSave() {
  const gameState = loadGame();
  const dataStr = JSON.stringify(gameState);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = 'tamagotchi_save.json';
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

// Import save data
export function importSave(jsonData) {
  try {
    const gameState = JSON.parse(jsonData);
    saveGame(gameState);
    return true;
  } catch (error) {
    console.error('Failed to import save:', error);
    return false;
  }
}