import {
  createInitialState,
  saveGame,
  loadGame,
  deleteSave,
  resetGame,
  hasSave,
  addToCemetery,
  loadCemetery,
} from './saveSystem';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Save System', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('createInitialState', () => {
    test('creates initial game state with default values', () => {
      const state = createInitialState();
      expect(state).toHaveProperty('petName');
      expect(state).toHaveProperty('lifeStage');
      expect(state).toHaveProperty('stats');
      expect(state).toHaveProperty('coins');
      expect(state.isAlive).toBe(true);
    });

    test('has all required stat properties', () => {
      const state = createInitialState();
      expect(state.stats).toHaveProperty('hunger');
      expect(state.stats).toHaveProperty('happiness');
      expect(state.stats).toHaveProperty('energy');
      expect(state.stats).toHaveProperty('health');
      expect(state.stats).toHaveProperty('cleanliness');
    });

    test('has inventory', () => {
      const state = createInitialState();
      expect(state).toHaveProperty('inventory');
      expect(state.inventory).toHaveProperty('food');
      expect(state.inventory).toHaveProperty('toys');
      expect(state.inventory).toHaveProperty('medicine');
    });

    test('has coins', () => {
      const state = createInitialState();
      expect(typeof state.coins).toBe('number');
      expect(state.coins).toBeGreaterThan(0);
    });
  });

  describe('saveGame and loadGame', () => {
    test('saves game state to localStorage', () => {
      const state = createInitialState();
      const result = saveGame(state);
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    test('loads saved game state from localStorage', () => {
      const state = createInitialState();
      state.petName = 'TestPet';
      saveGame(state);
      const loaded = loadGame();
      expect(loaded.petName).toBe('TestPet');
    });

    test('returns null when no save exists', () => {
      const loaded = loadGame();
      expect(loaded).toBe(null);
    });

    test('preserves complex data structures', () => {
      const state = createInitialState();
      state.inventory.food = ['apple', 'burger'];
      state.achievements = { first_feed: true };
      saveGame(state);
      const loaded = loadGame();
      expect(loaded.inventory.food).toEqual(['apple', 'burger']);
      expect(loaded.achievements.first_feed).toBe(true);
    });
  });

  describe('deleteSave', () => {
    test('deletes saved game from localStorage', () => {
      const state = createInitialState();
      saveGame(state);
      const result = deleteSave();
      expect(result).toBe(true);
      expect(localStorageMock.removeItem).toHaveBeenCalled();
    });

    test('loaded state is null after deletion', () => {
      const state = createInitialState();
      saveGame(state);
      deleteSave();
      const loaded = loadGame();
      expect(loaded).toBe(null);
    });
  });

  describe('hasSave', () => {
    test('returns false when no save exists', () => {
      expect(hasSave()).toBe(false);
    });

    test('returns true when save exists', () => {
      const state = createInitialState();
      saveGame(state);
      expect(hasSave()).toBe(true);
    });
  });

  describe('resetGame', () => {
    test('creates new game state', () => {
      const oldState = createInitialState();
      oldState.petName = 'OldPet';
      const newState = resetGame(oldState);
      expect(newState.petName).not.toBe('OldPet');
    });

    test('preserves lifetime stats', () => {
      const oldState = createInitialState();
      oldState.lifetimeStats.totalFeeds = 10;
      const newState = resetGame(oldState);
      expect(newState.lifetimeStats.totalFeeds).toBe(10);
    });
  });

  describe('Cemetery', () => {
    test('adds pet to cemetery', () => {
      const pet = {
        name: 'TestPet',
        age: 100,
        deathCause: 'old_age',
        deathTime: Date.now(),
        lifeStage: 'adult',
      };
      const result = addToCemetery(pet);
      expect(result).toBe(true);
    });

    test('loads cemetery data', () => {
      const pet = {
        name: 'TestPet',
        age: 100,
        deathCause: 'old_age',
        deathTime: Date.now(),
        lifeStage: 'adult',
      };
      addToCemetery(pet);
      const cemetery = loadCemetery();
      expect(cemetery).toHaveLength(1);
      expect(cemetery[0].name).toBe('TestPet');
    });

    test('returns empty array when cemetery is empty', () => {
      const cemetery = loadCemetery();
      expect(cemetery).toEqual([]);
    });

    test('adds multiple pets to cemetery', () => {
      const pet1 = {
        name: 'Pet1',
        age: 50,
        deathCause: 'starved',
        deathTime: Date.now(),
        lifeStage: 'child',
      };
      const pet2 = {
        name: 'Pet2',
        age: 100,
        deathCause: 'old_age',
        deathTime: Date.now(),
        lifeStage: 'adult',
      };
      addToCemetery(pet1);
      addToCemetery(pet2);
      const cemetery = loadCemetery();
      expect(cemetery).toHaveLength(2);
    });
  });
});