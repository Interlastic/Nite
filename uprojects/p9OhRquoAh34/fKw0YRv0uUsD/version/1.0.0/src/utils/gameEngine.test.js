import {
  calculatePetState,
  calculateLifeStage,
  checkDeath,
  applyStatDecay,
  feedPet,
  playWithPet,
  cleanPet,
  giveMedicine,
  toggleSleep,
  checkAchievement,
  getStatColor,
} from './gameEngine';
import {
  PET_STATES,
  LIFE_STAGES,
  GAME_CONFIG,
  AGE_THRESHOLDS,
  DEATH_CONDITIONS,
  ACHIEVEMENTS,
  STAT_DECAY_RATES,
} from './gameConstants';

describe('Game Engine', () => {
  describe('calculatePetState', () => {
    test('returns sleeping state when pet is sleeping', () => {
      const stats = {
        hunger: 50,
        happiness: 50,
        energy: 50,
        health: 50,
        cleanliness: 50,
      };
      expect(calculatePetState(stats, true)).toBe(PET_STATES.SLEEPING);
    });

    test('returns dead state when health is 0', () => {
      const stats = {
        hunger: 50,
        happiness: 50,
        energy: 50,
        health: 0,
        cleanliness: 50,
      };
      expect(calculatePetState(stats, false)).toBe(PET_STATES.DEAD);
    });

    test('returns hungry state when hunger is critical', () => {
      const stats = {
        hunger: 10,
        happiness: 50,
        energy: 50,
        health: 50,
        cleanliness: 50,
      };
      expect(calculatePetState(stats, false)).toBe(PET_STATES.HUNGRY);
    });

    test('returns sick state when health is critical', () => {
      const stats = {
        hunger: 50,
        happiness: 50,
        energy: 50,
        health: 10,
        cleanliness: 50,
      };
      expect(calculatePetState(stats, false)).toBe(PET_STATES.SICK);
    });

    test('returns happy state when all stats are good', () => {
      const stats = {
        hunger: 80,
        happiness: 80,
        energy: 80,
        health: 80,
        cleanliness: 80,
      };
      expect(calculatePetState(stats, false)).toBe(PET_STATES.HAPPY);
    });

    test('returns sad state when happiness is critical', () => {
      const stats = {
        hunger: 50,
        happiness: 10,
        energy: 50,
        health: 50,
        cleanliness: 50,
      };
      expect(calculatePetState(stats, false)).toBe(PET_STATES.SAD);
    });

    test('returns idle state by default', () => {
      const stats = {
        hunger: 50,
        happiness: 50,
        energy: 50,
        health: 50,
        cleanliness: 50,
      };
      expect(calculatePetState(stats, false)).toBe(PET_STATES.IDLE);
    });
  });

  describe('calculateLifeStage', () => {
    test('returns egg stage for age 0', () => {
      expect(calculateLifeStage(0)).toBe(LIFE_STAGES.EGG);
    });

    test('returns egg stage for age below threshold', () => {
      expect(calculateLifeStage(AGE_THRESHOLDS[LIFE_STAGES.BABY] - 1)).toBe(LIFE_STAGES.EGG);
    });

    test('returns baby stage after egg threshold', () => {
      expect(calculateLifeStage(AGE_THRESHOLDS[LIFE_STAGES.BABY])).toBe(LIFE_STAGES.BABY);
    });

    test('returns child stage after baby threshold', () => {
      expect(calculateLifeStage(AGE_THRESHOLDS[LIFE_STAGES.CHILD])).toBe(LIFE_STAGES.CHILD);
    });

    test('returns adult stage after child threshold', () => {
      expect(calculateLifeStage(AGE_THRESHOLDS[LIFE_STAGES.ADULT])).toBe(LIFE_STAGES.ADULT);
    });
  });

  describe('checkDeath', () => {
    test('returns null when pet is healthy', () => {
      const stats = {
        hunger: 50,
        happiness: 50,
        energy: 50,
        health: 50,
        cleanliness: 50,
      };
      expect(checkDeath(stats, 100)).toBe(null);
    });

    test('returns starved when hunger is 0', () => {
      const stats = {
        hunger: 0,
        happiness: 50,
        energy: 50,
        health: 50,
        cleanliness: 50,
      };
      expect(checkDeath(stats, 100)).toBe('starved');
    });

    test('returns illness when health is 0', () => {
      const stats = {
        hunger: 50,
        happiness: 50,
        energy: 50,
        health: 0,
        cleanliness: 50,
      };
      expect(checkDeath(stats, 100)).toBe('illness');
    });

    test('returns neglect when happiness is 0 and age is high', () => {
      const stats = {
        hunger: 50,
        happiness: 0,
        energy: 50,
        health: 50,
        cleanliness: 50,
      };
      expect(checkDeath(stats, 100)).toBe('neglect');
    });

    test('returns old_age when age exceeds max', () => {
      const stats = {
        hunger: 50,
        happiness: 50,
        energy: 50,
        health: 50,
        cleanliness: 50,
      };
      expect(checkDeath(stats, DEATH_CONDITIONS.MAX_AGE + 1)).toBe('old_age');
    });
  });

  describe('applyStatDecay', () => {
    test('decays hunger stat', () => {
      const stats = {
        hunger: 80,
        happiness: 80,
        energy: 80,
        health: 80,
        cleanliness: 80,
      };
      const result = applyStatDecay(stats, false, false, []);
      expect(result.hunger).toBeLessThan(stats.hunger);
    });

    test('recovers energy when sleeping', () => {
      const stats = {
        hunger: 80,
        happiness: 80,
        energy: 50,
        health: 80,
        cleanliness: 80,
      };
      const result = applyStatDecay(stats, true, false, []);
      expect(result.energy).toBeGreaterThan(stats.energy);
    });

    test('decays energy when awake', () => {
      const stats = {
        hunger: 80,
        happiness: 80,
        energy: 80,
        health: 80,
        cleanliness: 80,
      };
      const result = applyStatDecay(stats, false, false, []);
      expect(result.energy).toBeLessThan(stats.energy);
    });

    test('does not let stats go below 0', () => {
      const stats = {
        hunger: 0,
        happiness: 0,
        energy: 0,
        health: 0,
        cleanliness: 0,
      };
      const result = applyStatDecay(stats, false, false, []);
      Object.values(result).forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
      });
    });

    test('does not let stats go above 100', () => {
      const stats = {
        hunger: 100,
        happiness: 100,
        energy: 100,
        health: 100,
        cleanliness: 100,
      };
      const result = applyStatDecay(stats, true, false, []);
      Object.values(result).forEach(value => {
        expect(value).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('feedPet', () => {
    test('increases hunger stat', () => {
      const stats = {
        hunger: 50,
        happiness: 50,
        energy: 50,
        health: 50,
        cleanliness: 50,
      };
      const foodItem = { hungerRestore: 20 };
      const result = feedPet(stats, foodItem);
      expect(result.hunger).toBe(70);
    });

    test('caps hunger at 100', () => {
      const stats = {
        hunger: 90,
        happiness: 50,
        energy: 50,
        health: 50,
        cleanliness: 50,
      };
      const foodItem = { hungerRestore: 20 };
      const result = feedPet(stats, foodItem);
      expect(result.hunger).toBe(100);
    });

    test('increases health if food provides it', () => {
      const stats = {
        hunger: 50,
        happiness: 50,
        energy: 50,
        health: 50,
        cleanliness: 50,
      };
      const foodItem = { hungerRestore: 10, healthRestore: 5 };
      const result = feedPet(stats, foodItem);
      expect(result.health).toBe(55);
    });
  });

  describe('playWithPet', () => {
    test('increases happiness', () => {
      const stats = {
        hunger: 50,
        happiness: 50,
        energy: 50,
        health: 50,
        cleanliness: 50,
      };
      const toy = { happinessRestore: 20 };
      const result = playWithPet(stats, toy);
      expect(result.happiness).toBe(70);
    });

    test('decreases energy', () => {
      const stats = {
        hunger: 50,
        happiness: 50,
        energy: 80,
        health: 50,
        cleanliness: 50,
      };
      const toy = { happinessRestore: 20, energyCost: 10 };
      const result = playWithPet(stats, toy);
      expect(result.energy).toBe(70);
    });
  });

  describe('cleanPet', () => {
    test('sets cleanliness to 100', () => {
      const stats = {
        hunger: 50,
        happiness: 50,
        energy: 50,
        health: 50,
        cleanliness: 30,
      };
      const result = cleanPet(stats);
      expect(result.cleanliness).toBe(100);
    });

    test('increases happiness slightly', () => {
      const stats = {
        hunger: 50,
        happiness: 50,
        energy: 50,
        health: 50,
        cleanliness: 30,
      };
      const result = cleanPet(stats);
      expect(result.happiness).toBe(55);
    });
  });

  describe('giveMedicine', () => {
    test('increases health', () => {
      const stats = {
        hunger: 50,
        happiness: 50,
        energy: 50,
        health: 30,
        cleanliness: 50,
      };
      const medicine = { healthRestore: 30 };
      const result = giveMedicine(stats, medicine);
      expect(result.health).toBe(60);
    });

    test('caps health at 100', () => {
      const stats = {
        hunger: 50,
        happiness: 50,
        energy: 50,
        health: 80,
        cleanliness: 50,
      };
      const medicine = { healthRestore: 30 };
      const result = giveMedicine(stats, medicine);
      expect(result.health).toBe(100);
    });
  });

  describe('toggleSleep', () => {
    test('toggles isSleeping state', () => {
      const gameState = {
        isSleeping: false,
        other: 'data',
      };
      const result = toggleSleep(gameState);
      expect(result.isSleeping).toBe(true);
      expect(result.other).toBe('data');
    });
  });

  describe('getStatColor', () => {
    test('returns red for critical stats', () => {
      expect(getStatColor(15)).toBe('#e74c3c');
    });

    test('returns orange for warning stats', () => {
      expect(getStatColor(30)).toBe('#f39c12');
    });

    test('returns green for good stats', () => {
      expect(getStatColor(80)).toBe('#2ecc71');
    });
  });
});