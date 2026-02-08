import { useState, useEffect, useCallback, useRef } from 'react';
import { createInitialState, saveGame, loadGame, resetGame, hasSave } from '../utils/saveSystem';
import {
  applyStatDecay,
  calculatePetState,
  calculateLifeStage,
  checkDeath,
  isNightTime,
  feedPet,
  playWithPet,
  cleanPet,
  giveMedicine,
  toggleSleep as toggleSleepUtil,
  checkAchievement,
} from '../utils/gameEngine';
import { GAME_CONFIG, LIFE_STAGES } from '../utils/gameConstants';
import soundManager from '../utils/soundEffects';

/**
 * Custom hook for managing game state
 */
export function useGameState() {
  const [gameState, setGameState] = useState(() => {
    const saved = loadGame();
    return saved || createInitialState();
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAchievement, setShowAchievement] = useState(null);
  const mountedRef = useRef(true);

  // Initialize sound on first user interaction
  const initSound = useCallback(() => {
    soundManager.init();
  }, []);

  // Game tick - runs every second
  const gameTick = useCallback(() => {
    if (!mountedRef.current) return;

    setGameState(prevState => {
      // Don't update if pet is dead
      if (!prevState.isAlive) return prevState;

      const now = new Date();
      const currentHour = now.getHours();
      const isNight = isNightTime(currentHour);

      // Apply stat decay
      const newStats = applyStatDecay(
        prevState.stats,
        prevState.isSleeping,
        isNight,
        prevState.decorations
      );

      // Calculate new age and life stage
      const newAge = prevState.age + 1;
      const newLifeStage = calculateLifeStage(newAge);

      // Calculate pet state
      const newPetState = calculatePetState(
        newStats,
        prevState.isSleeping
      );

      // Check for life stage change (hatching)
      const previousStage = prevState.lifeStage;
      if (previousStage === LIFE_STAGES.EGG && newLifeStage !== LIFE_STAGES.EGG) {
        // Just hatched!
        soundManager.playHatch();
      } else if (previousStage !== LIFE_STAGES.ADULT && newLifeStage === LIFE_STAGES.ADULT) {
        // Reached adulthood
        soundManager.playLevelUp();
      }

      // Check for death
      const deathCause = checkDeath(newStats, newAge);

      const newState = {
        ...prevState,
        stats: newStats,
        age: newAge,
        lifeStage: newLifeStage,
        petState: newPetState,
        isAlive: !deathCause,
        deathCause,
        deathTime: deathCause ? Date.now() : null,
      };

      // Auto-save on state change
      if (mountedRef.current) {
        saveGame(newState);
      }

      return newState;
    });

    setCurrentTime(new Date());
  }, []);

  // Feed pet
  const feed = useCallback((foodItem) => {
    if (!gameState.isAlive) return;

    setGameState(prev => {
      const newStats = feedPet(prev.stats, foodItem);
      const newInventory = {
        ...prev.inventory,
        food: prev.inventory.food.filter(item => item !== foodItem.id),
      };
      const newState = {
        ...prev,
        stats: newStats,
        inventory: newInventory,
        lifetimeStats: {
          ...prev.lifetimeStats,
          totalFeeds: prev.lifetimeStats.totalFeeds + 1,
        },
      };

      // Check achievement
      if (!prev.achievements.first_feed && newStats.hunger > 50) {
        newState.achievements = {
          ...prev.achievements,
          first_feed: true,
        };
        setShowAchievement('first_feed');
        soundManager.playAchievement();
      }

      saveGame(newState);
      return newState;
    });

    soundManager.playFeed();
  }, [gameState.isAlive]);

  // Play with pet
  const play = useCallback((toy) => {
    if (!gameState.isAlive || gameState.isSleeping) return;

    setGameState(prev => {
      const newStats = playWithPet(prev.stats, toy);
      const newInventory = {
        ...prev.inventory,
        toys: prev.inventory.toys.filter(item => item !== toy.id),
      };
      const newState = {
        ...prev,
        stats: newStats,
        inventory: newInventory,
        lifetimeStats: {
          ...prev.lifetimeStats,
          totalPlays: prev.lifetimeStats.totalPlays + 1,
        },
      };

      // Check achievement
      if (!prev.achievements.first_play) {
        newState.achievements = {
          ...prev.achievements,
          first_play: true,
        };
        setShowAchievement('first_play');
        soundManager.playAchievement();
      }

      saveGame(newState);
      return newState;
    });

    soundManager.playPlay();
  }, [gameState.isAlive, gameState.isSleeping]);

  // Clean pet
  const clean = useCallback(() => {
    if (!gameState.isAlive) return;

    setGameState(prev => {
      const newStats = cleanPet(prev.stats);
      const newState = {
        ...prev,
        stats: newStats,
        lifetimeStats: {
          ...prev.lifetimeStats,
          totalCures: prev.lifetimeStats.totalCures + 1,
        },
        totalCleans: prev.totalCleans + 1,
      };

      // Check achievement
      if (newState.totalCleans >= 10 && !prev.achievements.clean_freak) {
        newState.achievements = {
          ...prev.achievements,
          clean_freak: true,
        };
        setShowAchievement('clean_freak');
        soundManager.playAchievement();
      }

      saveGame(newState);
      return newState;
    });

    soundManager.playClean();
  }, [gameState.isAlive]);

  // Give medicine
  const cure = useCallback((medicine) => {
    if (!gameState.isAlive) return;

    setGameState(prev => {
      const newStats = giveMedicine(prev.stats, medicine);
      const newInventory = {
        ...prev.inventory,
        medicine: prev.inventory.medicine.filter(item => item !== medicine.id),
      };
      const newState = {
        ...prev,
        stats: newStats,
        inventory: newInventory,
        lifetimeStats: {
          ...prev.lifetimeStats,
          totalCures: prev.lifetimeStats.totalCures + 1,
        },
      };

      saveGame(newState);
      return newState;
    });

    soundManager.playMedicine();
  }, [gameState.isAlive]);

  // Toggle sleep
  const toggleSleep = useCallback(() => {
    if (!gameState.isAlive || gameState.lifeStage === LIFE_STAGES.EGG) return;

    setGameState(prev => {
      const newState = toggleSleepUtil(prev);

      if (newState.isSleeping) {
        soundManager.playSleep();
      } else {
        soundManager.playWake();
      }

      saveGame(newState);
      return newState;
    });
  }, [gameState.isAlive, gameState.lifeStage]);

  // Buy item
  const buyItem = useCallback((item, category) => {
    if (gameState.coins < item.cost) {
      soundManager.playError();
      return false;
    }

    setGameState(prev => {
      const newInventory = { ...prev.inventory };
      newInventory[category] = [...newInventory[category], item.id];

      const newState = {
        ...prev,
        coins: prev.coins - item.cost,
        inventory: newInventory,
        totalPurchases: prev.totalPurchases + 1,
      };

      // Check achievement
      if (newState.totalPurchases >= 5 && !prev.achievements.shopaholic) {
        newState.achievements = {
          ...prev.achievements,
          shopaholic: true,
        };
        setShowAchievement('shopaholic');
        soundManager.playAchievement();
      }

      saveGame(newState);
      return newState;
    });

    soundManager.playBuy();
    return true;
  }, [gameState.coins]);

  // Add decoration
  const addDecoration = useCallback((decoration) => {
    if (gameState.coins < decoration.cost) {
      soundManager.playError();
      return false;
    }

    if (gameState.decorations.includes(decoration.id)) {
      soundManager.playError();
      return false;
    }

    setGameState(prev => {
      const newState = {
        ...prev,
        coins: prev.coins - decoration.cost,
        decorations: [...prev.decorations, decoration.id],
        totalPurchases: prev.totalPurchases + 1,
      };

      saveGame(newState);
      return newState;
    });

    soundManager.playBuy();
    return true;
  }, [gameState.coins, gameState.decorations]);

  // Add coins
  const addCoins = useCallback((amount) => {
    setGameState(prev => {
      const newState = {
        ...prev,
        coins: prev.coins + amount,
        lifetimeStats: {
          ...prev.lifetimeStats,
          coinsEarned: prev.lifetimeStats.coinsEarned + amount,
        },
      };

      saveGame(newState);
      return newState;
    });

    soundManager.playCoin();
  }, []);

  // Win mini-game
  const winGame = useCallback(() => {
    setGameState(prev => {
      const newState = {
        ...prev,
        gamesWon: prev.gamesWon + 1,
        gamesPlayed: prev.gamesPlayed + 1,
      };

      // Check achievement
      if (newState.gamesWon >= 1 && !prev.achievements.game_master) {
        newState.achievements = {
          ...prev.achievements,
          game_master: true,
        };
        setShowAchievement('game_master');
      }

      saveGame(newState);
      return newState;
    });

    soundManager.playGameWin();
  }, []);

  // Lose mini-game
  const loseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
    }));

    saveGame(gameState);
    soundManager.playGameLose();
  }, [gameState]);

  // Reset game (new pet)
  const reset = useCallback(() => {
    soundManager.playDeath();
    const newState = resetGame(gameState);
    setGameState(newState);
  }, [gameState]);

  // Update time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (gameState.isAlive) {
        saveGame(gameState);
      }
    };
  }, [gameState]);

  // Check achievements periodically
  useEffect(() => {
    const checkAllAchievements = () => {
      setGameState(prev => {
        const newAchievements = { ...prev.achievements };
        let newUnlock = null;

        Object.keys(gameState.achievements).forEach(key => {
          if (!prev.achievements[key] && checkAchievement(key, prev)) {
            newAchievements[key] = true;
            newUnlock = key;
          }
        });

        if (newUnlock && newUnlock !== 'first_feed' && newUnlock !== 'first_play' && newUnlock !== 'clean_freak' && newUnlock !== 'shopaholic' && newUnlock !== 'game_master') {
          setShowAchievement(newUnlock);
          soundManager.playAchievement();
        }

        if (newUnlock) {
          saveGame({ ...prev, achievements: newAchievements });
          return { ...prev, achievements: newAchievements };
        }

        return prev;
      });
    };

    const checkInterval = setInterval(checkAllAchievements, 10000);
    return () => clearInterval(checkInterval);
  }, [gameState]);

  return {
    gameState,
    currentTime,
    showAchievement,
    setShowAchievement,
    initSound,
    gameTick,
    feed,
    play,
    clean,
    cure,
    toggleSleep,
    buyItem,
    addDecoration,
    addCoins,
    winGame,
    loseGame,
    reset,
    hasSave: hasSave(),
  };
}